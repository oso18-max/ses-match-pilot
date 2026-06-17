const fs = require("node:fs");
const path = require("node:path");
const { classifyMail, textParts } = require("./mail-classifier.cjs");
const { collectSendableRows } = require("./matching-runner.cjs");
const { importCustomersFromCsv } = require("./customer-csv-importer.cjs");

const inboxPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, "sample-mail-inbox.json");
const customerCsvPath = process.argv[3] ? path.resolve(process.argv[3]) : null;

const knownSkills = [
  "Java",
  "Spring Boot",
  "PostgreSQL",
  "AWS",
  "React",
  "TypeScript",
  "Next.js",
  "Python",
  "SQL"
];

const defaultCustomers = [
  {
    id: "customer_001",
    company: "株式会社アルファ",
    person: "田中",
    email: "tanaka@alpha.example.invalid",
    sendable: true,
    ngSkills: [],
    ngConditions: []
  },
  {
    id: "customer_002",
    company: "ベータソリューションズ株式会社",
    person: "採用ご担当者",
    email: "ses@beta.example.invalid",
    sendable: true,
    ngSkills: ["常駐のみ"],
    ngConditions: ["単価70万円超NG"]
  },
  {
    id: "customer_003",
    company: "株式会社ガンマ",
    person: "佐藤",
    email: "sato@gamma.example.invalid",
    sendable: false,
    ngSkills: [],
    ngConditions: ["送信停止中"]
  },
  {
    id: "customer_004",
    company: "デルタテック株式会社",
    person: "山本",
    email: "yamamoto@delta.example.invalid",
    sendable: true,
    ngSkills: ["Python"],
    ngConditions: []
  }
];

function readInbox(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function joinedText(mail) {
  const parts = textParts(mail);
  return `${parts.subject}\n${parts.body}\n${parts.attachmentName}\n${parts.attachmentText}`;
}

function extractSkills(text) {
  return knownSkills.filter((skill) => text.includes(skill));
}

function extractUnit(text) {
  const match = text.match(/(\d{2,3})\s*万円/);
  return match ? Number(match[1]) : null;
}

function extractStart(text) {
  if (text.includes("即日")) return "即日";
  if (text.includes("来月")) return "来月";
  if (text.includes("翌々月")) return "翌々月";
  return "不明";
}

function extractLocation(text) {
  if (text.includes("東京")) return "東京";
  if (text.includes("大阪")) return "大阪";
  if (text.includes("福岡")) return "福岡";
  return "不明";
}

function extractWorkStyle(text) {
  if (text.includes("フルリモート")) return "フルリモート";
  if (text.includes("リモート")) return "リモート";
  if (text.includes("常駐")) return "常駐";
  return "不明";
}

function isRemoteOnly(workStyle) {
  return workStyle === "フルリモート" || workStyle === "リモート";
}

function remoteLocationReason(workStyle, location) {
  return location === "不明" && isRemoteOnly(workStyle)
    ? "リモート可のため勤務地不足扱いなし"
    : null;
}

function inferRole(skills) {
  if (skills.includes("Java")) return "Javaバックエンド";
  if (skills.includes("React")) return "Reactフロント";
  if (skills.includes("Python")) return "Pythonデータ処理";
  return "未抽出";
}

function requestMissingFields(request) {
  const missing = [];
  if (request.extracted.role === "未抽出") missing.push("職種");
  if (!request.extracted.required.length) missing.push("必須スキル");
  if (!request.extracted.unitMax) missing.push("単価");
  if (request.extracted.start === "不明") missing.push("開始時期");
  if (request.extracted.location === "不明" && !isRemoteOnly(request.extracted.workStyle)) missing.push("勤務地");
  return missing;
}

function talentMissingFields(talent) {
  const missing = [];
  if (talent.role === "未抽出") missing.push("職種");
  if (!talent.skills.length) missing.push("スキル");
  if (talent.unit === 999) missing.push("希望単価");
  if (talent.available === "不明") missing.push("稼働時期");
  if (talent.location === "不明" && !isRemoteOnly(talent.workStyle)) missing.push("勤務地");
  return missing;
}

function extractRequest(mail, index) {
  const text = joinedText(mail);
  const skills = extractSkills(text);
  const location = extractLocation(text);
  const workStyle = extractWorkStyle(text);
  const remoteReason = remoteLocationReason(workStyle, location);
  const request = {
    id: `ingested_req_${String(index + 1).padStart(3, "0")}`,
    sourceMailId: mail.id,
    subject: mail.subject,
    extracted: {
      role: inferRole(skills),
      required: skills.slice(0, 3),
      nice: skills.slice(3),
      unitMax: extractUnit(text) || 0,
      start: extractStart(text),
      location,
      workStyle
    },
    extractionReasons: [
      `skills=${skills.join("/") || "未抽出"}`,
      `unit=${extractUnit(text) || "未抽出"}`,
      `start=${extractStart(text)}`,
      `location=${location}`,
      remoteReason
    ].filter(Boolean)
  };
  request.missingFields = requestMissingFields(request);
  return request;
}

function extractTalent(mail, index) {
  const text = joinedText(mail);
  const skills = extractSkills(text);
  const location = extractLocation(text);
  const workStyle = extractWorkStyle(text);
  const remoteReason = remoteLocationReason(workStyle, location);
  const talent = {
    id: `ingested_talent_${String(index + 1).padStart(3, "0")}`,
    sourceMailId: mail.id,
    code: `ingested_engineer_${String(index + 1).padStart(3, "0")}`,
    role: inferRole(skills),
    skills,
    unit: extractUnit(text) || 999,
    available: extractStart(text),
    location,
    workStyle,
    extractionReasons: [
      `skills=${skills.join("/") || "未抽出"}`,
      `unit=${extractUnit(text) || "未抽出"}`,
      `available=${extractStart(text)}`,
      `location=${location}`,
      remoteReason
    ].filter(Boolean)
  };
  talent.missingFields = talentMissingFields(talent);
  return talent;
}

function buildScenario(mails, options = {}) {
  const classifications = mails.map(classifyMail);
  const requests = [];
  const talents = [];
  const pending = [];
  const customers = options.customers || defaultCustomers;

  mails.forEach((mail, index) => {
    const classification = classifications[index];
    if (classification.type === "案件" || classification.type === "複合") {
      const request = extractRequest(mail, requests.length);
      if (request.missingFields.includes("必須スキル") || request.missingFields.includes("単価")) {
        pending.push({
          id: mail.id,
          subject: mail.subject,
          type: "抽出不足",
          reason: `案件不足: ${request.missingFields.join(" / ")}`
        });
      } else {
        requests.push(request);
      }
    }
    if (classification.type === "人材" || classification.type === "複合") {
      const talent = extractTalent(mail, talents.length);
      if (talent.missingFields.includes("スキル") || talent.missingFields.includes("希望単価")) {
        pending.push({
          id: mail.id,
          subject: mail.subject,
          type: "抽出不足",
          reason: `人材不足: ${talent.missingFields.join(" / ")}`
        });
      } else {
        talents.push(talent);
      }
    }
    if (classification.type === "その他" || classification.type === "判定不能") {
      pending.push({
        id: mail.id,
        subject: mail.subject,
        type: classification.type,
        reason: classification.reasons
      });
    }
  });

  return {
    settings: { sendThreshold: 80, maxSendPerTalent: 3 },
    classifications,
    requests,
    talents,
    customers,
    pending
  };
}

function run() {
  const mails = readInbox(inboxPath);
  let customers = defaultCustomers;
  if (customerCsvPath) {
    const imported = importCustomersFromCsv(fs.readFileSync(customerCsvPath, "utf8"));
    if (!imported.accepted) {
      console.log(`Customer CSV rejected: ${path.basename(customerCsvPath)}`);
      console.table(imported.errors);
      process.exit(1);
    }
    customers = imported.customers;
  }

  const scenario = buildScenario(mails, { customers });
  const rows = collectSendableRows(scenario.requests, scenario.talents, scenario.customers, scenario.settings);
  const sendableRows = rows.filter((row) => row.sendStatus === "未送信候補");

  console.log(`Inbox: ${path.basename(inboxPath)}`);
  console.log(`分類: ${scenario.classifications.length}件 / 案件: ${scenario.requests.length}件 / 人材: ${scenario.talents.length}件 / 保留: ${scenario.pending.length}件`);
  console.table(scenario.classifications.map((item) => ({
    id: item.id,
    type: item.type,
    location: item.location,
    subject: item.subject
  })));
  console.log(`未送信候補: ${sendableRows.length}件`);
  console.table(sendableRows.map((row) => ({
    request: row.request,
    talent: row.talent,
    company: row.company,
    score: row.score,
    rank: row.rank
  })));
  console.log("抽出不足");
  console.table([
    ...scenario.requests.map((request) => ({
      id: request.id,
      source: request.sourceMailId,
      kind: "案件",
      missing: request.missingFields.join(" / ") || "なし"
    })),
    ...scenario.talents.map((talent) => ({
      id: talent.id,
      source: talent.sourceMailId,
      kind: "人材",
      missing: talent.missingFields.join(" / ") || "なし"
    }))
  ]);
  console.log(`保留: ${scenario.pending.length}件`);
  console.table(scenario.pending);
}

if (require.main === module) run();

module.exports = {
  buildScenario,
  extractRequest,
  extractTalent,
  requestMissingFields,
  talentMissingFields,
  isRemoteOnly
};

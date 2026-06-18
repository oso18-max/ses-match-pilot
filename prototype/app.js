const state = {
  view: "overview",
  query: "",
  selectedRequestId: null,
  selectedTalentId: "talent_001",
  autoSend: false,
  sendThreshold: 80,
  maxSendPerTalent: 3,
  showMatchSettings: false,
  showUnsentQueue: true,
  sentProposalIds: [],
  companyTest: {
    requestText: `Java/Spring Boot案件
必須: Java, Spring Boot, PostgreSQL
尚可: AWS
単価: 70万
勤務地: 東京
稼働: 即日
働き方: 週3リモート`,
    talentText: `Javaバックエンドエンジニア
スキル: Java, Spring Boot, PostgreSQL, AWS
希望単価: 68万
勤務地: 東京
稼働: 即日
働き方: 週3リモート可`,
    customerCsv: `company,person,email,sendable,ngSkills,ngConditions
株式会社アルファ,田中,tanaka@alpha.example.invalid,送信可,,
ベータソリューションズ株式会社,採用担当,ses@beta.example.invalid,送信可,常駐のみ,単価70万円超NG
株式会社ガンマ,佐藤,sato@gamma.example.invalid,停止,,`,
    result: null,
    history: [],
    feedbackText: "",
    feedbackChecks: {
      score: false,
      exclusion: false,
      mail: false
    },
    errors: []
  }
};

const publicViews = new Set([
  "overview",
  "inbox",
  "matches",
  "sheets",
  "customers",
  "send",
  "history",
  "replies",
  "test",
  "companyTest",
  "settings"
]);

const companyTestSample = {
  requestText: state.companyTest.requestText,
  talentText: state.companyTest.talentText,
  customerCsv: state.companyTest.customerCsv
};

const companyTestPresets = {
  java: companyTestSample,
  react: {
    requestText: `React管理画面案件
必須: React, TypeScript
尚可: Next.js, AWS
単価: 75万
勤務地: 大阪
稼働: 来月
働き方: フルリモート`,
    talentText: `Reactフロントエンドエンジニア
スキル: React, TypeScript, Next.js, AWS
希望単価: 72万
勤務地: 大阪
稼働: 来月
働き方: フルリモート可`,
    customerCsv: companyTestSample.customerCsv
  },
  python: {
    requestText: `Pythonバッチ改修案件
必須: Python, SQL
尚可: PostgreSQL
単価: 65万
勤務地: 福岡
稼働: 来月
働き方: 常駐`,
    talentText: `Pythonデータ処理エンジニア
スキル: Python, SQL, PostgreSQL, ETL
希望単価: 66万
勤務地: 福岡
稼働: 来月
働き方: 常駐可`,
    customerCsv: companyTestSample.customerCsv
  }
};

const requestTtlDays = 7;
const talentTtlDays = 7;

const skillSheets = [
  {
    id: "talent_001",
    code: "engineer_001",
    role: "Javaバックエンド",
    sourceFile: "engineer_001_skill.xlsx",
    fileType: "Excel",
    skills: ["Java", "Spring Boot", "PostgreSQL", "AWS"],
    unit: 68,
    available: "即日",
    location: "東京",
    workStyle: "週3リモート可",
    updatedAt: "2026-06-16",
    validUntil: "2026-06-23",
    status: "提案可"
  },
  {
    id: "talent_002",
    code: "engineer_002",
    role: "Reactフロント",
    sourceFile: "engineer_002_profile.docx",
    fileType: "Word",
    skills: ["React", "TypeScript", "Next.js", "AWS"],
    unit: 72,
    available: "来月",
    location: "大阪",
    workStyle: "フルリモート可",
    updatedAt: "2026-06-15",
    validUntil: "2026-06-22",
    status: "提案可"
  },
  {
    id: "talent_003",
    code: "engineer_003",
    role: "Pythonデータ処理",
    sourceFile: "engineer_003_resume.pdf",
    fileType: "テキストPDF",
    skills: ["Python", "SQL", "PostgreSQL", "ETL"],
    unit: 66,
    available: "翌々月",
    location: "福岡",
    workStyle: "常駐可",
    updatedAt: "2026-06-10",
    validUntil: "2026-06-17",
    status: "期限注意"
  }
];

const incomingRequests = [
  {
    id: "req_001",
    receivedAt: "2026-06-17 09:12",
    fromCompany: "company_101",
    fromAddress: "bp101@example.invalid",
    subject: "【急募】Java/Spring 案件 即日 70万円",
    attachment: "java_spring_project.xlsx",
    fileType: "Excel",
    extracted: {
      role: "Javaバックエンド",
      required: ["Java", "Spring Boot", "PostgreSQL"],
      nice: ["AWS"],
      unitMax: 70,
      start: "即日",
      location: "東京",
      workStyle: "週3リモート"
    },
    validUntil: "2026-06-24",
    status: "マッチング済み"
  },
  {
    id: "req_002",
    receivedAt: "2026-06-17 10:05",
    fromCompany: "company_203",
    fromAddress: "bp203@example.invalid",
    subject: "React 管理画面 フルリモート 来月開始",
    attachment: "react_requirement.docx",
    fileType: "Word",
    extracted: {
      role: "Reactフロント",
      required: ["React", "TypeScript"],
      nice: ["Next.js", "AWS"],
      unitMax: 75,
      start: "来月",
      location: "大阪",
      workStyle: "フルリモート"
    },
    validUntil: "2026-06-24",
    status: "マッチング済み"
  },
  {
    id: "req_003",
    receivedAt: "2026-06-17 11:18",
    fromCompany: "company_305",
    fromAddress: "bp305@example.invalid",
    subject: "Python バッチ改修 常駐案件",
    attachment: "python_batch.pdf",
    fileType: "テキストPDF",
    extracted: {
      role: "Pythonデータ処理",
      required: ["Python", "SQL"],
      nice: ["PostgreSQL"],
      unitMax: 62,
      start: "翌々月",
      location: "福岡",
      workStyle: "常駐"
    },
    validUntil: "2026-06-24",
    status: "確認必要"
  }
];

const customers = [
  {
    id: "customer_001",
    company: "株式会社アルファ",
    person: "田中",
    honorific: "様",
    email: "tanaka@alpha.example.invalid",
    sendable: true,
    ngSkills: [],
    ngConditions: [],
    templateGroup: "標準"
  },
  {
    id: "customer_002",
    company: "ベータソリューションズ株式会社",
    person: "採用ご担当者",
    honorific: "様",
    email: "ses@beta.example.invalid",
    sendable: true,
    ngSkills: ["常駐のみ"],
    ngConditions: ["単価70万円超NG"],
    templateGroup: "丁寧"
  },
  {
    id: "customer_003",
    company: "株式会社ガンマ",
    person: "佐藤",
    honorific: "様",
    email: "sato@gamma.example.invalid",
    sendable: false,
    ngSkills: [],
    ngConditions: ["送信停止中"],
    templateGroup: "停止"
  },
  {
    id: "customer_004",
    company: "デルタテック株式会社",
    person: "山本",
    honorific: "様",
    email: "yamamoto@delta.example.invalid",
    sendable: true,
    ngSkills: ["Python"],
    ngConditions: [],
    templateGroup: "標準"
  }
];

const histories = [
  {
    id: "hist_001",
    sentAt: "2026-06-16 15:20",
    company: "株式会社アルファ",
    email: "tanaka@alpha.example.invalid",
    request: "Java/Spring 案件",
    talent: "engineer_001",
    status: "返信待ち",
    subject: "Javaエンジニアのご提案"
  },
  {
    id: "hist_002",
    sentAt: "2026-06-16 16:10",
    company: "ベータソリューションズ株式会社",
    email: "ses@beta.example.invalid",
    request: "React 管理画面",
    talent: "engineer_002",
    status: "返信あり",
    subject: "React人材のご提案"
  }
];

const replies = [
  {
    id: "reply_001",
    receivedAt: "2026-06-17 09:40",
    from: "ses@beta.example.invalid",
    subject: "Re: React人材のご提案",
    linkedHistory: "hist_002",
    detected: "メールアドレス + 件名一致",
    nextAction: "面談候補日を送る"
  },
  {
    id: "reply_002",
    receivedAt: "2026-06-17 11:30",
    from: "unknown@example.invalid",
    subject: "Re: Java案件について",
    linkedHistory: "未確定",
    detected: "案件名らしき語句のみ一致",
    nextAction: "手動確認"
  }
];

const templates = [
  "いつもお世話になっております。下記人材をご提案いたします。",
  "お世話になっております。貴社案件に近い人材がおりますのでご共有いたします。",
  "いつもありがとうございます。条件に合いそうな技術者をご紹介いたします。",
  "お世話になっております。直近稼働可能な候補者についてご連絡いたします。"
];

function normalize(value) {
  return String(value || "").toLowerCase();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function saveCompanyTestDraft() {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem("sesAutoSendCompanyTest", JSON.stringify({
    requestText: state.companyTest.requestText,
    talentText: state.companyTest.talentText,
    customerCsv: state.companyTest.customerCsv,
    feedbackText: state.companyTest.feedbackText,
    feedbackChecks: state.companyTest.feedbackChecks,
    history: state.companyTest.history
  }));
}

function loadCompanyTestDraft() {
  if (typeof localStorage === "undefined") return;
  const saved = localStorage.getItem("sesAutoSendCompanyTest");
  if (!saved) return;
  try {
    const draft = JSON.parse(saved);
    state.companyTest.requestText = draft.requestText || state.companyTest.requestText;
    state.companyTest.talentText = draft.talentText || state.companyTest.talentText;
    state.companyTest.customerCsv = draft.customerCsv || state.companyTest.customerCsv;
    state.companyTest.feedbackText = draft.feedbackText || "";
    state.companyTest.feedbackChecks = { ...state.companyTest.feedbackChecks, ...(draft.feedbackChecks || {}) };
    state.companyTest.history = Array.isArray(draft.history) ? draft.history.slice(0, 10) : [];
  } catch {
    localStorage.removeItem("sesAutoSendCompanyTest");
  }
}

function updateCompanyTestField(field, value) {
  state.companyTest[field] = value;
  state.companyTest.errors = [];
  saveCompanyTestDraft();
}

function updateCompanyTestFeedbackCheck(field, checked) {
  state.companyTest.feedbackChecks[field] = checked;
  saveCompanyTestDraft();
}

function resetCompanyTestSample() {
  state.companyTest.requestText = companyTestSample.requestText;
  state.companyTest.talentText = companyTestSample.talentText;
  state.companyTest.customerCsv = companyTestSample.customerCsv;
  state.companyTest.result = null;
  state.companyTest.history = [];
  state.companyTest.errors = [];
  saveCompanyTestDraft();
  render();
}

function applyCompanyTestPreset(key) {
  const preset = companyTestPresets[key] || companyTestSample;
  state.companyTest.requestText = preset.requestText;
  state.companyTest.talentText = preset.talentText;
  state.companyTest.customerCsv = preset.customerCsv;
  state.companyTest.result = null;
  state.companyTest.errors = [];
  saveCompanyTestDraft();
  render();
}

function clearCompanyTestInput() {
  state.companyTest.requestText = "";
  state.companyTest.talentText = "";
  state.companyTest.customerCsv = "company,person,email,sendable,ngSkills,ngConditions\n";
  state.companyTest.result = null;
  state.companyTest.feedbackText = "";
  state.companyTest.feedbackChecks = { score: false, exclusion: false, mail: false };
  state.companyTest.errors = [];
  saveCompanyTestDraft();
  render();
}

function extractKnownSkills(text) {
  const skills = [
    "Java", "Spring Boot", "PostgreSQL", "AWS", "React", "TypeScript",
    "Next.js", "Python", "SQL", "ETL", "PHP", "Laravel", "Vue", "Node.js"
  ];
  return skills.filter((skill) => text.toLowerCase().includes(skill.toLowerCase()));
}

function extractUnit(text, fallback) {
  const matched = String(text).match(/(\d{2,3})\s*万/);
  return matched ? Number(matched[1]) : fallback;
}

function extractLocation(text) {
  const locations = ["東京", "大阪", "福岡", "名古屋", "札幌", "仙台", "横浜", "リモート"];
  return locations.find((location) => text.includes(location)) || "不明";
}

function extractWorkStyle(text) {
  if (text.includes("フルリモート")) return "フルリモート";
  if (text.includes("リモート")) return "リモート可";
  if (text.includes("常駐")) return "常駐";
  return "不明";
}

function extractStart(text) {
  if (text.includes("即日")) return "即日";
  if (text.includes("来月")) return "来月";
  if (text.includes("翌月")) return "来月";
  return "不明";
}

function parseCompanyTestRequest(text) {
  const skills = extractKnownSkills(text);
  return {
    id: "company_test_req",
    subject: String(text).split(/\r?\n/).find(Boolean) || "テスト案件",
    extracted: {
      role: String(text).split(/\r?\n/).find(Boolean) || "テスト案件",
      required: skills.length ? skills.slice(0, Math.min(skills.length, 3)) : ["Java"],
      nice: skills.slice(3),
      unitMax: extractUnit(text, 70),
      start: extractStart(text),
      location: extractLocation(text),
      workStyle: extractWorkStyle(text)
    }
  };
}

function parseCompanyTestTalent(text) {
  const skills = extractKnownSkills(text);
  return {
    id: "company_test_talent",
    code: "test_engineer_001",
    role: String(text).split(/\r?\n/).find(Boolean) || "テスト人材",
    skills: skills.length ? skills : ["Java"],
    unit: extractUnit(text, 70),
    available: extractStart(text),
    location: extractLocation(text),
    workStyle: extractWorkStyle(text)
  };
}

function parseCompanyTestCsvRows(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const source = String(text || "");

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (quoted && char === "\"" && next === "\"") {
      field += "\"";
      index += 1;
    } else if (char === "\"") {
      quoted = !quoted;
    } else if (!quoted && char === ",") {
      row.push(field);
      field = "";
    } else if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  row.push(field);
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  return rows;
}

function companyTestCsvHeaders(csvText) {
  return parseCompanyTestCsvRows(csvText)[0]?.map((item) => item.trim()) || [];
}

function parseCompanyTestCustomers(csvText) {
  const rows = parseCompanyTestCsvRows(csvText);
  const headers = rows.shift()?.map((item) => item.trim()) || [];
  return rows.map((line, index) => {
    const values = line.map((item) => item.trim());
    const row = Object.fromEntries(headers.map((header, headerIndex) => [header, values[headerIndex] || ""]));
    return {
      id: `company_test_customer_${index + 1}`,
      company: row.company || `テスト企業${index + 1}`,
      person: row.person || "担当者",
      honorific: "様",
      email: row.email || `test${index + 1}@example.invalid`,
      sendable: !["false", "停止", "不可", "ng"].includes(String(row.sendable || "").toLowerCase()),
      ngSkills: String(row.ngSkills || "").split(/[|;]/).map((item) => item.trim()).filter(Boolean),
      ngConditions: String(row.ngConditions || "").split(/[|;]/).map((item) => item.trim()).filter(Boolean),
      templateGroup: "標準"
    };
  });
}

function validateCompanyTestInput() {
  const errors = [];
  if (extractKnownSkills(state.companyTest.requestText).length === 0) errors.push("案件情報にスキルがありません");
  if (extractKnownSkills(state.companyTest.talentText).length === 0) errors.push("人材情報にスキルがありません");
  const headers = companyTestCsvHeaders(state.companyTest.customerCsv);
  ["company", "person", "email", "sendable"].forEach((header) => {
    if (!headers.includes(header)) errors.push(`送信先CSVに ${header} 列がありません`);
  });
  const customers = parseCompanyTestCustomers(state.companyTest.customerCsv);
  if (!customers.length) errors.push("送信先CSVがありません");
  customers.forEach((customer, index) => {
    if (!customer.company) errors.push(`送信先${index + 1}: 会社名がありません`);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) errors.push(`送信先${index + 1}: メール形式が不正です`);
  });
  return errors;
}

function matchesQuery(record) {
  if (!state.query) return true;
  return normalize(JSON.stringify(record)).includes(normalize(state.query));
}

function selectedRequest() {
  return incomingRequests.find((item) => item.id === state.selectedRequestId) || incomingRequests[0];
}

function selectedTalent() {
  return skillSheets.find((item) => item.id === state.selectedTalentId) || skillSheets[0];
}

function score(request, talent) {
  const req = request.extracted;
  const matchedRequired = req.required.filter((skill) => talent.skills.includes(skill));
  const matchedNice = req.nice.filter((skill) => talent.skills.includes(skill));
  const missing = req.required.filter((skill) => !talent.skills.includes(skill));
  const unitOk = talent.unit <= req.unitMax;
  const startOk = talent.available === req.start || req.start === "即日" && talent.available === "即日";
  const locationOk = req.workStyle.includes("リモート") || talent.location === req.location || talent.workStyle.includes("リモート");
  const cutoff = matchedRequired.length >= Math.ceil(req.required.length * 0.7) && unitOk && locationOk;
  const scoreValue = cutoff
    ? Math.round((matchedRequired.length / req.required.length) * 40)
      + Math.round((matchedNice.length / Math.max(req.nice.length, 1)) * 15)
      + (startOk ? 15 : 8)
      + (unitOk ? 15 : 0)
      + (locationOk ? 15 : 0)
    : Math.min(39, matchedRequired.length * 12 + (unitOk ? 5 : 0));
  let rank = "除外";
  if (cutoff && scoreValue >= 80) rank = "1位";
  else if (cutoff && scoreValue >= 65) rank = "2位";
  else if (cutoff && scoreValue >= 45) rank = "3位";
  return {
    requestId: request.id,
    talentId: talent.id,
    score: scoreValue,
    rank,
    cutoff,
    matchedRequired,
    matchedNice,
    missing,
    reasons: [
      matchedRequired.length ? `必須一致: ${matchedRequired.join(" / ")}` : "必須一致なし",
      matchedNice.length ? `尚可一致: ${matchedNice.join(" / ")}` : "尚可一致なし",
      unitOk ? "単価OK" : "単価NG",
      locationOk ? "勤務地/リモートOK" : "勤務地NG"
    ],
    warning: missing.length ? `不足: ${missing.join(" / ")}` : "大きな不足なし"
  };
}

function rankedMatches(request = selectedRequest()) {
  return skillSheets
    .map((talent) => score(request, talent))
    .sort((a, b) => b.score - a.score);
}

function sendTargets(request = selectedRequest(), talent = selectedTalent()) {
  return customers.map((customer) => {
    const blocked = [];
    if (!customer.sendable) blocked.push("送信停止");
    if (customer.ngSkills.some((ng) => talent.skills.includes(ng) || request.extracted.workStyle.includes(ng))) blocked.push("NG条件");
    if (customer.ngConditions.includes("単価70万円超NG") && talent.unit > 70) blocked.push("単価NG");
    return {
      ...customer,
      blocked,
      canSend: blocked.length === 0
    };
  });
}

function proposalId(request, talent, customer) {
  return `${request.id}_${talent.id}_${customer.id}`;
}

function unsentProposals(batches = matchBatches()) {
  const proposals = [];
  batches.forEach((batch) => {
    batch.sendable.forEach((match) => {
      const talent = skillSheets.find((item) => item.id === match.talentId);
      sendTargets(batch.request, talent)
        .filter((customer) => customer.canSend)
        .forEach((customer) => {
          const id = proposalId(batch.request, talent, customer);
          if (!state.sentProposalIds.includes(id)) {
            proposals.push({ id, request: batch.request, talent, customer, match });
          }
        });
    });
  });

  const countsByTalent = {};
  return proposals
    .sort((a, b) => b.match.score - a.match.score)
    .filter((proposal) => {
      countsByTalent[proposal.talent.id] = (countsByTalent[proposal.talent.id] || 0) + 1;
      return countsByTalent[proposal.talent.id] <= state.maxSendPerTalent;
    });
}

function matchBatches() {
  return incomingRequests.map((request) => {
    const matches = rankedMatches(request);
    const sendable = matches.filter((match) => match.rank !== "除外" && match.score >= state.sendThreshold);
    return {
      request,
      matches,
      sendable,
      topScore: matches[0]?.score || 0,
      topTalent: matches[0] ? skillSheets.find((talent) => talent.id === matches[0].talentId) : null
    };
  });
}

function templateFor(customer, request, talent) {
  const body = templates[Math.abs(customer.company.length + talent.code.length) % templates.length];
  return `${customer.company}
${customer.person}${customer.honorific}

${body}

【候補者】${talent.code}
【職種】${talent.role}
【主要スキル】${talent.skills.join(" / ")}
【希望単価】${talent.unit}万円
【稼働】${talent.available}

案件「${request.subject}」の条件に近い候補としてご提案です。
ご確認のほどよろしくお願いいたします。`;
}

function pill(text, type = "") {
  return `<span class="pill ${type}">${text}</span>`;
}

function pills(list, type = "") {
  return `<div class="pill-list">${list.map((item) => pill(item, type)).join("")}</div>`;
}

function matchBreakdown(match) {
  return `
    <div class="reason-list">
      ${match.reasons.map((reason) => {
        const type = reason.includes("NG") || reason.includes("なし") ? "warn" : "";
        return pill(reason, type);
      }).join("")}
      ${pill(match.warning, match.warning.includes("不足") ? "warn" : "gray")}
    </div>
  `;
}

function table(headers, rows) {
  return `<div class="table-wrap"><table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
}

function setView(view) {
  if (!publicViews.has(view)) return;
  state.view = view;
  if (typeof window !== "undefined" && window.location.hash !== `#${view}`) {
    window.history.replaceState(null, "", `#${view}`);
  }
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });
  render();
}

function setRequest(id) {
  state.selectedRequestId = id;
  render();
}

function setTalent(id) {
  state.selectedTalentId = id;
  render();
}

function toggleAutoSend() {
  state.autoSend = !state.autoSend;
  render();
}

function toggleMatchSettings() {
  state.showMatchSettings = !state.showMatchSettings;
  render();
}

function showUnsentQueue() {
  state.showUnsentQueue = true;
  render();
  document.getElementById("unsentQueue")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openUnsentQueue() {
  state.showUnsentQueue = true;
  setView("overview");
}

function markProposalSent(id) {
  if (!state.sentProposalIds.includes(id)) state.sentProposalIds.push(id);
  state.showUnsentQueue = true;
  render();
  document.getElementById("unsentQueue")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function runTestSendOne() {
  const proposal = unsentProposals()[0];
  if (!proposal) return;
  if (!state.sentProposalIds.includes(proposal.id)) state.sentProposalIds.push(proposal.id);
  render();
}

function runCompanyTestMatching() {
  const errors = validateCompanyTestInput();
  state.companyTest.errors = errors;
  if (errors.length) {
    state.companyTest.result = null;
    render();
    return;
  }
  const request = parseCompanyTestRequest(state.companyTest.requestText);
  const talent = parseCompanyTestTalent(state.companyTest.talentText);
  const testCustomers = parseCompanyTestCustomers(state.companyTest.customerCsv);
  const match = score(request, talent);
  const targets = sendTargetsForCompanyTest(request, talent, testCustomers);
  state.companyTest.result = { request, talent, match, targets };
  addCompanyTestHistory(state.companyTest.result);
  saveCompanyTestDraft();
  render();
}

function addCompanyTestHistory(result) {
  const sendableTargets = result.targets.filter((target) => target.canSend);
  const blockedTargets = result.targets.filter((target) => !target.canSend);
  state.companyTest.history = [
    {
      testedAt: new Date().toLocaleString("ja-JP"),
      subject: result.request.subject,
      talent: result.talent.role,
      score: result.match.score,
      rank: result.match.rank,
      sendable: sendableTargets.length,
      blocked: blockedTargets.length,
      feedback: state.companyTest.feedbackText ? "あり" : "なし",
      checked: Object.values(state.companyTest.feedbackChecks).filter(Boolean).length
    },
    ...state.companyTest.history
  ].slice(0, 10);
}

function clearCompanyTestHistory() {
  state.companyTest.history = [];
  saveCompanyTestDraft();
  render();
}

function sendTargetsForCompanyTest(request, talent, targetCustomers) {
  return targetCustomers.map((customer) => {
    const blocked = [];
    if (!customer.sendable) blocked.push("送信停止");
    if (customer.ngSkills.some((ng) => talent.skills.includes(ng) || request.extracted.workStyle.includes(ng))) blocked.push("NG条件");
    if (customer.ngConditions.includes("単価70万円超NG") && talent.unit > 70) blocked.push("単価NG");
    return {
      ...customer,
      blocked,
      canSend: blocked.length === 0
    };
  });
}

function companyTestReport(result) {
  if (!result) return "";
  const sendableTargets = result.targets.filter((target) => target.canSend);
  const blockedTargets = result.targets.filter((target) => !target.canSend);
  return [
    "SES Auto Send テスト結果",
    `マッチング点数: ${result.match.score}点 / ${result.match.rank}`,
    `送信可能: ${sendableTargets.length}件`,
    `除外: ${blockedTargets.length}件`,
    "",
    "送信可能企業:",
    ...sendableTargets.map((target) => `- ${target.company} / ${target.email}`),
    "",
    "除外企業:",
    ...blockedTargets.map((target) => `- ${target.company}: ${target.blocked.join(" / ") || "除外"}`),
    "",
    "企業側コメント:",
    state.companyTest.feedbackText || "未入力",
    "",
    "企業側確認:",
    `- 点数の納得感: ${state.companyTest.feedbackChecks.score ? "確認済み" : "未確認"}`,
    `- 除外理由: ${state.companyTest.feedbackChecks.exclusion ? "確認済み" : "未確認"}`,
    `- メール文面: ${state.companyTest.feedbackChecks.mail ? "確認済み" : "未確認"}`
  ].join("\n");
}

function companyTestVerdict(result) {
  if (!result) {
    return {
      label: "未実行",
      detail: "案件、人材、送信先CSVを入力してマッチング実行してください。",
      type: ""
    };
  }
  const sendableTargets = result.targets.filter((target) => target.canSend);
  if (result.match.score >= 80 && sendableTargets.length > 0) {
    return {
      label: "テスト提案可能",
      detail: "マッチング点数と送信可能企業があります。提案メールプレビューを確認してください。",
      type: "ok"
    };
  }
  if (result.match.score >= 60) {
    return {
      label: "要確認",
      detail: "条件は一部合っています。除外理由と不足条件を確認してください。",
      type: "warn"
    };
  }
  return {
    label: "提案見送り",
    detail: "スキル、単価、勤務地などの条件差が大きい可能性があります。",
    type: "bad"
  };
}

function companyTestScoreRows(result) {
  if (!result) return [];
  return [
    {
      item: "必須スキル",
      status: result.match.matchedRequired.length ? "一致あり" : "不足",
      detail: result.match.matchedRequired.join(" / ") || "一致なし"
    },
    {
      item: "尚可スキル",
      status: result.match.matchedNice.length ? "一致あり" : "一致なし",
      detail: result.match.matchedNice.join(" / ") || "一致なし"
    },
    {
      item: "不足スキル",
      status: result.match.missing.length ? "要確認" : "不足なし",
      detail: result.match.missing.join(" / ") || "不足なし"
    },
    {
      item: "判定理由",
      status: result.match.cutoff ? "候補" : "見送り",
      detail: result.match.reasons.join(" / ")
    }
  ];
}

function companyTestBlockedSummary(result) {
  if (!result) return [];
  const summary = result.targets
    .flatMap((target) => target.blocked || [])
    .reduce((acc, reason) => {
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {});
  return Object.entries(summary).map(([reason, count]) => ({ reason, count }));
}

function companyTestCsvTemplate() {
  return [
    "company,person,email,sendable,ngSkills,ngConditions",
    "株式会社サンプル,田中,tanaka@example.invalid,送信可,,",
    "株式会社停止先,佐藤,sato@example.invalid,停止,,",
    "株式会社NG先,鈴木,suzuki@example.invalid,送信可,常駐のみ,単価70万円超NG"
  ].join("\n");
}

function copyCompanyTestCsvTemplate() {
  if (typeof navigator === "undefined" || !navigator.clipboard) return;
  navigator.clipboard.writeText(companyTestCsvTemplate());
}

function copyCompanyTestReport() {
  const report = companyTestReport(state.companyTest.result);
  if (!report || typeof navigator === "undefined" || !navigator.clipboard) return;
  navigator.clipboard.writeText(report);
}

function downloadCompanyTestReport() {
  const report = companyTestReport(state.companyTest.result);
  if (!report || typeof document === "undefined") return;
  const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ses-auto-send-test-report.txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function companyTestPackage() {
  return {
    version: 1,
    exportedAt: new Date().toLocaleString("ja-JP"),
    requestText: state.companyTest.requestText,
    talentText: state.companyTest.talentText,
    customerCsv: state.companyTest.customerCsv,
    feedbackText: state.companyTest.feedbackText,
    feedbackChecks: state.companyTest.feedbackChecks
  };
}

function downloadCompanyTestPackage() {
  if (typeof document === "undefined") return;
  const blob = new Blob([JSON.stringify(companyTestPackage(), null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ses-auto-send-test-input.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function applyCompanyTestPackage(packageData) {
  state.companyTest.requestText = packageData.requestText || state.companyTest.requestText;
  state.companyTest.talentText = packageData.talentText || state.companyTest.talentText;
  state.companyTest.customerCsv = packageData.customerCsv || state.companyTest.customerCsv;
  state.companyTest.feedbackText = packageData.feedbackText || "";
  state.companyTest.feedbackChecks = { ...state.companyTest.feedbackChecks, ...(packageData.feedbackChecks || {}) };
  state.companyTest.result = null;
  state.companyTest.errors = [];
  saveCompanyTestDraft();
}

function importCompanyTestPackage(input) {
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      applyCompanyTestPackage(JSON.parse(String(reader.result || "{}")));
    } catch {
      state.companyTest.errors = ["テスト入力JSONを読み込めませんでした"];
    }
    input.value = "";
    render();
  };
  reader.readAsText(file);
}

function renderOverview() {
  const batches = matchBatches();
  const matchCount = batches.filter((batch) => batch.sendable.length > 0).length;
  const proposals = unsentProposals(batches);
  const unsentCount = proposals.length;
  const sentCount = histories.length + state.sentProposalIds.length;
  const selectedBatch = batches.find((batch) => batch.request.id === state.selectedRequestId) || batches[0];
  return `
    <div class="metrics">
      <div class="metric is-accent"><span>マッチング数</span><strong>${matchCount}</strong><small>提案候補あり</small></div>
      <button class="metric metric-button is-danger" type="button" onclick="showUnsentQueue()"><span>未送信</span><strong>${unsentCount}</strong><small class="metric-cta">クリックで一覧を表示</small></button>
      <div class="metric is-success"><span>送信済み</span><strong>${sentCount}</strong><small>本日の提案数</small></div>
      <div class="metric"><span>返信通知</span><strong>${replies.length}</strong><small>確認待ち</small></div>
    </div>
    ${state.showUnsentQueue ? renderUnsentQueue(proposals) : ""}
    ${state.showMatchSettings ? renderMatchSettingsPanel() : ""}
    <div class="grid-2">
      <section class="panel">
        <div class="toolbar">
          <button class="ghost-action" onclick="toggleMatchSettings()">マッチング設定</button>
          <span class="muted">基準: ${state.sendThreshold}点以上 / 上限: ${state.maxSendPerTalent}件 / 自動送信: ${state.autoSend ? "ON" : "OFF"}</span>
        </div>
        <h2>マッチング結果</h2>
        ${state.selectedRequestId ? renderMatchBatchList(batches) : `<p class="muted">案件メールまたはマッチング画面から対象を選ぶと、結果が表示されます。</p>`}
      </section>
      <section class="panel">
        <h2>マッチング詳細</h2>
        ${state.selectedRequestId ? renderRequestCards([selectedBatch.request]) : `<p class="muted">まだ対象が選択されていません。</p>`}
        <h3>候補者</h3>
        ${state.selectedRequestId ? renderMatchCards(selectedBatch.matches.slice(0, 3)) : ""}
        <div class="toolbar">
          <button class="primary-action" onclick="setView('send')">送信画面へ</button>
          <button class="ghost-action" onclick="setView('history')">履歴を見る</button>
        </div>
      </section>
    </div>
  `;
}

function renderUnsentQueue(proposals) {
  return `
    <section id="unsentQueue" class="panel">
      <div class="toolbar">
        <h2>未送信一覧</h2>
        <span class="muted">テスト表示です。外部送信はしません / 点数が高い順 / 同一人材は${state.maxSendPerTalent}件まで</span>
      </div>
      ${proposals.length ? table(
        ["案件/人材", "送信先", "スコア", "判断理由", "操作"],
        proposals.filter(matchesQuery).map((proposal) => `
          <tr>
            <td>
              <strong>${proposal.request.subject}</strong><br>
              <span class="muted">${proposal.talent.code} / ${proposal.talent.role}</span>
            </td>
            <td>${proposal.customer.company}<br><span class="muted">${proposal.customer.person}${proposal.customer.honorific} / ${proposal.customer.email}</span></td>
            <td><strong>${proposal.match.score}点</strong><br><span class="muted">${proposal.match.rank}</span></td>
            <td>${pill("未送信", "danger")}${matchBreakdown(proposal.match)}</td>
            <td>
              <button class="small-action is-primary" onclick="setRequest('${proposal.request.id}'); setTalent('${proposal.talent.id}'); markProposalSent('${proposal.id}')">テスト送信済みにする</button>
            </td>
          </tr>
        `)
      ) : `<p class="muted">未送信はありません。</p>`}
    </section>
  `;
}

function renderMatchSettingsPanel() {
  return `
    <section class="panel">
      <div class="toolbar">
        <button class="${state.autoSend ? "primary-action" : "ghost-action"}" onclick="toggleAutoSend()">自動送信 ${state.autoSend ? "ON" : "OFF"}</button>
        <label class="field-inline">送信基準
          <select onchange="state.sendThreshold = Number(this.value); render();">
            <option value="80" ${state.sendThreshold === 80 ? "selected" : ""}>80点以上</option>
            <option value="70" ${state.sendThreshold === 70 ? "selected" : ""}>70点以上</option>
            <option value="60" ${state.sendThreshold === 60 ? "selected" : ""}>60点以上</option>
          </select>
        </label>
        <label class="field-inline">同一人材の送信上限
          <select onchange="state.maxSendPerTalent = Number(this.value); render();">
            <option value="1" ${state.maxSendPerTalent === 1 ? "selected" : ""}>1件まで</option>
            <option value="3" ${state.maxSendPerTalent === 3 ? "selected" : ""}>3件まで</option>
            <option value="5" ${state.maxSendPerTalent === 5 ? "selected" : ""}>5件まで</option>
          </select>
        </label>
      </div>
    </section>
  `;
}

function renderMatchBatchList(batches) {
  return `<div class="card-list">${batches.filter(matchesQuery).map((batch) => {
    const ready = batch.sendable.length > 0;
    return `
      <div class="action-card ${ready ? "is-attention" : ""}">
        <div>${pill(ready ? "未送信" : "確認", ready ? "danger" : "warn")}</div>
        <div>
          <strong>${batch.request.subject}</strong>
          <div class="meta">${batch.request.id} / 最高${batch.topScore}点 / ${batch.topTalent ? batch.topTalent.code : "候補なし"}</div>
          <div class="meta">送信基準${state.sendThreshold}点以上: ${batch.sendable.length}件</div>
        </div>
        <button class="small-action" onclick="setRequest('${batch.request.id}')">詳細</button>
      </div>
    `;
  }).join("")}</div>`;
}

function renderRequestCards(list) {
  return `<div class="card-list">${list.filter(matchesQuery).map((request) => `
    <div class="action-card">
      <div>${pill(request.fileType, "blue")}</div>
      <div>
        <strong>${request.subject}</strong>
        <div class="meta">${request.receivedAt} / ${request.attachment}</div>
        <div class="meta">${request.extracted.required.join(" / ")} / 上限${request.extracted.unitMax}万円 / ${request.extracted.workStyle}</div>
      </div>
      <button class="small-action" onclick="setRequest('${request.id}'); setView('matches')">照合</button>
    </div>
  `).join("")}</div>`;
}

function renderInbox() {
  return `
    <section class="panel">
      <h2>案件メール</h2>
      ${table(
        ["受信", "件名/添付", "抽出条件", "状態", "操作"],
        incomingRequests.filter(matchesQuery).map((request) => `
          <tr>
            <td>${request.receivedAt}<br><span class="muted">${request.fromAddress}</span></td>
            <td><strong>${request.subject}</strong><br>${request.attachment} / ${request.fileType}</td>
            <td>${request.extracted.required.join(" / ")}<br>${request.extracted.location} / ${request.extracted.workStyle} / ${request.extracted.unitMax}万円</td>
            <td><span class="status ${request.status === "確認必要" ? "warn" : "ok"}">${request.status}</span><br><span class="muted">有効期限: ${request.validUntil}</span></td>
            <td><button class="small-action" onclick="setRequest('${request.id}'); setView('matches')">マッチング</button></td>
          </tr>
        `)
      )}
    </section>
  `;
}

function renderSheets() {
  return `
    <section class="panel">
      <div class="toolbar">
        <button class="ghost-action">Drive取込予定</button>
        <button class="ghost-action">CSV/Excel登録予定</button>
        <label class="field-inline">有効期限
          <select>
            <option>${talentTtlDays}日</option>
            <option>1日</option>
            <option>3日</option>
            <option>10日</option>
          </select>
        </label>
      </div>
      <h2>登録スキルシート</h2>
      ${table(
        ["仮ID", "ファイル", "スキル", "条件", "有効期限", "操作"],
        skillSheets.filter(matchesQuery).map((talent) => `
          <tr>
            <td><strong>${talent.code}</strong><br>${talent.role}</td>
            <td>${talent.sourceFile}<br><span class="muted">${talent.fileType}</span></td>
            <td>${pills(talent.skills)}</td>
            <td>${talent.unit}万円 / ${talent.available}<br>${talent.location} / ${talent.workStyle}</td>
            <td><span class="status ${talent.status === "期限注意" ? "warn" : "ok"}">${talent.validUntil}</span><br>${talent.status}</td>
            <td><button class="small-action" onclick="setTalent('${talent.id}'); setView('send')">提案文へ</button></td>
          </tr>
        `)
      )}
    </section>
  `;
}

function renderMatchCards(matches) {
  return `<div class="card-list">${matches.map((match) => {
    const request = incomingRequests.find((item) => item.id === match.requestId);
    const talent = skillSheets.find((item) => item.id === match.talentId);
    const rankClass = match.rank === "1位" ? "a" : match.rank === "2位" ? "b" : "c";
    const decision = match.rank === "除外" ? "対象外" : match.score >= state.sendThreshold ? "送信対象" : "保留";
    const decisionType = decision === "送信対象" ? "" : decision === "保留" ? "warn" : "danger";
    return `
      <div class="action-card">
        <div><span class="rank ${rankClass}">${match.rank}</span><div class="meta">${match.score}点</div>${pill(decision, decisionType)}</div>
        <div>
          <strong>${request.subject}</strong>
          <div>${talent.code} / ${talent.role}</div>
          ${matchBreakdown(match)}
        </div>
        <button class="small-action" onclick="setTalent('${talent.id}'); setView('send')">送信準備</button>
      </div>
    `;
  }).join("")}</div>`;
}

function renderMatches() {
  const request = selectedRequest();
  const matches = rankedMatches(request);
  return `
    <div class="grid-2">
      <section class="panel">
        <h2>マッチング</h2>
        ${renderRequestCards([request])}
        <h3>候補者ランキング</h3>
        ${renderMatchCards(matches)}
      </section>
      <section class="detail-panel">
        <h2>案件条件</h2>
        <div class="card-list">
          <div><strong>職種</strong><div class="meta">${request.extracted.role}</div></div>
          <div><strong>必須</strong>${pills(request.extracted.required)}</div>
          <div><strong>尚可</strong>${pills(request.extracted.nice, "blue")}</div>
          <div><strong>条件</strong><div class="meta">${request.extracted.unitMax}万円 / ${request.extracted.start} / ${request.extracted.location} / ${request.extracted.workStyle}</div></div>
        </div>
      </section>
    </div>
  `;
}

function renderCustomers() {
  return `
    <section class="panel">
      <div class="toolbar">
        <button class="ghost-action">CSVインポート予定</button>
        <button class="ghost-action">列名自動認識予定</button>
        <span class="muted">会社名、担当者、メール、NG条件を先に登録します。</span>
      </div>
      <h2>送信先マスタ</h2>
      ${table(
        ["会社", "宛名", "メール", "送信可否", "NG条件", "テンプレ"],
        customers.filter(matchesQuery).map((customer) => `
          <tr>
            <td><strong>${customer.company}</strong><br>${customer.id}</td>
            <td>${customer.person}${customer.honorific}</td>
            <td>${customer.email}</td>
            <td><span class="status ${customer.sendable ? "ok" : "bad"}">${customer.sendable ? "送信可" : "停止"}</span></td>
            <td>${[...customer.ngSkills, ...customer.ngConditions].length ? pills([...customer.ngSkills, ...customer.ngConditions], "warn") : pill("なし", "gray")}</td>
            <td>${customer.templateGroup}</td>
          </tr>
        `)
      )}
    </section>
  `;
}

function renderSend() {
  const request = selectedRequest();
  const best = rankedMatches(request).find((match) => match.rank !== "除外");
  const talent = selectedTalent() || skillSheets.find((item) => item.id === best.talentId);
  const targets = sendTargets(request, talent);
  const firstTarget = targets.find((target) => target.canSend) || targets[0];
  return `
    <div class="grid-2">
      <section class="panel">
        <div class="toolbar">
          <button class="${state.autoSend ? "primary-action" : "ghost-action"}" onclick="toggleAutoSend()">自動送信 ${state.autoSend ? "ON" : "OFF"}</button>
          <span class="muted">初期値はOFF。ONなら条件OKの会社へ個別送信する想定です。</span>
        </div>
        <h2>BCCなし個別送信</h2>
        ${table(
          ["送信先", "宛名", "判定", "理由", "操作"],
          targets.map((target) => `
            <tr>
              <td><strong>${target.company}</strong><br>${target.email}</td>
              <td>${target.person}${target.honorific}</td>
              <td><span class="status ${target.canSend ? "ok" : "bad"}">${target.canSend ? "送信対象" : "除外"}</span></td>
              <td>${target.blocked.length ? pills(target.blocked, "danger") : pill("NGなし")}</td>
              <td><button class="small-action" ${target.canSend ? "" : "disabled"}>個別メール作成</button></td>
            </tr>
          `)
        )}
      </section>
      <section class="detail-panel">
        <h2>メール文面プレビュー</h2>
        <p class="muted">会社名・担当者名を差し込み、1社ずつToで送る想定です。</p>
        <div class="mail-preview">${templateFor(firstTarget, request, talent)}</div>
      </section>
    </div>
  `;
}

function renderHistory() {
  return `
    <section class="panel">
      <h2>送信履歴</h2>
      <p class="muted">どの会社へ、どの案件で、どの人材を、いつ送ったかを検索できます。</p>
      ${table(
        ["送信日時", "会社/メール", "案件", "人材", "状態", "件名"],
        histories.filter(matchesQuery).map((item) => `
          <tr>
            <td>${item.sentAt}</td>
            <td><strong>${item.company}</strong><br>${item.email}</td>
            <td>${item.request}</td>
            <td>${item.talent}</td>
            <td><span class="status ${item.status === "返信あり" ? "ok" : "warn"}">${item.status}</span></td>
            <td>${item.subject}</td>
          </tr>
        `)
      )}
    </section>
  `;
}

function renderReplies() {
  return `
    <section class="panel">
      <h2>返信検知</h2>
      <p class="muted">返信元メールアドレス、件名、案件名らしき文字から過去の送信履歴に紐づける想定です。</p>
      ${table(
        ["受信", "返信元/件名", "紐づけ", "検知理由", "次アクション"],
        replies.filter(matchesQuery).map((reply) => `
          <tr>
            <td>${reply.receivedAt}</td>
            <td>${reply.from}<br><strong>${reply.subject}</strong></td>
            <td>${reply.linkedHistory}</td>
            <td>${reply.detected}</td>
            <td>${reply.nextAction}</td>
          </tr>
        `)
      )}
    </section>
  `;
}

function renderTestConsole() {
  const batches = matchBatches();
  const proposals = unsentProposals(batches);
  const totalMatches = batches.reduce((sum, batch) => sum + batch.sendable.length, 0);
  const stoppedCustomers = customers.filter((customer) => !customer.sendable).length;
  const sentCount = histories.length + state.sentProposalIds.length;
  const nextProposal = proposals[0];

  return `
    <section class="panel">
      <div class="toolbar">
        <h2>テストコンソール</h2>
        <span class="muted">サンプルデータのみ / 外部送信なし / Gmail接続なし</span>
      </div>
      <div class="test-steps">
        <button class="test-step" type="button" onclick="setView('inbox')">
          <span>1</span><strong>受信確認</strong><small>${incomingRequests.length}件の案件メール</small>
        </button>
        <button class="test-step" type="button" onclick="setView('matches')">
          <span>2</span><strong>マッチング確認</strong><small>${totalMatches}件が送信候補</small>
        </button>
        <button class="test-step is-danger" type="button" onclick="openUnsentQueue()">
          <span>3</span><strong>未送信確認</strong><small>${proposals.length}件を送信前チェック</small>
        </button>
        <button class="test-step is-success" type="button" onclick="runTestSendOne()">
          <span>4</span><strong>疑似送信</strong><small>${sentCount}件が履歴対象</small>
        </button>
        <button class="test-step" type="button" onclick="setView('replies')">
          <span>5</span><strong>返信検知</strong><small>${replies.length}件の返信候補</small>
        </button>
      </div>
    </section>

    <div class="grid-2">
      <section class="panel">
        <h2>今回のテスト結果</h2>
        ${table(
          ["確認項目", "結果", "見る場所"],
          [
            `<tr><td>案件メール</td><td>${incomingRequests.length}件</td><td>案件メール</td></tr>`,
            `<tr><td>登録スキルシート</td><td>${skillSheets.length}件</td><td>登録スキルシート</td></tr>`,
            `<tr><td>送信先</td><td>${customers.length}件 / 停止${stoppedCustomers}件</td><td>送信先マスタ</td></tr>`,
            `<tr><td>マッチング候補</td><td>${totalMatches}件</td><td>マッチング</td></tr>`,
            `<tr><td>未送信</td><td>${proposals.length}件</td><td>マッチング管理</td></tr>`,
            `<tr><td>送信履歴</td><td>${sentCount}件</td><td>送信履歴</td></tr>`
          ]
        )}
      </section>
      <section class="detail-panel">
        <h2>次に見る候補</h2>
        ${nextProposal ? `
          <div class="card-list">
            <div class="action-card">
              <div>${pill(`${nextProposal.match.score}点`)}</div>
              <div>
                <strong>${nextProposal.customer.company}</strong>
                <div class="meta">${nextProposal.talent.code} / ${nextProposal.request.subject}</div>
                ${matchBreakdown(nextProposal.match)}
              </div>
              <button class="small-action is-primary" onclick="runTestSendOne()">疑似送信</button>
            </div>
          </div>
        ` : `<p class="muted">未送信候補はありません。</p>`}
      </section>
    </div>
  `;
}

function renderCompanyTest() {
  const result = state.companyTest.result;
  const errors = state.companyTest.errors;
  const history = state.companyTest.history;
  const sendableTargets = result ? result.targets.filter((target) => target.canSend) : [];
  const blockedTargets = result ? result.targets.filter((target) => !target.canSend) : [];
  const firstTarget = sendableTargets[0] || result?.targets[0];
  const verdict = companyTestVerdict(result);

  return `
    <section class="panel">
      <div class="toolbar">
        <h2>企業テスト用マッチング</h2>
        <span class="muted">貼り付け入力で判定します。外部送信・API接続・Gmail接続はしません。</span>
      </div>
      <div class="handoff-banner">
        <div>
          <strong>このテストで確認できること</strong>
          <span>案件と人材の相性、送信可能な企業、除外理由、提案メールの雛形を確認できます。</span>
        </div>
        <div>
          <strong>このテストで発生しないこと</strong>
          <span>メール送信、Gmail連携、外部API接続、実データ保存は行いません。</span>
        </div>
        <div>
          <strong>企業側にお願いしたいこと</strong>
          <span>普段の案件文面に近い内容で貼り付け、判定結果が営業感覚に合うか確認してください。</span>
        </div>
      </div>
      <div class="notice">
        企業テストは、案件情報・人材情報・送信先CSVを貼って「マッチング実行」を押すだけです。実メール送信は発生しません。
      </div>
      <div class="toolbar">
        <span class="muted">サンプル切替</span>
        <button class="ghost-action" onclick="applyCompanyTestPreset('java')">Java案件</button>
        <button class="ghost-action" onclick="applyCompanyTestPreset('react')">React案件</button>
        <button class="ghost-action" onclick="applyCompanyTestPreset('python')">Python案件</button>
      </div>
      <div class="guide-grid">
        <div class="guide-card">
          <strong>案件情報</strong>
          <span>必須スキル、尚可スキル、単価、勤務地、稼働時期、働き方を文章で貼れます。</span>
        </div>
        <div class="guide-card">
          <strong>人材情報</strong>
          <span>スキル、希望単価、勤務地、稼働可能時期、リモート可否を文章で貼れます。</span>
        </div>
        <div class="guide-card">
          <strong>送信先CSV</strong>
          <span>列は company, person, email, sendable, ngSkills, ngConditions です。</span>
          <button class="small-action" onclick="copyCompanyTestCsvTemplate()">CSVテンプレをコピー</button>
        </div>
      </div>
      <div class="guide-grid">
        <div class="guide-card">
          <strong>80点以上</strong>
          <span>提案候補として確認。送信可能企業とメール文面を見る。</span>
        </div>
        <div class="guide-card">
          <strong>60〜79点</strong>
          <span>要確認。単価、勤務地、スキル不足を見て営業判断する。</span>
        </div>
        <div class="guide-card">
          <strong>59点以下</strong>
          <span>見送り候補。案件か人材の条件を変えて再テストする。</span>
        </div>
      </div>
      <div class="tester-layout">
        <label class="field">
          <span>案件情報</span>
          <textarea class="tester-textarea" oninput="updateCompanyTestField('requestText', this.value)">${escapeHtml(state.companyTest.requestText)}</textarea>
        </label>
        <label class="field">
          <span>人材情報</span>
          <textarea class="tester-textarea" oninput="updateCompanyTestField('talentText', this.value)">${escapeHtml(state.companyTest.talentText)}</textarea>
        </label>
        <label class="field wide">
          <span>送信先CSV</span>
          <textarea class="tester-textarea is-short" oninput="updateCompanyTestField('customerCsv', this.value)">${escapeHtml(state.companyTest.customerCsv)}</textarea>
        </label>
      </div>
      <div class="toolbar">
        <button class="primary-action" onclick="runCompanyTestMatching()">マッチング実行</button>
        <button class="ghost-action" onclick="resetCompanyTestSample()">サンプルに戻す</button>
        <button class="ghost-action" onclick="clearCompanyTestInput()">入力を空にする</button>
        <button class="ghost-action" onclick="downloadCompanyTestPackage()">入力JSON保存</button>
        <label class="ghost-action file-action">入力JSON読込<input type="file" accept="application/json" onchange="importCompanyTestPackage(this)"></label>
        <span class="muted">案件、人材、送信先を変えて何度でも試せます。</span>
      </div>
      ${errors.length ? `
        <div class="notice is-error">
          <strong>入力を確認してください</strong>
          <ul>${errors.map((error) => `<li>${error}</li>`).join("")}</ul>
        </div>
      ` : ""}
    </section>

    ${result ? `
      <section class="panel verdict-panel ${verdict.type}">
        <div>
          <h2>${verdict.label}</h2>
          <p class="muted">${verdict.detail}</p>
        </div>
        <div class="verdict-score">${result.match.score}<span>点</span></div>
      </section>
      <div class="metrics">
        <div class="metric is-accent"><span>マッチング点数</span><strong>${result.match.score}</strong><small>${result.match.rank}</small></div>
        <div class="metric is-success"><span>送信可能</span><strong>${sendableTargets.length}</strong><small>個別送信候補</small></div>
        <div class="metric is-danger"><span>除外</span><strong>${blockedTargets.length}</strong><small>NG/停止</small></div>
        <div class="metric"><span>送信処理</span><strong>0</strong><small>実送信なし</small></div>
      </div>
      <div class="grid-2">
        <section class="panel">
          <h2>送信先判定</h2>
          ${table(
            ["企業", "宛先", "判定", "理由"],
            result.targets.map((target) => `
              <tr>
                <td><strong>${target.company}</strong><br>${target.person}${target.honorific}</td>
                <td>${target.email}</td>
                <td><span class="status ${target.canSend ? "ok" : "bad"}">${target.canSend ? "送信可能" : "除外"}</span></td>
                <td>${target.blocked.length ? pills(target.blocked, "danger") : pill("OK")}</td>
              </tr>
            `)
          )}
        </section>
        <section class="panel">
          <h2>点数の内訳</h2>
          ${table(
            ["項目", "判定", "内容"],
            companyTestScoreRows(result).map((row) => `
              <tr>
                <td><strong>${row.item}</strong></td>
                <td>${row.status}</td>
                <td>${escapeHtml(row.detail)}</td>
              </tr>
            `)
          )}
        </section>
      </div>
      ${blockedTargets.length ? `
        <section class="panel">
          <h2>除外理由サマリー</h2>
          ${table(
            ["理由", "件数"],
            companyTestBlockedSummary(result).map((row) => `
              <tr>
                <td>${escapeHtml(row.reason)}</td>
                <td>${row.count}件</td>
              </tr>
            `)
          )}
        </section>
      ` : ""}
      <div class="grid-2">
        <section class="detail-panel">
          <h2>提案メールプレビュー</h2>
          ${firstTarget ? `<div class="mail-preview">${templateFor(firstTarget, result.request, result.talent)}</div>` : `<p class="muted">送信先がありません。</p>`}
          <h2>企業側コメント</h2>
          <div class="check-list">
            <label><input type="checkbox" ${state.companyTest.feedbackChecks.score ? "checked" : ""} onchange="updateCompanyTestFeedbackCheck('score', this.checked)"> 点数の納得感を確認</label>
            <label><input type="checkbox" ${state.companyTest.feedbackChecks.exclusion ? "checked" : ""} onchange="updateCompanyTestFeedbackCheck('exclusion', this.checked)"> 除外理由を確認</label>
            <label><input type="checkbox" ${state.companyTest.feedbackChecks.mail ? "checked" : ""} onchange="updateCompanyTestFeedbackCheck('mail', this.checked)"> メール文面を確認</label>
          </div>
          <textarea class="tester-textarea is-short" placeholder="点数の納得感、除外理由、メール文面へのコメントを入力" oninput="updateCompanyTestField('feedbackText', this.value)">${escapeHtml(state.companyTest.feedbackText)}</textarea>
          <h2>テスト結果レポート</h2>
          <div class="toolbar">
            <button class="ghost-action" onclick="copyCompanyTestReport()">コピー</button>
            <button class="ghost-action" onclick="downloadCompanyTestReport()">テキスト保存</button>
          </div>
          <textarea class="tester-textarea is-report" readonly>${escapeHtml(companyTestReport(result))}</textarea>
        </section>
      </div>
    ` : `
      <section class="panel">
        <h2>まだ未実行です</h2>
        <p class="muted">案件、人材、送信先CSVを入れて「マッチング実行」を押してください。</p>
      </section>
    `}
    <section class="panel">
      <div class="toolbar">
        <h2>テスト履歴</h2>
        <button class="ghost-action" onclick="clearCompanyTestHistory()">履歴クリア</button>
      </div>
      ${history.length ? table(
        ["日時", "案件", "人材", "点数", "送信可能", "除外", "コメント", "確認"],
        history.map((item) => `
          <tr>
            <td>${item.testedAt}</td>
            <td>${escapeHtml(item.subject)}</td>
            <td>${escapeHtml(item.talent)}</td>
            <td><strong>${item.score}点</strong><br><span class="muted">${item.rank}</span></td>
            <td>${item.sendable}件</td>
            <td>${item.blocked}件</td>
            <td>${item.feedback || "なし"}</td>
            <td>${item.checked || 0}/3</td>
          </tr>
        `)
      ) : `<p class="muted">まだ履歴はありません。</p>`}
    </section>
  `;
}

function renderSettings() {
  return `
    <div class="grid-2">
      <section class="panel">
        <h2>送信設定</h2>
        <div class="form-grid">
          <div class="field wide">
            <label>自動送信</label>
            <select onchange="state.autoSend = this.value === 'on'; render();">
              <option value="off" ${state.autoSend ? "" : "selected"}>OFF: 人が確認して送信</option>
              <option value="on" ${state.autoSend ? "selected" : ""}>ON: 条件を満たしたら自動送信</option>
            </select>
          </div>
          <div class="field">
            <label>送信するマッチング点数</label>
            <select onchange="state.sendThreshold = Number(this.value); render();">
              <option value="80" ${state.sendThreshold === 80 ? "selected" : ""}>80点以上だけ送信</option>
              <option value="70" ${state.sendThreshold === 70 ? "selected" : ""}>70点以上だけ送信</option>
              <option value="60" ${state.sendThreshold === 60 ? "selected" : ""}>60点以上だけ送信</option>
            </select>
          </div>
          <div class="field">
            <label>同一人材の送信上限</label>
            <select onchange="state.maxSendPerTalent = Number(this.value); render();">
              <option value="1" ${state.maxSendPerTalent === 1 ? "selected" : ""}>1人材につき1件まで</option>
              <option value="3" ${state.maxSendPerTalent === 3 ? "selected" : ""}>1人材につき3件まで</option>
              <option value="5" ${state.maxSendPerTalent === 5 ? "selected" : ""}>1人材につき5件まで</option>
            </select>
          </div>
          <div class="field">
            <label>案件有効期限</label>
            <select>
              <option>${requestTtlDays}日</option>
              <option>1日</option>
              <option>3日</option>
              <option>10日</option>
            </select>
          </div>
          <div class="field">
            <label>人材有効期限</label>
            <select>
              <option>${talentTtlDays}日</option>
              <option>1日</option>
              <option>3日</option>
              <option>10日</option>
            </select>
          </div>
        </div>
      </section>
      <section class="panel">
        <h2>サブスク制御</h2>
        <div class="card-list">
          <div class="action-card"><div>${pill("支払中")}</div><div><strong>全機能利用可</strong><div class="meta">取込、照合、送信、履歴検索</div></div></div>
          <div class="action-card"><div>${pill("未払い", "warn")}</div><div><strong>取込/送信停止</strong><div class="meta">閲覧のみへ制限</div></div></div>
          <div class="action-card"><div>${pill("解約", "danger")}</div><div><strong>ログイン停止</strong><div class="meta">データ削除は即時にしない</div></div></div>
        </div>
      </section>
    </div>
  `;
}

function updateTitle() {
  const titles = {
    overview: "マッチング管理",
    inbox: "案件メール",
    sheets: "登録スキルシート",
    matches: "マッチング",
    customers: "送信先マスタ",
    send: "個別送信",
    history: "送信履歴",
    replies: "返信検知",
    test: "テスト",
    companyTest: "企業テスト",
    settings: "設定"
  };
  const title = titles[state.view] || "SES Auto Send";
  const titleNode = document.getElementById("viewTitle");
  if (titleNode) titleNode.textContent = title;
  document.title = state.view === "companyTest" ? "SES Auto Send 企業テスト" : "SES Auto Send";
}

function render() {
  updateTitle();
  const views = {
    overview: renderOverview,
    inbox: renderInbox,
    sheets: renderSheets,
    matches: renderMatches,
    customers: renderCustomers,
    send: renderSend,
    history: renderHistory,
    replies: renderReplies,
    test: renderTestConsole,
    companyTest: renderCompanyTest,
    settings: renderSettings
  };
  const content = document.getElementById("content");
  if (content) content.innerHTML = views[state.view]();
}

if (typeof document !== "undefined") {
  loadCompanyTestDraft();
  const defaultView = document.body?.dataset.defaultView;
  const hashView = window.location.hash.replace("#", "");
  if (publicViews.has(hashView)) state.view = hashView;
  else if (publicViews.has(defaultView)) state.view = defaultView;

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      state.query = event.target.value;
      render();
    });
  }

  const settingsBtn = document.getElementById("settingsBtn");
  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      state.showMatchSettings = true;
      setView("settings");
    });
  }

  render();
}

if (typeof module !== "undefined") {
  module.exports = {
    state,
    skillSheets,
    incomingRequests,
    customers,
    histories,
    replies,
    score,
    rankedMatches,
    matchBatches,
    sendTargets,
    unsentProposals,
    proposalId,
    renderTestConsole,
    runTestSendOne,
    updateCompanyTestField,
    updateCompanyTestFeedbackCheck,
    resetCompanyTestSample,
    applyCompanyTestPreset,
    clearCompanyTestInput,
    clearCompanyTestHistory,
    addCompanyTestHistory,
    parseCompanyTestRequest,
    parseCompanyTestTalent,
    parseCompanyTestCsvRows,
    companyTestCsvHeaders,
    parseCompanyTestCustomers,
    validateCompanyTestInput,
    companyTestReport,
    companyTestVerdict,
    companyTestScoreRows,
    companyTestBlockedSummary,
    copyCompanyTestReport,
    companyTestCsvTemplate,
    copyCompanyTestCsvTemplate,
    downloadCompanyTestReport,
    companyTestPackage,
    downloadCompanyTestPackage,
    applyCompanyTestPackage,
    importCompanyTestPackage,
    runCompanyTestMatching
  };
}

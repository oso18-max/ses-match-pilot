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
  reviewedMailIds: [],
  mailReviewHistory: [],
  companyTest: {
    requestText: `Java/Spring Boot案件
必須: Java, Spring Boot, PostgreSQL
尚可: AWS
単価: 70万
勤務地: 東京
稼働: 即日
働き方: 週3リモート
年齢: 45歳まで
商流: 二次請まで
NG: 外国籍`,
    talentText: `Javaバックエンドエンジニア
スキル: Java, Spring Boot, PostgreSQL, AWS
希望単価: 68万
勤務地: 東京
稼働: 即日
働き方: 週3リモート可
年齢: 42歳
商流: 二次請
---
Reactフロントエンドエンジニア
スキル: React, TypeScript, Next.js
希望単価: 72万
勤務地: 大阪
稼働: 来月
働き方: フルリモート可
年齢: 35歳
商流: 一次請
---
Pythonデータ処理エンジニア
スキル: Python, SQL, PostgreSQL
希望単価: 66万
勤務地: 福岡
稼働: 来月
働き方: 常駐可
年齢: 50歳
商流: 三次請`,
    customerCsv: `company,person,email,sendable,ngSkills,ngConditions,ngWords,maxAge,maxCommerceLevel
株式会社アルファ,田中,tanaka@alpha.example.invalid,送信可,,,,,
ベータソリューションズ株式会社,採用担当,ses@beta.example.invalid,送信可,常駐のみ,単価70万円超NG,,45,2
株式会社ガンマ,佐藤,sato@gamma.example.invalid,停止,,,,,`,
    result: null,
    history: [],
    feedbackText: "",
    feedbackChecks: {
      score: false,
      exclusion: false,
      mail: false
    },
    minScore: 80,
    topTalentLimit: 3,
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
  "interviews",
  "deals",
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
    status: "マッチング済み",
    classification: {
      type: "案件",
      confidence: 95,
      sourceSummary: "件名 / 本文 / 添付本文",
      reason: "案件語: 急募 / 案件 / 単価 / リモート"
    }
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
    status: "マッチング済み",
    classification: {
      type: "案件",
      confidence: 92,
      sourceSummary: "件名 / 本文",
      reason: "案件語: React / フルリモート / 開始"
    }
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
    status: "確認必要",
    classification: {
      type: "案件",
      confidence: 58,
      sourceSummary: "件名 / 添付本文",
      reason: "低信頼度: 添付PDFから一部抽出 / 単価差あり"
    }
  }
];

const mailReviewItems = [
  {
    id: "mail_review_001",
    receivedAt: "2026-06-17 12:05",
    fromAddress: "unknown@example.invalid",
    subject: "ご相談",
    type: "判定不能",
    confidence: 8,
    sourceSummary: "本文",
    reason: "案件語が単価のみ。案件か雑談か判断できない"
  },
  {
    id: "mail_review_002",
    receivedAt: "2026-06-17 12:20",
    fromAddress: "scan@example.invalid",
    subject: "資料送付",
    type: "判定不能",
    confidence: 0,
    sourceSummary: "情報なし",
    reason: "スキャンPDF想定。本文抽出できない"
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

const interviews = [
  {
    id: "iv_001",
    historyId: "hist_002",
    company: "ベータソリューションズ株式会社",
    request: "React 管理画面",
    talent: "engineer_002",
    scheduledAt: "2026-06-18 14:00",
    status: "面談予定",
    result: "未実施",
    nextAction: "前日リマインド"
  },
  {
    id: "iv_002",
    historyId: "hist_001",
    company: "株式会社アルファ",
    request: "Java/Spring 案件",
    talent: "engineer_001",
    scheduledAt: "2026-06-17 16:00",
    status: "結果待ち",
    result: "先方確認中",
    nextAction: "翌営業日に確認"
  },
  {
    id: "iv_003",
    historyId: "hist_003",
    company: "デルタテック株式会社",
    request: "Python バッチ改修",
    talent: "engineer_003",
    scheduledAt: "2026-06-16 11:00",
    status: "見送り",
    result: "単価差",
    nextAction: "別人材を再提案"
  }
];

const deals = [
  {
    id: "deal_001",
    interviewId: "iv_002",
    company: "株式会社アルファ",
    request: "Java/Spring 案件",
    talent: "engineer_001",
    status: "成約",
    startMonth: "2026-07",
    salesUnit: 78,
    payUnit: 68,
    nextAction: "注文書確認"
  },
  {
    id: "deal_002",
    interviewId: "iv_001",
    company: "ベータソリューションズ株式会社",
    request: "React 管理画面",
    talent: "engineer_002",
    status: "条件調整",
    startMonth: "2026-07",
    salesUnit: 82,
    payUnit: 72,
    nextAction: "単価回答待ち"
  },
  {
    id: "deal_003",
    interviewId: "iv_003",
    company: "デルタテック株式会社",
    request: "Python バッチ改修",
    talent: "engineer_003",
    status: "失注",
    startMonth: "2026-06",
    salesUnit: 0,
    payUnit: 0,
    nextAction: "別案件へ回す"
  }
];

const templates = [
  "いつもお世話になっております。下記人材をご提案いたします。",
  "お世話になっております。貴社案件に近い人材がおりますのでご共有いたします。",
  "いつもありがとうございます。条件に合いそうな技術者をご紹介いたします。",
  "お世話になっております。直近稼働可能な候補者についてご連絡いたします。"
];

const appStateStorageKey = "sesAutoSendAppState";

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

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function saveAppState() {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(appStateStorageKey, JSON.stringify({
    autoSend: state.autoSend,
    sendThreshold: state.sendThreshold,
    maxSendPerTalent: state.maxSendPerTalent,
    sentProposalIds: state.sentProposalIds,
    reviewedMailIds: state.reviewedMailIds,
    mailReviewHistory: state.mailReviewHistory
  }));
}

function loadAppState() {
  if (typeof localStorage === "undefined") return;
  const saved = localStorage.getItem(appStateStorageKey);
  if (!saved) return;
  try {
    const draft = JSON.parse(saved);
    state.autoSend = Boolean(draft.autoSend);
    state.sendThreshold = Number(draft.sendThreshold || state.sendThreshold);
    state.maxSendPerTalent = Number(draft.maxSendPerTalent || state.maxSendPerTalent);
    state.sentProposalIds = safeArray(draft.sentProposalIds);
    state.reviewedMailIds = safeArray(draft.reviewedMailIds);
    state.mailReviewHistory = safeArray(draft.mailReviewHistory).slice(0, 10);
  } catch {
    localStorage.removeItem(appStateStorageKey);
  }
}

function saveCompanyTestDraft() {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem("sesAutoSendCompanyTest", JSON.stringify({
    requestText: state.companyTest.requestText,
    talentText: state.companyTest.talentText,
    customerCsv: state.companyTest.customerCsv,
    feedbackText: state.companyTest.feedbackText,
    feedbackChecks: state.companyTest.feedbackChecks,
    minScore: state.companyTest.minScore,
    topTalentLimit: state.companyTest.topTalentLimit,
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
    state.companyTest.minScore = Number(draft.minScore || state.companyTest.minScore);
    state.companyTest.topTalentLimit = Number(draft.topTalentLimit || state.companyTest.topTalentLimit);
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

function updateCompanyTestNumber(field, value) {
  const next = Number(value);
  if (!Number.isNaN(next)) state.companyTest[field] = next;
  state.companyTest.result = null;
  state.companyTest.errors = [];
  saveCompanyTestDraft();
  render();
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
  state.companyTest.customerCsv = "company,person,email,sendable,ngSkills,ngConditions,ngWords,maxAge,maxCommerceLevel\n";
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

function extractAge(text) {
  const matched = String(text).match(/(\d{2})\s*歳/);
  return matched ? Number(matched[1]) : null;
}

function extractMaxAge(text) {
  const source = String(text || "");
  const strict = source.match(/(\d{2})\s*歳\s*(まで|以下|以内)/);
  if (strict) return Number(strict[1]);
  const labeled = source.match(/年齢\s*[:：]?\s*(\d{2})\s*歳/);
  return labeled ? Number(labeled[1]) : null;
}

function extractCommerceLevel(text) {
  const source = String(text || "");
  if (source.includes("エンド直")) return 0;
  if (source.includes("元請") || source.includes("一次請") || source.includes("1次請") || source.includes("一次")) return 1;
  if (source.includes("二次請") || source.includes("2次請") || source.includes("二次")) return 2;
  if (source.includes("三次請") || source.includes("3次請") || source.includes("三次")) return 3;
  return null;
}

function commerceLabel(level) {
  if (level === 0) return "エンド直";
  if (level === 1) return "一次請";
  if (level === 2) return "二次請";
  if (level === 3) return "三次請";
  return "不明";
}

function extractMaxCommerceLevel(text) {
  const source = String(text || "");
  if (!source.includes("商流")) return null;
  return extractCommerceLevel(source);
}

function extractNgWords(text) {
  return String(text || "")
    .split(/\r?\n/)
    .filter((line) => /NG|ＮＧ|不可/.test(line))
    .flatMap((line) => line.replace(/.*?[:：]/, "").split(/[、,|;]/))
    .map((item) => item.trim())
    .filter((item) => item && !["なし", "無し", "無"].includes(item));
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
  const sourceText = String(text || "");
  return {
    id: "company_test_req",
    subject: sourceText.split(/\r?\n/).find(Boolean) || "テスト案件",
    sourceText,
    extracted: {
      role: sourceText.split(/\r?\n/).find(Boolean) || "テスト案件",
      required: skills.length ? skills.slice(0, Math.min(skills.length, 3)) : ["Java"],
      nice: skills.slice(3),
      unitMax: extractUnit(text, 70),
      start: extractStart(text),
      location: extractLocation(text),
      workStyle: extractWorkStyle(text),
      maxAge: extractMaxAge(text),
      maxCommerceLevel: extractMaxCommerceLevel(text),
      ngWords: extractNgWords(text)
    }
  };
}

function parseCompanyTestTalent(text, index = 1) {
  const skills = extractKnownSkills(text);
  const sourceText = String(text || "");
  return {
    id: `company_test_talent_${index}`,
    code: `test_engineer_${String(index).padStart(3, "0")}`,
    role: sourceText.split(/\r?\n/).find(Boolean) || "テスト人材",
    sourceText,
    skills: skills.length ? skills : ["Java"],
    unit: extractUnit(text, 70),
    available: extractStart(text),
    location: extractLocation(text),
    workStyle: extractWorkStyle(text),
    age: extractAge(text),
    commerceLevel: extractCommerceLevel(text)
  };
}

function parseCompanyTestTalentEntries(text) {
  const entries = String(text || "")
    .split(/\n\s*(?:---+|===+|人材区切り)\s*\n/g)
    .map((entry) => entry.trim())
    .filter(Boolean);
  return (entries.length ? entries : [String(text || "")]).map((entry, index) => parseCompanyTestTalent(entry, index + 1));
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
  return parseCompanyTestCsvRows(csvText)[0]?.map((item) => normalizeCompanyTestHeader(item)) || [];
}

function splitCsvList(value) {
  return String(value || "").split(/[|;]/).map((item) => item.trim()).filter(Boolean);
}

function parseOptionalNumber(value) {
  const matched = String(value || "").match(/\d+/);
  return matched ? Number(matched[0]) : null;
}

function normalizeCompanyTestHeader(header) {
  const key = String(header || "").trim().replace(/\s+/g, "").toLowerCase();
  const aliases = {
    company: ["company", "会社名", "企業名", "取引先", "顧客名"],
    person: ["person", "担当者", "担当者名", "宛名", "担当"],
    email: ["email", "mail", "メール", "メールアドレス", "送信先メール"],
    sendable: ["sendable", "送信可否", "送信状態", "送信対象", "配信可否"],
    ngSkills: ["ngskills", "ngスキル", "ng技術", "不可スキル"],
    ngConditions: ["ngconditions", "ng条件", "送信ng条件", "不可条件"],
    ngWords: ["ngwords", "ngワード", "ng語句", "除外ワード"],
    maxAge: ["maxage", "年齢上限", "上限年齢", "最大年齢"],
    maxCommerceLevel: ["maxcommercelevel", "商流上限", "最大商流", "商流制限"]
  };
  return Object.entries(aliases).find(([, values]) => values.includes(key))?.[0] || String(header || "").trim();
}

function parseCompanyTestCustomers(csvText) {
  const rows = parseCompanyTestCsvRows(csvText);
  const headers = rows.shift()?.map((item) => normalizeCompanyTestHeader(item)) || [];
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
      ngSkills: splitCsvList(row.ngSkills),
      ngConditions: splitCsvList(row.ngConditions),
      ngWords: splitCsvList(row.ngWords),
      maxAge: parseOptionalNumber(row.maxAge),
      maxCommerceLevel: parseOptionalNumber(row.maxCommerceLevel),
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
  const rawRows = parseCompanyTestCsvRows(state.companyTest.customerCsv).slice(1);
  const companyIndex = headers.indexOf("company");
  const emailIndex = headers.indexOf("email");
  rawRows.forEach((row, index) => {
    const company = companyIndex >= 0 ? String(row[companyIndex] || "").trim() : "";
    const email = emailIndex >= 0 ? String(row[emailIndex] || "").trim() : "";
    if (companyIndex >= 0 && !company) errors.push(`送信先${index + 1}: 会社名がありません`);
    if (emailIndex >= 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push(`送信先${index + 1}: メール形式が不正です`);
  });
  return errors;
}

function companyTestInputStatus() {
  const requestSkills = extractKnownSkills(state.companyTest.requestText);
  const talentSkills = extractKnownSkills(state.companyTest.talentText);
  const headers = companyTestCsvHeaders(state.companyTest.customerCsv);
  const rows = parseCompanyTestCsvRows(state.companyTest.customerCsv).slice(1);
  const emailIndex = headers.indexOf("email");
  const validEmails = rows.filter((row) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(row[emailIndex] || "").trim())).length;
  const missingHeaders = ["company", "person", "email", "sendable"].filter((header) => !headers.includes(header));

  return [
    {
      label: "案件スキル",
      ok: requestSkills.length > 0,
      detail: requestSkills.length ? `${requestSkills.join(" / ")} を検出` : "Java、React、Pythonなどのスキル名を入れてください"
    },
    {
      label: "人材スキル",
      ok: talentSkills.length > 0,
      detail: talentSkills.length ? `${talentSkills.join(" / ")} を検出` : "人材側のスキル名を入れてください"
    },
    {
      label: "送信先CSV",
      ok: rows.length > 0 && missingHeaders.length === 0,
      detail: missingHeaders.length ? `不足列: ${missingHeaders.join(", ")}` : `${rows.length}件を読込対象`
    },
    {
      label: "メール形式",
      ok: rows.length > 0 && validEmails === rows.length,
      detail: rows.length ? `${validEmails}/${rows.length}件が有効` : "送信先を入れてください"
    }
  ];
}

function companyTestParsedSummary() {
  const request = parseCompanyTestRequest(state.companyTest.requestText);
  const talents = parseCompanyTestTalentEntries(state.companyTest.talentText);
  const customers = parseCompanyTestCustomers(state.companyTest.customerCsv);
  const sendableCustomers = customers.filter((customer) => customer.sendable).length;
  return [
    {
      item: "案件",
      value: request.subject,
      detail: `必須 ${request.extracted.required.join(" / ")} / 単価 ${request.extracted.unitMax}万 / ${request.extracted.location} / ${request.extracted.workStyle}`
    },
    {
      item: "人材",
      value: `${talents.length}名`,
      detail: talents.map((talent) => `${talent.role}: ${talent.skills.join(" / ")} / ${talent.unit}万`).join(" ｜ ")
    },
    {
      item: "送信先",
      value: `${customers.length}件`,
      detail: `送信可 ${sendableCustomers}件 / 停止・除外候補 ${customers.length - sendableCustomers}件`
    }
  ];
}

function matchesQuery(record) {
  if (!state.query) return true;
  return normalize(JSON.stringify(record)).includes(normalize(state.query));
}

function interviewSummary() {
  return interviews.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});
}

function interviewForHistory(historyId) {
  return interviews.find((item) => item.historyId === historyId);
}

function dealGrossProfit(deal) {
  return Math.max((deal.salesUnit || 0) - (deal.payUnit || 0), 0);
}

function dealGrossRate(deal) {
  if (!deal.salesUnit) return 0;
  return Math.round((dealGrossProfit(deal) / deal.salesUnit) * 100);
}

function dealSummary() {
  return deals.reduce((acc, deal) => {
    acc.count += 1;
    if (deal.status === "成約") acc.closed += 1;
    if (deal.status === "失注") acc.lost += 1;
    acc.sales += deal.salesUnit || 0;
    acc.gross += dealGrossProfit(deal);
    return acc;
  }, { count: 0, closed: 0, lost: 0, sales: 0, gross: 0 });
}

function dealForInterview(interviewId) {
  return deals.find((item) => item.interviewId === interviewId);
}

function mailReviewRecord(id) {
  return incomingRequests.find((item) => item.id === id) || mailReviewItems.find((item) => item.id === id);
}

function isMailReviewed(id) {
  return state.reviewedMailIds.includes(id);
}

function markMailReviewed(id, action = "確認済みにする") {
  if (!isMailReviewed(id)) {
    state.reviewedMailIds.push(id);
  }

  const record = mailReviewRecord(id);
  state.mailReviewHistory = [
    {
      id,
      reviewedAt: new Date().toLocaleString("ja-JP"),
      subject: record?.subject || id,
      action
    },
    ...state.mailReviewHistory
  ].slice(0, 10);

  saveAppState();
  if (typeof document !== "undefined") {
    render();
  }
}

function mailReviewSummary() {
  const lowConfidenceRequests = incomingRequests.filter((request) => (
    (request.classification?.confidence || 100) < 60 && !isMailReviewed(request.id)
  ));
  const reviewItems = mailReviewItems.filter((item) => !isMailReviewed(item.id));
  return {
    lowConfidenceRequests,
    reviewItems,
    total: lowConfidenceRequests.length + reviewItems.length
  };
}

function sharedLedgerSummary() {
  const batches = matchBatches();
  const proposals = unsentProposals(batches);
  const reviews = mailReviewSummary();
  return [
    { label: "案件メール", count: incomingRequests.length, status: `確認待ち${reviews.total}件`, view: "inbox" },
    { label: "登録スキルシート", count: skillSheets.length, status: "提案可", view: "sheets" },
    { label: "送信先", count: customers.length, status: `停止${customers.filter((customer) => !customer.sendable).length}件`, view: "customers" },
    { label: "マッチング候補", count: batches.reduce((sum, batch) => sum + batch.sendable.length, 0), status: `${state.sendThreshold}点以上`, view: "matches" },
    { label: "未送信", count: proposals.length, status: "確認待ち", view: "overview" },
    { label: "送信履歴", count: histories.length + state.sentProposalIds.length, status: "履歴対象", view: "history" },
    { label: "返信検知", count: replies.length, status: "確認待ち", view: "replies" },
    { label: "面談管理", count: interviews.length, status: "進捗管理", view: "interviews" },
    { label: "成約管理", count: deals.length, status: "粗利確認", view: "deals" }
  ];
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
  const ageOk = !req.maxAge || !talent.age || talent.age <= req.maxAge;
  const commerceOk = req.maxCommerceLevel == null || talent.commerceLevel == null || talent.commerceLevel <= req.maxCommerceLevel;
  const requestNgHits = (req.ngWords || []).filter((word) => normalize(talent.sourceText).includes(normalize(word)));
  const ngWordsOk = requestNgHits.length === 0;
  const eligibilityOk = ageOk && commerceOk && ngWordsOk;
  const cutoff = matchedRequired.length >= Math.ceil(req.required.length * 0.7) && unitOk && locationOk && eligibilityOk;
  const checks = [
    {
      item: "単価",
      ok: unitOk,
      detail: unitOk ? `${talent.unit}万 <= 上限${req.unitMax}万` : `${talent.unit}万 > 上限${req.unitMax}万`
    },
    {
      item: "勤務地/リモート",
      ok: locationOk,
      detail: locationOk ? `${talent.location} / ${talent.workStyle}` : `案件${req.location}に対して人材${talent.location}`
    },
    {
      item: "年齢制限",
      ok: ageOk,
      detail: req.maxAge ? `${talent.age || "不明"}歳 / 上限${req.maxAge}歳` : "条件なし"
    },
    {
      item: "商流制限",
      ok: commerceOk,
      detail: req.maxCommerceLevel == null ? "条件なし" : `${commerceLabel(talent.commerceLevel)} / 上限${commerceLabel(req.maxCommerceLevel)}`
    },
    {
      item: "NGワード",
      ok: ngWordsOk,
      detail: requestNgHits.length ? requestNgHits.join(" / ") : "該当なし"
    }
  ];
  const scoreValue = cutoff
    ? Math.round((matchedRequired.length / req.required.length) * 40)
      + Math.round((matchedNice.length / Math.max(req.nice.length, 1)) * 15)
      + (startOk ? 15 : 8)
      + (unitOk ? 15 : 0)
      + (locationOk ? 15 : 0)
    : Math.min(39, matchedRequired.length * 12 + (unitOk ? 5 : 0) + (eligibilityOk ? 0 : -10));
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
    checks,
    reasons: [
      matchedRequired.length ? `必須一致: ${matchedRequired.join(" / ")}` : "必須一致なし",
      matchedNice.length ? `尚可一致: ${matchedNice.join(" / ")}` : "尚可一致なし",
      unitOk ? "単価OK" : "単価NG",
      locationOk ? "勤務地/リモートOK" : "勤務地NG",
      ageOk ? "年齢OK" : `年齢NG: ${talent.age}歳 / 上限${req.maxAge}歳`,
      commerceOk ? "商流OK" : `商流NG: ${commerceLabel(talent.commerceLevel)} / 上限${commerceLabel(req.maxCommerceLevel)}`,
      ngWordsOk ? "NGワードなし" : `NGワード: ${requestNgHits.join(" / ")}`
    ],
    warning: missing.length ? `不足: ${missing.join(" / ")}` : "大きな不足なし"
  };
}

function rankedMatches(request = selectedRequest()) {
  return skillSheets
    .map((talent) => score(request, talent))
    .sort((a, b) => b.score - a.score);
}

function conditionBlocksUnit(condition, talent) {
  if (!condition.includes("単価") && !condition.includes("万")) return false;
  const limit = parseOptionalNumber(condition);
  if (!limit) return false;
  if (condition.includes("以上")) return talent.unit >= limit;
  return talent.unit > limit;
}

function conditionBlocksAge(condition, talent) {
  if (!talent.age || !/(年齢|歳)/.test(condition)) return false;
  const limit = parseOptionalNumber(condition);
  if (!limit) return false;
  if (condition.includes("以上")) return talent.age >= limit;
  return talent.age > limit;
}

function conditionBlocksCommerce(condition, talent) {
  if (talent.commerceLevel == null) return false;
  const level = extractCommerceLevel(condition);
  if (level == null) return false;
  if (condition.includes("まで") || condition.includes("以下") || condition.includes("以内")) return talent.commerceLevel > level;
  if (condition.includes("以降") || condition.includes("以上") || condition.includes("超") || /NG|ＮＧ|不可|禁止/.test(condition)) return talent.commerceLevel >= level;
  return false;
}

function conditionNgWordHit(condition, combinedText) {
  if (!/NG|ＮＧ|不可|禁止|除外/.test(condition)) return false;
  if (/(単価|年齢|歳|商流)/.test(condition)) return false;
  const candidates = condition
    .replace(/NG|ＮＧ|不可|禁止|除外|のみ|対象外|[:：]/g, " ")
    .split(/[、,|;\s]+/)
    .map((item) => item.trim())
    .filter((item) => item && !/\d/.test(item));
  return candidates.some((word) => normalize(combinedText).includes(normalize(word)));
}

function customerBlockedReasons(customer, request, talent) {
  const blocked = [];
  const ngSkills = customer.ngSkills || [];
  const ngConditions = customer.ngConditions || [];
  const ngWords = customer.ngWords || [];
  const combinedText = `${request.subject || ""}\n${request.sourceText || ""}\n${talent.role || ""}\n${talent.sourceText || ""}\n${talent.skills.join(" ")}`;

  if (!customer.sendable) blocked.push("送信停止");
  if (ngSkills.some((ng) => talent.skills.includes(ng) || request.extracted.workStyle.includes(ng) || talent.workStyle.includes(ng))) blocked.push("NG条件");
  if (ngConditions.some((condition) => conditionBlocksUnit(condition, talent))) blocked.push("単価NG");
  if (customer.maxAge && talent.age && talent.age > customer.maxAge) blocked.push("年齢NG");
  if (customer.maxCommerceLevel !== null && customer.maxCommerceLevel !== undefined && talent.commerceLevel !== null && talent.commerceLevel > customer.maxCommerceLevel) blocked.push("商流NG");
  if (ngWords.some((word) => normalize(combinedText).includes(normalize(word)))) blocked.push("NGワード");

  ngConditions.forEach((condition) => {
    if (conditionBlocksAge(condition, talent)) blocked.push("年齢NG");
    if (conditionBlocksCommerce(condition, talent)) blocked.push("商流NG");
    if (conditionNgWordHit(condition, combinedText)) blocked.push("NGワード");
  });

  return [...new Set(blocked)];
}

function sendTargets(request = selectedRequest(), talent = selectedTalent()) {
  return customers.map((customer) => {
    const blocked = customerBlockedReasons(customer, request, talent);
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
  saveAppState();
  render();
}

function updateSendSetting(field, value) {
  if (field === "autoSend") {
    state.autoSend = value === "on";
  } else {
    state[field] = Number(value);
  }
  saveAppState();
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
  saveAppState();
  render();
  document.getElementById("unsentQueue")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function runTestSendOne() {
  const proposal = unsentProposals()[0];
  if (!proposal) return;
  if (!state.sentProposalIds.includes(proposal.id)) state.sentProposalIds.push(proposal.id);
  saveAppState();
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
  const talents = parseCompanyTestTalentEntries(state.companyTest.talentText);
  const testCustomers = parseCompanyTestCustomers(state.companyTest.customerCsv);
  const candidateMatches = talents
    .map((talent) => score(request, talent))
    .sort((a, b) => b.score - a.score);
  const minScore = Number(state.companyTest.minScore || 80);
  const topTalentLimit = Math.max(Number(state.companyTest.topTalentLimit || 3), 1);
  const eligibleMatches = candidateMatches
    .filter((match) => match.rank !== "除外" && match.score >= minScore)
    .slice(0, topTalentLimit);
  const match = eligibleMatches[0] || candidateMatches[0];
  const talent = talents.find((item) => item.id === match.talentId) || talents[0];
  const targets = sendTargetsForCompanyTest(request, talent, testCustomers);
  state.companyTest.result = { request, talent, talents, match, candidateMatches, eligibleMatches, minScore, topTalentLimit, targets };
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
    const blocked = customerBlockedReasons(customer, request, talent);
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
  const talents = result.talents || [result.talent];
  const nextDecision = companyTestNextDecision(result);
  const ranking = (result.candidateMatches || [result.match]).slice(0, result.topTalentLimit || 3).map((match, index) => {
    const talent = talents.find((item) => item.id === match.talentId) || result.talent;
    return `${index + 1}. ${talent.role}: ${match.score}点 / ${match.rank}`;
  });
  return [
    "SES Auto Send テスト結果",
    `マッチング点数: ${result.match.score}点 / ${result.match.rank}`,
    `提案候補基準: ${result.minScore || state.companyTest.minScore}点以上 / 上位${result.topTalentLimit || state.companyTest.topTalentLimit}名`,
    `判定人材数: ${talents.length}名`,
    `提案候補人材: ${(result.eligibleMatches || []).length}名`,
    `送信可能: ${sendableTargets.length}件`,
    `除外: ${blockedTargets.length}件`,
    "",
    "候補人材ランキング:",
    ...ranking,
    "",
    "送信可能企業:",
    ...sendableTargets.map((target) => `- ${target.company} / ${target.email}`),
    "",
    "除外企業:",
    ...blockedTargets.map((target) => `- ${target.company}: ${target.blocked.join(" / ") || "除外"}`),
    "",
    "PM判定:",
    `${nextDecision.label}: ${nextDecision.detail}`,
    `次アクション: ${nextDecision.action}`,
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

function companyTestNextDecision(result) {
  if (!result) {
    return {
      label: "未実行",
      detail: "テスト結果がまだありません。",
      action: "案件、人材、送信先CSVを入れてマッチング実行する",
      type: ""
    };
  }

  const verdict = companyTestVerdict(result);
  const feedback = companyTestFeedbackStatus();
  const sendableTargets = result.targets.filter((target) => target.canSend);
  const blockedTargets = result.targets.filter((target) => !target.canSend);
  const blockedReasons = companyTestBlockedSummary(result).map((item) => item.reason);
  const hasReadIssue = result.match.score < 60 || result.match.missing.length >= 2;

  if (verdict.type === "ok" && feedback.ready) {
    return {
      label: "本番連携設計へ進む",
      detail: "点数、除外理由、メール文面の確認が揃っています。",
      action: "Gmail/API/DB連携の承認範囲を整理する",
      type: "ok"
    };
  }

  if (verdict.type === "ok") {
    return {
      label: "企業コメント回収",
      detail: "提案可能です。点数、除外理由、メール文面の確認を回収してください。",
      action: "3項目チェックとコメント入力を依頼する",
      type: "warn"
    };
  }

  if (!sendableTargets.length && blockedTargets.length) {
    return {
      label: "送信先条件を見直す",
      detail: `送信可能企業がありません。主な除外理由: ${blockedReasons.join(" / ") || "なし"}`,
      action: "顧客NG条件、送信停止、年齢、商流、単価条件を確認する",
      type: "warn"
    };
  }

  if (hasReadIssue) {
    return {
      label: "読み取り精度を確認",
      detail: "必須スキル不足または低スコアです。ルールベースで拾えていない表現がある可能性があります。",
      action: "項目名辞書と表記ゆれを追加し、必要ならAIプラン候補に回す",
      type: "bad"
    };
  }

  return {
    label: "ルール調整",
    detail: "一部条件は合っています。送信基準点や除外条件の調整対象です。",
    action: "点数内訳と除外理由を見てルールを修正する",
    type: "warn"
  };
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
  const minScore = result.minScore || state.companyTest.minScore || 80;
  if (result.match.score >= minScore && result.match.rank !== "除外" && sendableTargets.length > 0) {
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
    ...result.match.checks.map((check) => ({
      item: check.item,
      status: check.ok ? "OK" : "要確認",
      detail: check.detail
    })),
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

function companyTestFeedbackStatus() {
  const checked = Object.values(state.companyTest.feedbackChecks).filter(Boolean).length;
  const hasComment = state.companyTest.feedbackText.trim().length > 0;
  const ready = checked === 3 && hasComment;
  return {
    checked,
    hasComment,
    ready,
    label: ready ? "回収準備OK" : "確認中",
    detail: ready
      ? "コメントと3項目の確認が揃っています。テスト結果レポートを保存してください。"
      : "点数、除外理由、メール文面の確認チェックとコメント入力をお願いします。"
  };
}

function companyTestCsvTemplate() {
  return [
    "company,person,email,sendable,ngSkills,ngConditions,ngWords,maxAge,maxCommerceLevel",
    "株式会社サンプル,田中,tanaka@example.invalid,送信可,,,,,",
    "株式会社停止先,佐藤,sato@example.invalid,停止,,,,,",
    "株式会社NG先,鈴木,suzuki@example.invalid,送信可,常駐のみ,単価70万円超NG,外国籍,45,2"
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
    feedbackChecks: state.companyTest.feedbackChecks,
    minScore: state.companyTest.minScore,
    topTalentLimit: state.companyTest.topTalentLimit
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
  state.companyTest.minScore = Number(packageData.minScore || state.companyTest.minScore);
  state.companyTest.topTalentLimit = Number(packageData.topTalentLimit || state.companyTest.topTalentLimit);
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
    <section class="panel">
      <div class="toolbar">
        <h2>共有台帳サマリー</h2>
        <span class="muted">PMハブ用の現在地です。実データ保存、外部送信、API接続はしていません。</span>
      </div>
      ${table(
        ["項目", "件数", "状態", "見る"],
        sharedLedgerSummary().map((item) => `
          <tr>
            <td><strong>${item.label}</strong></td>
            <td>${item.count}件</td>
            <td>${item.status}</td>
            <td><button class="small-action" onclick="setView('${item.view}')">開く</button></td>
          </tr>
        `)
      )}
    </section>
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
  const reviews = mailReviewSummary();
  return `
    <section class="panel">
      <div class="toolbar">
        <h2>確認待ちメール</h2>
        <span class="muted">低信頼度・判定不能のメールだけを確認します。外部送信はしません。</span>
      </div>
      ${reviews.total ? table(
        ["受信", "件名", "分類", "信頼度", "検出場所/理由", "操作"],
        [
          ...reviews.lowConfidenceRequests.map((request) => `
            <tr>
              <td>${request.receivedAt}<br><span class="muted">${request.fromAddress}</span></td>
              <td><strong>${request.subject}</strong><br><span class="muted">${request.attachment}</span></td>
              <td><span class="status warn">${request.classification.type}</span></td>
              <td><strong>${request.classification.confidence}</strong><br><span class="muted">要確認</span></td>
              <td>${escapeHtml(request.classification.sourceSummary)}<br><span class="muted">${escapeHtml(request.classification.reason)}</span></td>
              <td>
                <button class="small-action is-primary" onclick="markMailReviewed('${request.id}', '案件として確認済み')">確認済みにする</button>
                <button class="small-action" onclick="setRequest('${request.id}'); setView('matches')">マッチング</button>
              </td>
            </tr>
          `),
          ...reviews.reviewItems.map((item) => `
            <tr>
              <td>${item.receivedAt}<br><span class="muted">${item.fromAddress}</span></td>
              <td><strong>${item.subject}</strong><br><span class="muted">${item.id}</span></td>
              <td><span class="status bad">${item.type}</span></td>
              <td><strong>${item.confidence}</strong><br><span class="muted">保留</span></td>
              <td>${escapeHtml(item.sourceSummary)}<br><span class="muted">${escapeHtml(item.reason)}</span></td>
              <td><button class="small-action is-primary" onclick="markMailReviewed('${item.id}', '確認済みにする')">確認済みにする</button></td>
            </tr>
          `)
        ]
      ) : `<p class="muted">確認待ちメールはありません。</p>`}
      ${state.mailReviewHistory.length ? `
        <div class="review-history">
          <h3>確認済み履歴</h3>
          ${table(
            ["日時", "件名", "対応"],
            state.mailReviewHistory.map((item) => `
              <tr>
                <td>${item.reviewedAt}</td>
                <td>${escapeHtml(item.subject)}</td>
                <td>${escapeHtml(item.action)}</td>
              </tr>
            `)
          )}
        </div>
      ` : ""}
    </section>
    <section class="panel">
      <h2>案件メール</h2>
      ${table(
        ["受信", "件名/添付", "抽出条件", "分類", "状態", "操作"],
        incomingRequests.filter(matchesQuery).map((request) => `
          <tr>
            <td>${request.receivedAt}<br><span class="muted">${request.fromAddress}</span></td>
            <td><strong>${request.subject}</strong><br>${request.attachment} / ${request.fileType}</td>
            <td>${request.extracted.required.join(" / ")}<br>${request.extracted.location} / ${request.extracted.workStyle} / ${request.extracted.unitMax}万円</td>
            <td>${request.classification ? `${request.classification.type}<br><span class="muted">${request.classification.confidence} / ${request.classification.sourceSummary}</span>` : "-"}</td>
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
        ["送信日時", "会社/メール", "案件", "人材", "状態", "面談", "件名"],
        histories.filter(matchesQuery).map((item) => `
          <tr>
            <td>${item.sentAt}</td>
            <td><strong>${item.company}</strong><br>${item.email}</td>
            <td>${item.request}</td>
            <td>${item.talent}</td>
            <td><span class="status ${item.status === "返信あり" ? "ok" : "warn"}">${item.status}</span></td>
            <td>${interviewForHistory(item.id) ? pill(interviewForHistory(item.id).status) : pill("未設定", "gray")}</td>
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
        ["受信", "返信元/件名", "紐づけ", "面談", "検知理由", "次アクション"],
        replies.filter(matchesQuery).map((reply) => `
          <tr>
            <td>${reply.receivedAt}</td>
            <td>${reply.from}<br><strong>${reply.subject}</strong></td>
            <td>${reply.linkedHistory}</td>
            <td>${interviewForHistory(reply.linkedHistory) ? pill(interviewForHistory(reply.linkedHistory).status) : pill("未設定", "gray")}</td>
            <td>${reply.detected}</td>
            <td>${reply.nextAction}</td>
          </tr>
        `)
      )}
    </section>
  `;
}

function renderInterviews() {
  const summary = interviewSummary();
  return `
    <section class="panel">
      <div class="toolbar">
        <h2>面談管理</h2>
        <span class="muted">返信後の面談予定、結果待ち、見送り、次アクションを管理します。</span>
      </div>
      <div class="metrics">
        <div class="metric is-success"><span>面談予定</span><strong>${summary["面談予定"] || 0}</strong><small>日程あり</small></div>
        <div class="metric is-accent"><span>結果待ち</span><strong>${summary["結果待ち"] || 0}</strong><small>確認中</small></div>
        <div class="metric is-danger"><span>見送り</span><strong>${summary["見送り"] || 0}</strong><small>再提案対象</small></div>
        <div class="metric"><span>総件数</span><strong>${interviews.length}</strong><small>ダミーデータ</small></div>
      </div>
      ${table(
        ["予定日時", "会社", "案件", "人材", "状態", "成約", "結果", "次アクション"],
        interviews.filter(matchesQuery).map((item) => `
          <tr>
            <td>${item.scheduledAt}</td>
            <td><strong>${item.company}</strong><br><span class="muted">${item.historyId}</span></td>
            <td>${item.request}</td>
            <td>${item.talent}</td>
            <td><span class="status ${item.status === "面談予定" ? "ok" : item.status === "見送り" ? "bad" : "warn"}">${item.status}</span></td>
            <td>${dealForInterview(item.id) ? pill(dealForInterview(item.id).status, dealForInterview(item.id).status === "失注" ? "danger" : "") : pill("未設定", "gray")}</td>
            <td>${item.result}</td>
            <td>${item.nextAction}</td>
          </tr>
        `)
      )}
    </section>
  `;
}

function renderDeals() {
  const summary = dealSummary();
  const grossRate = summary.sales ? Math.round((summary.gross / summary.sales) * 100) : 0;
  return `
    <section class="panel">
      <div class="toolbar">
        <h2>成約管理</h2>
        <span class="muted">成約、条件調整、失注、売上単価、支払単価、粗利を確認します。</span>
      </div>
      <div class="metrics">
        <div class="metric is-success"><span>成約</span><strong>${summary.closed}</strong><small>件</small></div>
        <div class="metric is-danger"><span>失注</span><strong>${summary.lost}</strong><small>件</small></div>
        <div class="metric is-accent"><span>月額売上</span><strong>${summary.sales}</strong><small>万円</small></div>
        <div class="metric"><span>粗利</span><strong>${summary.gross}</strong><small>万円 / ${grossRate}%</small></div>
      </div>
      ${table(
        ["開始月", "会社", "案件", "人材", "状態", "売上", "支払", "粗利", "次アクション"],
        deals.filter(matchesQuery).map((deal) => `
          <tr>
            <td>${deal.startMonth}</td>
            <td><strong>${deal.company}</strong><br><span class="muted">${deal.interviewId}</span></td>
            <td>${deal.request}</td>
            <td>${deal.talent}</td>
            <td><span class="status ${deal.status === "成約" ? "ok" : deal.status === "失注" ? "bad" : "warn"}">${deal.status}</span></td>
            <td>${deal.salesUnit}万円</td>
            <td>${deal.payUnit}万円</td>
            <td><strong>${dealGrossProfit(deal)}万円</strong><br><span class="muted">${dealGrossRate(deal)}%</span></td>
            <td>${deal.nextAction}</td>
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
    <section class="panel">
      <div class="toolbar">
        <div>
          <h2>企業テスト</h2>
          <p class="muted">通常の管理画面ではありません。外部送信なしで、マッチング精度を検証する時だけ使います。</p>
        </div>
        <button class="ghost-action" onclick="setView('companyTest')">企業テストを開く</button>
      </div>
    </section>
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
  const feedbackStatus = companyTestFeedbackStatus();
  const inputStatus = companyTestInputStatus();
  const parsedSummary = companyTestParsedSummary();
  const nextDecision = companyTestNextDecision(result);

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
      <div class="test-flow-panel">
        <div>
          <span>STEP 1</span>
          <strong>貼り付け</strong>
          <small>案件、人材、送信先CSVを入れる</small>
        </div>
        <div>
          <span>STEP 2</span>
          <strong>判定を見る</strong>
          <small>点数、送信可能企業、除外理由を見る</small>
        </div>
        <div>
          <span>STEP 3</span>
          <strong>コメント回収</strong>
          <small>違和感を書いてレポート保存</small>
        </div>
      </div>
      <div class="acceptance-panel">
        <strong>企業テストの合格ライン</strong>
        <span>点数・除外理由・メール文面の3つが営業感覚と大きくズレていなければ、次は本番連携設計へ進めます。</span>
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
          <span>複数人材を貼れます。人材ごとに --- で区切るとランキング判定します。</span>
        </div>
        <div class="guide-card">
          <strong>送信先CSV</strong>
          <span>必須列は company, person, email, sendable。会社名、担当者名、メールアドレス、送信可否などの日本語ヘッダーも使えます。</span>
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
      <div class="input-status-grid">
        ${inputStatus.map((item) => `
          <div class="input-status-card ${item.ok ? "ok" : "warn"}">
            <strong>${item.label}</strong>
            <span>${item.ok ? "OK" : "要確認"}</span>
            <small>${escapeHtml(item.detail)}</small>
          </div>
        `).join("")}
      </div>
      <section class="read-summary">
        <div class="toolbar">
          <h2>読み取り結果</h2>
          <span class="muted">貼り付けた内容をどう解釈したかの確認用です。</span>
        </div>
        ${table(
          ["対象", "読み取り", "内容"],
          parsedSummary.map((item) => `
            <tr>
              <td><strong>${item.item}</strong></td>
              <td>${escapeHtml(item.value)}</td>
              <td>${escapeHtml(item.detail)}</td>
            </tr>
          `)
        )}
      </section>
      <section class="test-settings">
        <div>
          <label class="field compact-field">
            <span>提案候補の最低点</span>
            <input type="number" min="40" max="100" step="5" value="${state.companyTest.minScore}" oninput="updateCompanyTestNumber('minScore', this.value)">
          </label>
        </div>
        <div>
          <label class="field compact-field">
            <span>表示する上位人材数</span>
            <input type="number" min="1" max="10" step="1" value="${state.companyTest.topTalentLimit}" oninput="updateCompanyTestNumber('topTalentLimit', this.value)">
          </label>
        </div>
        <p class="muted">企業テスト用の一時設定です。実送信や外部連携は発生しません。</p>
      </section>
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
      <section class="panel next-decision-panel ${nextDecision.type}">
        <div>
          <span>PM判定</span>
          <h2>${nextDecision.label}</h2>
          <p>${nextDecision.detail}</p>
        </div>
        <strong>${nextDecision.action}</strong>
      </section>
      <div class="metrics">
        <div class="metric is-accent"><span>マッチング点数</span><strong>${result.match.score}</strong><small>${result.match.rank}</small></div>
        <div class="metric"><span>判定人材</span><strong>${(result.talents || [result.talent]).length}</strong><small>ランキング対象</small></div>
        <div class="metric is-success"><span>提案候補人材</span><strong>${(result.eligibleMatches || []).length}</strong><small>${result.minScore}点以上</small></div>
        <div class="metric is-success"><span>送信可能</span><strong>${sendableTargets.length}</strong><small>個別送信候補</small></div>
        <div class="metric is-danger"><span>除外</span><strong>${blockedTargets.length}</strong><small>NG/停止</small></div>
      </div>
      <section class="panel">
        <h2>候補人材ランキング</h2>
        ${table(
          ["順位", "人材", "点数", "主な理由"],
          (result.candidateMatches || [result.match]).slice(0, result.topTalentLimit || state.companyTest.topTalentLimit || 3).map((match, index) => {
            const talent = (result.talents || [result.talent]).find((item) => item.id === match.talentId) || result.talent;
            const isEligible = (result.eligibleMatches || []).some((eligible) => eligible.talentId === match.talentId);
            return `
              <tr>
                <td><strong>${index + 1}</strong></td>
                <td><strong>${escapeHtml(talent.role)}</strong><br><span class="muted">${talent.code}</span></td>
                <td><strong>${match.score}点</strong><br><span class="status ${isEligible ? "ok" : "hold"}">${isEligible ? "候補" : "基準外"}</span></td>
                <td>${matchBreakdown(match)}</td>
              </tr>
            `;
          })
        )}
      </section>
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
          <section class="feedback-status ${feedbackStatus.ready ? "ready" : ""}">
            <strong>${feedbackStatus.label}</strong>
            <span>${feedbackStatus.detail}</span>
            <small>確認 ${feedbackStatus.checked}/3 / コメント ${feedbackStatus.hasComment ? "あり" : "なし"}</small>
          </section>
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
            <select onchange="updateSendSetting('autoSend', this.value)">
              <option value="off" ${state.autoSend ? "" : "selected"}>OFF: 人が確認して送信</option>
              <option value="on" ${state.autoSend ? "selected" : ""}>ON: 条件を満たしたら自動送信</option>
            </select>
          </div>
          <div class="field">
            <label>送信するマッチング点数</label>
            <select onchange="updateSendSetting('sendThreshold', this.value)">
              <option value="80" ${state.sendThreshold === 80 ? "selected" : ""}>80点以上だけ送信</option>
              <option value="70" ${state.sendThreshold === 70 ? "selected" : ""}>70点以上だけ送信</option>
              <option value="60" ${state.sendThreshold === 60 ? "selected" : ""}>60点以上だけ送信</option>
            </select>
          </div>
          <div class="field">
            <label>同一人材の送信上限</label>
            <select onchange="updateSendSetting('maxSendPerTalent', this.value)">
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
    interviews: "面談管理",
    deals: "成約管理",
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
  if (typeof document === "undefined") return;
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
    interviews: renderInterviews,
    deals: renderDeals,
    test: renderTestConsole,
    companyTest: renderCompanyTest,
    settings: renderSettings
  };
  const content = document.getElementById("content");
  if (content) content.innerHTML = views[state.view]();
}

if (typeof document !== "undefined") {
  loadAppState();
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
    interviews,
    deals,
    interviewSummary,
    interviewForHistory,
    dealSummary,
    dealForInterview,
    dealGrossProfit,
    dealGrossRate,
    saveAppState,
    loadAppState,
    updateSendSetting,
    mailReviewSummary,
    markMailReviewed,
    sharedLedgerSummary,
    score,
    rankedMatches,
    matchBatches,
    sendTargets,
    unsentProposals,
    proposalId,
    renderTestConsole,
    runTestSendOne,
    updateCompanyTestField,
    updateCompanyTestNumber,
    updateCompanyTestFeedbackCheck,
    resetCompanyTestSample,
    applyCompanyTestPreset,
    clearCompanyTestInput,
    clearCompanyTestHistory,
    addCompanyTestHistory,
    customerBlockedReasons,
    sendTargetsForCompanyTest,
    parseCompanyTestRequest,
    parseCompanyTestTalent,
    parseCompanyTestTalentEntries,
    parseCompanyTestCsvRows,
    companyTestCsvHeaders,
    parseCompanyTestCustomers,
    validateCompanyTestInput,
    companyTestInputStatus,
    companyTestParsedSummary,
    companyTestReport,
    companyTestVerdict,
    companyTestNextDecision,
    companyTestScoreRows,
    companyTestBlockedSummary,
    companyTestFeedbackStatus,
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

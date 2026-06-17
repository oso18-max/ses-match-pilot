const fs = require("node:fs");
const path = require("node:path");
const { buildScenario } = require("./mail-ingest-runner.cjs");
const { collectSendableRows } = require("./matching-runner.cjs");
const { loadCustomersFromCsv } = require("./customer-csv-importer.cjs");

const inboxPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, "sample-mail-inbox.json");
const customerCsvPath = process.argv[3] ? path.resolve(process.argv[3]) : null;

function readInbox(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function findDraftParts(scenario, row) {
  return {
    request: scenario.requests.find((item) => item.id === row.request),
    talent: scenario.talents.find((item) => item.code === row.talent),
    customer: scenario.customers.find((item) => item.company === row.company)
  };
}

function createDraft({ request, talent, customer, row }) {
  const reviewItems = [
    ...(request.missingFields || []).map((field) => `案件:${field}`),
    ...(talent.missingFields || []).map((field) => `人材:${field}`)
  ];
  return {
    to: customer.email,
    customerId: customer.id,
    company: customer.company,
    person: customer.person,
    templateGroup: customer.templateGroup || "標準",
    subject: `${talent.role}人材のご提案`,
    request: request.subject,
    talent: talent.code,
    score: row.score,
    rank: row.rank,
    status: reviewItems.length ? "確認必要" : "下書き",
    reviewItems,
    body: `${customer.company}
${customer.person}様

いつもお世話になっております。
下記人材をご提案いたします。

【案件】${request.subject}
【候補者】${talent.code}
【職種】${talent.role}
【スキル】${talent.skills.join(" / ")}
【希望単価】${talent.unit}万円
【稼働】${talent.available}
【勤務地】${talent.location}
【確認事項】${reviewItems.join(" / ") || "なし"}

マッチングスコア: ${row.score}点（${row.rank}）

ご確認のほどよろしくお願いいたします。`
  };
}

function buildDrafts(inbox, options = {}) {
  const scenario = buildScenario(inbox, options);
  const rows = collectSendableRows(scenario.requests, scenario.talents, scenario.customers, scenario.settings)
    .filter((row) => row.sendStatus === "未送信候補");
  return rows.map((row) => createDraft({ ...findDraftParts(scenario, row), row }));
}

function run() {
  const options = customerCsvPath ? { customers: loadCustomersFromCsv(customerCsvPath) } : {};
  const drafts = buildDrafts(readInbox(inboxPath), options);
  console.log(`提案メール下書き: ${drafts.length}件`);
  console.table(drafts.map((draft) => ({
    to: draft.to,
    company: draft.company,
    talent: draft.talent,
    score: draft.score,
    rank: draft.rank,
    status: draft.status,
    subject: draft.subject
  })));
  if (drafts[0]) {
    console.log("\n--- preview 1 ---");
    console.log(drafts[0].body);
  }
}

if (require.main === module) run();

module.exports = {
  buildDrafts,
  createDraft
};

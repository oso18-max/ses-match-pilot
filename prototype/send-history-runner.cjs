const fs = require("node:fs");
const path = require("node:path");
const { buildDrafts } = require("./proposal-preview-runner.cjs");
const { loadCustomersFromCsv } = require("./customer-csv-importer.cjs");

const inboxPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, "sample-mail-inbox.json");
const customerCsvPath = process.argv[3] ? path.resolve(process.argv[3]) : null;

function readInbox(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function createHistoryItem(draft, index) {
  return {
    id: `send_hist_${String(index + 1).padStart(3, "0")}`,
    sentAt: "2026-06-17 12:00",
    status: "仮送信済み",
    reviewStatus: draft.status,
    customerId: draft.customerId,
    company: draft.company,
    to: draft.to,
    templateGroup: draft.templateGroup,
    subject: draft.subject,
    request: draft.request,
    talent: draft.talent,
    score: draft.score,
    rank: draft.rank,
    reviewItems: draft.reviewItems
  };
}

function buildSendHistory(inbox, options = {}) {
  return buildDrafts(inbox, options).map(createHistoryItem);
}

function run() {
  const options = customerCsvPath ? { customers: loadCustomersFromCsv(customerCsvPath) } : {};
  const history = buildSendHistory(readInbox(inboxPath), options);
  console.log(`送信履歴 仮記録: ${history.length}件`);
  console.table(history.map((item) => ({
    id: item.id,
    sentAt: item.sentAt,
    status: item.status,
    review: item.reviewStatus,
    company: item.company,
    talent: item.talent,
    score: item.score
  })));
}

if (require.main === module) run();

module.exports = {
  buildSendHistory,
  createHistoryItem
};

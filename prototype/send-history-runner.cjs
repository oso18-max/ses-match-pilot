const fs = require("node:fs");
const path = require("node:path");
const { buildDrafts } = require("./proposal-preview-runner.cjs");

const inboxPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, "sample-mail-inbox.json");

function readInbox(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function createHistoryItem(draft, index) {
  return {
    id: `send_hist_${String(index + 1).padStart(3, "0")}`,
    sentAt: "2026-06-17 12:00",
    status: "仮送信済み",
    reviewStatus: draft.status,
    company: draft.company,
    to: draft.to,
    subject: draft.subject,
    request: draft.request,
    talent: draft.talent,
    score: draft.score,
    rank: draft.rank,
    reviewItems: draft.reviewItems
  };
}

function buildSendHistory(inbox) {
  return buildDrafts(inbox).map(createHistoryItem);
}

function run() {
  const history = buildSendHistory(readInbox(inboxPath));
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

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

function queueStatus(draft, settings = {}) {
  if (draft.reviewItems.length) return "確認待ち";
  if (settings.autoSend) return "自動送信待ち";
  return "手動送信待ち";
}

function createQueueItem(draft, index, settings = {}) {
  return {
    id: `send_queue_${String(index + 1).padStart(3, "0")}`,
    status: queueStatus(draft, settings),
    mode: settings.autoSend ? "auto" : "manual",
    customerId: draft.customerId,
    company: draft.company,
    to: draft.to,
    templateGroup: draft.templateGroup,
    subject: draft.subject,
    request: draft.request,
    talent: draft.talent,
    score: draft.score,
    rank: draft.rank,
    reviewItems: draft.reviewItems,
    body: draft.body
  };
}

function buildSendQueue(inbox, options = {}) {
  return buildDrafts(inbox, options).map((draft, index) => createQueueItem(draft, index, options.settings || {}));
}

function summarizeQueue(queue) {
  return queue.reduce((summary, item) => {
    summary.total += 1;
    summary[item.status] = (summary[item.status] || 0) + 1;
    return summary;
  }, { total: 0 });
}

function run() {
  const options = customerCsvPath ? { customers: loadCustomersFromCsv(customerCsvPath) } : {};
  const queue = buildSendQueue(readInbox(inboxPath), options);
  console.log(`送信予定キュー: ${queue.length}件`);
  console.table([summarizeQueue(queue)]);
  console.table(queue.map((item) => ({
    id: item.id,
    status: item.status,
    company: item.company,
    talent: item.talent,
    score: item.score,
    review: item.reviewItems.join(" / ") || "-"
  })));
}

if (require.main === module) run();

module.exports = {
  buildSendQueue,
  createQueueItem,
  queueStatus,
  summarizeQueue
};

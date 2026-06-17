const fs = require("node:fs");
const path = require("node:path");
const { loadCustomersFromCsv } = require("./customer-csv-importer.cjs");
const { buildSendQueue } = require("./send-queue-runner.cjs");

const inboxPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, "sample-mail-inbox.json");
const customerCsvPath = process.argv[3] ? path.resolve(process.argv[3]) : null;

function readInbox(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function canExecute(item) {
  return item.status === "手動送信待ち" || item.status === "自動送信待ち";
}

function executeQueue(queue, options = {}) {
  const executedAt = options.executedAt || "2026-06-17 12:05";
  const executed = [];
  const skipped = [];

  queue.forEach((item, index) => {
    if (!canExecute(item)) {
      skipped.push({
        queueId: item.id,
        status: "未送信",
        reason: item.reviewItems.join(" / ") || item.status,
        company: item.company,
        talent: item.talent
      });
      return;
    }

    executed.push({
      id: `send_exec_${String(index + 1).padStart(3, "0")}`,
      queueId: item.id,
      sentAt: executedAt,
      status: "送信済み",
      mode: item.mode,
      customerId: item.customerId,
      company: item.company,
      to: item.to,
      templateGroup: item.templateGroup,
      subject: item.subject,
      request: item.request,
      talent: item.talent,
      score: item.score,
      rank: item.rank
    });
  });

  return { executed, skipped };
}

function run() {
  const options = customerCsvPath ? { customers: loadCustomersFromCsv(customerCsvPath) } : {};
  const queue = buildSendQueue(readInbox(inboxPath), options);
  const result = executeQueue(queue);
  console.log(`送信確定シミュレーション: 送信 ${result.executed.length}件 / 未送信 ${result.skipped.length}件`);
  console.table(result.executed.map((item) => ({
    id: item.id,
    mode: item.mode,
    company: item.company,
    talent: item.talent,
    sentAt: item.sentAt
  })));
  console.table(result.skipped);
}

if (require.main === module) run();

module.exports = {
  canExecute,
  executeQueue
};

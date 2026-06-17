const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { loadCustomersFromCsv } = require("./customer-csv-importer.cjs");
const { buildSendQueue, queueStatus, summarizeQueue } = require("./send-queue-runner.cjs");

const inbox = JSON.parse(fs.readFileSync(path.join(__dirname, "sample-mail-inbox.json"), "utf8"));
const queue = buildSendQueue(inbox);
const csvQueue = buildSendQueue(inbox, {
  customers: loadCustomersFromCsv(path.join(__dirname, "sample-customers.csv"))
});

assert.equal(queue.length, 3);
assert.equal(queue[0].status, "確認待ち");
assert.equal(queue[0].mode, "manual");
assert.equal(queue[0].body.includes("マッチングスコア"), true);
assert.deepEqual(summarizeQueue(queue), { total: 3, "確認待ち": 3 });

assert.equal(csvQueue.length, 2);
assert.equal(csvQueue[0].customerId, "customer_csv_001");
assert.equal(csvQueue.some((item) => item.company === "株式会社ガンマ"), false);
assert.equal(queueStatus({ reviewItems: [] }, { autoSend: false }), "手動送信待ち");
assert.equal(queueStatus({ reviewItems: [] }, { autoSend: true }), "自動送信待ち");

console.log("OK: send queue smoke test passed");
console.table(csvQueue.map((item) => ({
  id: item.id,
  status: item.status,
  company: item.company,
  talent: item.talent,
  score: item.score
})));

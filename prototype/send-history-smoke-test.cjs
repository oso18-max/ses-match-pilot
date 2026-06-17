const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildSendHistory } = require("./send-history-runner.cjs");
const { loadCustomersFromCsv } = require("./customer-csv-importer.cjs");

const inbox = JSON.parse(fs.readFileSync(path.join(__dirname, "sample-mail-inbox.json"), "utf8"));
const history = buildSendHistory(inbox);
const csvHistory = buildSendHistory(inbox, {
  customers: loadCustomersFromCsv(path.join(__dirname, "sample-customers.csv"))
});

assert.equal(history.length, 3);
assert.equal(history[0].status, "仮送信済み");
assert.equal(history[0].reviewStatus, "確認必要");
assert.equal(history[0].company, "株式会社アルファ");
assert.equal(history[0].to, "tanaka@alpha.example.invalid");
assert.equal(history[0].talent, "ingested_engineer_002");
assert.equal(history[0].score, 100);
assert.ok(history[0].request.includes("Java"));
assert.equal(csvHistory.length, 3);
assert.equal(csvHistory[0].customerId, "customer_csv_001");
assert.equal(csvHistory[0].templateGroup, "標準");
assert.equal(csvHistory.some((item) => item.company === "株式会社ガンマ"), false);

console.log("OK: send history smoke test passed");
console.table(history.map((item) => ({
  id: item.id,
  status: item.status,
  review: item.reviewStatus,
  company: item.company,
  talent: item.talent,
  score: item.score
})));

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildSendHistory } = require("./send-history-runner.cjs");

const inbox = JSON.parse(fs.readFileSync(path.join(__dirname, "sample-mail-inbox.json"), "utf8"));
const history = buildSendHistory(inbox);

assert.equal(history.length, 3);
assert.equal(history[0].status, "仮送信済み");
assert.equal(history[0].reviewStatus, "確認必要");
assert.equal(history[0].company, "株式会社アルファ");
assert.equal(history[0].to, "tanaka@alpha.example.invalid");
assert.equal(history[0].talent, "ingested_engineer_002");
assert.equal(history[0].score, 100);
assert.ok(history[0].request.includes("Java"));

console.log("OK: send history smoke test passed");
console.table(history.map((item) => ({
  id: item.id,
  status: item.status,
  review: item.reviewStatus,
  company: item.company,
  talent: item.talent,
  score: item.score
})));

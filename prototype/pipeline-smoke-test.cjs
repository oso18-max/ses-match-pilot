const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { aggregateConfirmationNeeded, runPipeline } = require("./pipeline-runner.cjs");
const { loadCustomersFromCsv } = require("./customer-csv-importer.cjs");

const inbox = JSON.parse(fs.readFileSync(path.join(__dirname, "sample-mail-inbox.json"), "utf8"));
const replies = JSON.parse(fs.readFileSync(path.join(__dirname, "sample-replies.json"), "utf8"));
const result = runPipeline(inbox, replies);
const csvResult = runPipeline(inbox, replies, {
  customers: loadCustomersFromCsv(path.join(__dirname, "sample-customers.csv"))
});

assert.equal(result.scenario.classifications.length, 6);
assert.equal(result.scenario.requests.length, 3);
assert.equal(result.scenario.talents.length, 2);
assert.equal(result.scenario.pending.length, 2);
assert.equal(result.sendableRows.length, 3);
assert.equal(result.drafts.length, 3);
assert.equal(result.queue.length, 3);
assert.equal(result.history.length, 3);
assert.equal(result.replyResults.length, 3);
assert.equal(result.replyCandidates.length, 6);
assert.equal(result.replyResults[0].candidates[0].status, "返信候補");
assert.equal(result.replyResults[2].candidates.length, 0);
assert.equal(csvResult.scenario.customers.length, 3);
assert.equal(csvResult.sendableRows.length, 2);
assert.equal(csvResult.drafts.length, 2);
assert.equal(csvResult.queue.length, 2);
assert.equal(csvResult.history[0].customerId, "customer_csv_001");
assert.equal(csvResult.history.some((item) => item.company === "株式会社ガンマ"), false);

const aggregated = aggregateConfirmationNeeded([
  { kind: "下書き確認", id: "ingested_engineer_002", status: "確認必要", reason: "人材:勤務地" },
  { kind: "下書き確認", id: "ingested_engineer_002", status: "確認必要", reason: "人材:勤務地" },
  { kind: "返信確認", id: "reply_003", status: "未照合", reason: "一致なし" }
]);
assert.equal(aggregated.length, 2);
assert.equal(aggregated.find((row) => row.id === "ingested_engineer_002").count, 2);

console.log("OK: pipeline smoke test passed");
console.table([{
  mails: result.scenario.classifications.length,
  requests: result.scenario.requests.length,
  talents: result.scenario.talents.length,
  pending: result.scenario.pending.length,
  sendable: result.sendableRows.length,
  drafts: result.drafts.length,
  queue: result.queue.length,
  history: result.history.length,
  replies: result.replyResults.length
}]);

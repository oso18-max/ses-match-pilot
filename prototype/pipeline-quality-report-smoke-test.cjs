const assert = require("node:assert/strict");
const path = require("node:path");
const { aggregateConfirmationRows, confirmationCsvRows, summarize } = require("./pipeline-quality-report.cjs");

const normal = summarize(path.join(__dirname, "sample-mail-inbox.json"));
const edge = summarize(path.join(__dirname, "sample-mail-edge-cases.json"));

assert.equal(normal.file, "sample-mail-inbox.json");
assert.equal(normal.mails, 6);
assert.equal(normal.sendable, 3);
assert.equal(normal.confirmationNeeded, 7);
assert.equal(normal.categoryCounts["判定不能"], 1);
assert.equal(normal.categoryCounts["抽出不足"], 3);

assert.equal(edge.file, "sample-mail-edge-cases.json");
assert.equal(edge.mails, 6);
assert.equal(edge.sendable, 2);
assert.equal(edge.confirmationNeeded, 6);
assert.equal(edge.categoryCounts["判定不能"], 2);
assert.equal(edge.categoryCounts["その他"], 1);

const normalRows = confirmationCsvRows(path.join(__dirname, "sample-mail-inbox.json"));
assert.equal(normalRows.length, 7);
assert.deepEqual(Object.keys(normalRows[0]), ["file", "id", "category", "kind", "status", "reason"]);
assert.equal(normalRows.some((row) => row.category === "判定不能"), true);
assert.equal(normalRows.some((row) => row.category === "抽出不足"), true);

const aggregatedRows = aggregateConfirmationRows(normalRows);
const locationRow = aggregatedRows.find((row) => row.id === "ingested_engineer_002" && row.reason === "人材:勤務地");
assert.equal(locationRow.count, 3);
assert.equal(aggregatedRows.length < normalRows.length, true);

console.log("OK: pipeline quality report smoke test passed");
console.table([
  { file: normal.file, sendable: normal.sendable, confirmationNeeded: normal.confirmationNeeded },
  { file: edge.file, sendable: edge.sendable, confirmationNeeded: edge.confirmationNeeded }
]);

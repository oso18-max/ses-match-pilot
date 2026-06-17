const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { runPipeline } = require("./pipeline-runner.cjs");

const inbox = JSON.parse(fs.readFileSync(path.join(__dirname, "sample-mail-edge-cases.json"), "utf8"));
const replies = JSON.parse(fs.readFileSync(path.join(__dirname, "sample-replies.json"), "utf8"));
const result = runPipeline(inbox, replies);

const types = result.scenario.classifications.map((item) => item.type);
assert.deepEqual(types, ["人材", "案件", "判定不能", "その他", "複合", "判定不能"]);
assert.equal(result.scenario.requests.length, 2);
assert.equal(result.scenario.talents.length, 2);
assert.equal(result.scenario.pending.length, 3);
assert.equal(result.sendableRows.length, 2);
assert.equal(result.drafts.length, 2);
assert.equal(result.history.length, 2);

const pendingIds = result.scenario.pending.map((item) => item.id);
assert.deepEqual(pendingIds, ["edge_003", "edge_004", "edge_006"]);

console.log("OK: pipeline edge smoke test passed");
console.table(result.scenario.classifications.map((item) => ({
  id: item.id,
  type: item.type,
  location: item.location,
  subject: item.subject
})));
console.table(result.sendableRows.map((row) => ({
  request: row.request,
  talent: row.talent,
  company: row.company,
  score: row.score,
  rank: row.rank
})));

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { runPipeline } = require("./pipeline-runner.cjs");

const inbox = JSON.parse(fs.readFileSync(path.join(__dirname, "sample-mail-inbox.json"), "utf8"));
const replies = JSON.parse(fs.readFileSync(path.join(__dirname, "sample-replies.json"), "utf8"));
const result = runPipeline(inbox, replies);

assert.equal(result.scenario.classifications.length, 6);
assert.equal(result.scenario.requests.length, 3);
assert.equal(result.scenario.talents.length, 2);
assert.equal(result.scenario.pending.length, 2);
assert.equal(result.sendableRows.length, 3);
assert.equal(result.drafts.length, 3);
assert.equal(result.history.length, 3);
assert.equal(result.replyResults.length, 3);
assert.equal(result.replyCandidates.length, 6);
assert.equal(result.replyResults[0].candidates[0].status, "返信候補");
assert.equal(result.replyResults[2].candidates.length, 0);

console.log("OK: pipeline smoke test passed");
console.table([{
  mails: result.scenario.classifications.length,
  requests: result.scenario.requests.length,
  talents: result.scenario.talents.length,
  pending: result.scenario.pending.length,
  sendable: result.sendableRows.length,
  drafts: result.drafts.length,
  history: result.history.length,
  replies: result.replyResults.length
}]);

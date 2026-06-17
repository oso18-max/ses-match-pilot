const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { detectReplies } = require("./reply-detection-runner.cjs");

const inbox = JSON.parse(fs.readFileSync(path.join(__dirname, "sample-mail-inbox.json"), "utf8"));
const replies = JSON.parse(fs.readFileSync(path.join(__dirname, "sample-replies.json"), "utf8"));
const results = detectReplies(inbox, replies);

assert.equal(results.length, 3);
assert.equal(results[0].candidates[0].status, "返信候補");
assert.equal(results[0].candidates[0].company, "株式会社アルファ");
assert.match(results[0].candidates[0].reasons, /送信先メール一致/);
assert.match(results[0].candidates[0].reasons, /件名一致/);

assert.equal(results[1].candidates.length > 0, true);
assert.equal(results[1].candidates[0].status, "要確認");

assert.equal(results[2].candidates.length, 0);

console.log("OK: reply detection smoke test passed");
console.table(results.map((result) => ({
  reply: result.reply.id,
  candidates: result.candidates.length,
  topStatus: result.candidates[0]?.status || "未照合",
  topCompany: result.candidates[0]?.company || ""
})));

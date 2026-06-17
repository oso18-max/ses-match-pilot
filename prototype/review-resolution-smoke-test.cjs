const assert = require("node:assert/strict");
const { executeQueue } = require("./send-execution-runner.cjs");
const { normalizeResolutions, resolveQueueReviews } = require("./review-resolution-runner.cjs");

const queue = [
  {
    id: "send_queue_001",
    status: "確認待ち",
    mode: "manual",
    company: "株式会社アルファ",
    to: "tanaka@alpha.example.invalid",
    talent: "engineer_001",
    reviewItems: ["人材:勤務地"]
  },
  {
    id: "send_queue_002",
    status: "確認待ち",
    mode: "auto",
    company: "ベータソリューションズ株式会社",
    to: "ses@beta.example.invalid",
    talent: "engineer_002",
    reviewItems: ["案件:勤務地", "人材:勤務地"]
  }
];

const map = normalizeResolutions([
  { queueId: "send_queue_001", item: "人材:勤務地", note: "フルリモート確認済み" }
]);
assert.equal(map["send_queue_001|人材:勤務地"].note, "フルリモート確認済み");

const partiallyResolved = resolveQueueReviews(queue, [
  { queueId: "send_queue_001", item: "人材:勤務地", note: "フルリモート確認済み" },
  { queueId: "send_queue_002", item: "案件:勤務地", note: "大阪確認済み" }
]);

assert.equal(partiallyResolved[0].status, "手動送信待ち");
assert.deepEqual(partiallyResolved[0].reviewItems, []);
assert.equal(partiallyResolved[0].resolvedItems[0].note, "フルリモート確認済み");
assert.equal(partiallyResolved[1].status, "確認待ち");
assert.deepEqual(partiallyResolved[1].reviewItems, ["人材:勤務地"]);

const execution = executeQueue(partiallyResolved, { executedAt: "2026-06-17 13:00" });
assert.equal(execution.executed.length, 1);
assert.equal(execution.executed[0].queueId, "send_queue_001");
assert.equal(execution.skipped.length, 1);
assert.equal(execution.skipped[0].reason, "人材:勤務地");

const fullyResolved = resolveQueueReviews(queue, [
  { queueId: "send_queue_002", item: "案件:勤務地", note: "大阪確認済み" },
  { queueId: "send_queue_002", item: "人材:勤務地", note: "大阪確認済み" }
]);
assert.equal(fullyResolved[1].status, "自動送信待ち");

console.log("OK: review resolution smoke test passed");
console.table(partiallyResolved.map((item) => ({
  id: item.id,
  status: item.status,
  remaining: item.reviewItems.join(" / ") || "-",
  resolved: item.resolvedItems.length
})));

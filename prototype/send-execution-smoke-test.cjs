const assert = require("node:assert/strict");
const { canExecute, executeQueue } = require("./send-execution-runner.cjs");

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
    status: "手動送信待ち",
    mode: "manual",
    customerId: "customer_002",
    company: "ベータソリューションズ株式会社",
    to: "ses@beta.example.invalid",
    templateGroup: "標準",
    subject: "Java人材のご提案",
    request: "Java案件",
    talent: "engineer_001",
    score: 92,
    rank: "1位",
    reviewItems: []
  },
  {
    id: "send_queue_003",
    status: "自動送信待ち",
    mode: "auto",
    customerId: "customer_003",
    company: "デルタテック株式会社",
    to: "yamamoto@delta.example.invalid",
    templateGroup: "標準",
    subject: "React人材のご提案",
    request: "React案件",
    talent: "engineer_002",
    score: 88,
    rank: "1位",
    reviewItems: []
  }
];

assert.equal(canExecute(queue[0]), false);
assert.equal(canExecute(queue[1]), true);
assert.equal(canExecute(queue[2]), true);

const result = executeQueue(queue, { executedAt: "2026-06-17 12:30" });
assert.equal(result.executed.length, 2);
assert.equal(result.skipped.length, 1);
assert.equal(result.executed[0].queueId, "send_queue_002");
assert.equal(result.executed[1].mode, "auto");
assert.equal(result.executed[0].sentAt, "2026-06-17 12:30");
assert.equal(result.skipped[0].reason, "人材:勤務地");

console.log("OK: send execution smoke test passed");
console.table({
  executed: result.executed.length,
  skipped: result.skipped.length
});

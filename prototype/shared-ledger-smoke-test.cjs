const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { loadCustomersFromCsv } = require("./customer-csv-importer.cjs");
const { runPipeline } = require("./pipeline-runner.cjs");
const { confirmationItems, createSharedLedger } = require("./shared-ledger-runner.cjs");
const app = require("./app.js");

const inbox = JSON.parse(fs.readFileSync(path.join(__dirname, "sample-mail-inbox.json"), "utf8"));
const replies = JSON.parse(fs.readFileSync(path.join(__dirname, "sample-replies.json"), "utf8"));
const customers = loadCustomersFromCsv(path.join(__dirname, "sample-customers.csv"));
const baseline = runPipeline(inbox, replies, { customers });
const result = runPipeline(inbox, replies, {
  customers,
  reviewResolutions: [
    { queueId: baseline.queue[0].id, item: baseline.queue[0].reviewItems[0], note: "checked" }
  ]
});
const ledger = createSharedLedger(result, {
  generatedAt: "2026-06-17 13:20",
  source: "smoke-test"
});

assert.equal(ledger.meta.mode, "local only / no external send");
assert.equal(ledger.meta.source, "smoke-test");
assert.equal(ledger.summary.mails, 6);
assert.equal(ledger.summary.customers, 3);
assert.equal(ledger.summary.queue, 2);
assert.equal(ledger.summary.executed, 1);
assert.equal(ledger.summary.skipped, 1);
assert.equal(ledger.queue[0].reviewItems.length, 0);
assert.equal(ledger.executed[0].queueId, "send_queue_001");
assert.equal(ledger.skipped[0].queueId, "send_queue_002");
assert.equal(ledger.confirmations.some((item) => item.kind === "reply_review"), true);
assert.equal(confirmationItems(result).length >= ledger.confirmations.length, true);
assert.equal(app.sharedLedgerSummary().some((item) => item.label === "成約管理" && item.count === app.deals.length), true);
assert.equal(app.sharedLedgerSummary().some((item) => item.label === "案件メール" && item.status.includes("確認待ち")), true);
assert.equal(app.sharedLedgerSummary().some((item) => item.label === "共有台帳サマリー"), false);

console.log("OK: shared ledger smoke test passed");
console.table([ledger.summary]);

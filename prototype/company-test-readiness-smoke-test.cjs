const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const handoff = fs.readFileSync(path.join(root, "COMPANY_TEST_HANDOFF.md"), "utf8");
const feedback = fs.readFileSync(path.join(root, "COMPANY_TEST_FEEDBACK.md"), "utf8");
const security = fs.readFileSync(path.join(root, "SECURITY_REVIEW.md"), "utf8");
const companyPage = fs.readFileSync(path.join(__dirname, "company-test.html"), "utf8");
const sampleStore = JSON.parse(fs.readFileSync(path.join(__dirname, "sample-local-store.json"), "utf8"));

assert.match(companyPage, /data-default-view="companyTest"/);
assert.match(handoff, /実メール送信はしない/);
assert.match(handoff, /Gmail連携はしない/);
assert.match(handoff, /個人情報は入れない/);
assert.match(feedback, /点数の納得感/);
assert.match(feedback, /除外理由の納得感/);
assert.match(feedback, /提案メール文面/);
assert.match(security, /企業テスト前セキュリティゲート/);
assert.match(security, /push、公開URL化、GitHub Pages反映は明示承認後/);
assert.equal(sampleStore.records.customers[0].email.endsWith(".invalid"), true);

console.log("OK: company test readiness smoke test passed");
console.table([
  { item: "handoff guide", ready: true },
  { item: "feedback form", ready: true },
  { item: "security gate", ready: true },
  { item: "company test page", ready: true }
]);

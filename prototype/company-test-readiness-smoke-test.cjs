const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const handoff = fs.readFileSync(path.join(root, "COMPANY_TEST_HANDOFF.md"), "utf8");
const packageGuide = fs.readFileSync(path.join(root, "COMPANY_TEST_PACKAGE.md"), "utf8");
const dummyInputs = fs.readFileSync(path.join(root, "COMPANY_TEST_DUMMY_INPUTS.md"), "utf8");
const invite = fs.readFileSync(path.join(root, "COMPANY_TEST_INVITE.md"), "utf8");
const sampleReport = fs.readFileSync(path.join(root, "COMPANY_TEST_SAMPLE_REPORT.md"), "utf8");
const feedback = fs.readFileSync(path.join(root, "COMPANY_TEST_FEEDBACK.md"), "utf8");
const triage = fs.readFileSync(path.join(root, "COMPANY_TEST_TRIAGE.md"), "utf8");
const runLog = fs.readFileSync(path.join(root, "COMPANY_TEST_RUN_LOG.md"), "utf8");
const publicationPrep = fs.readFileSync(path.join(root, "PUBLICATION_APPROVAL_PREP.md"), "utf8");
const security = fs.readFileSync(path.join(root, "SECURITY_REVIEW.md"), "utf8");
const companyPage = fs.readFileSync(path.join(__dirname, "company-test.html"), "utf8");
const sampleStore = JSON.parse(fs.readFileSync(path.join(__dirname, "sample-local-store.json"), "utf8"));

assert.match(companyPage, /data-default-view="companyTest"/);
assert.match(handoff, /実メール送信はしない/);
assert.match(handoff, /Gmail連携はしない/);
assert.match(handoff, /個人情報は入れない/);
assert.match(packageGuide, /企業テスト配布パッケージ/);
assert.match(packageGuide, /企業へ渡すもの/);
assert.match(packageGuide, /node prototype\\company-test-final-readiness\.cjs/);
assert.match(packageGuide, /COMPANY_TEST_DUMMY_INPUTS\.md/);
assert.match(packageGuide, /COMPANY_TEST_SAMPLE_REPORT\.md/);
assert.match(packageGuide, /COMPANY_TEST_TRIAGE\.md/);
assert.match(packageGuide, /COMPANY_TEST_RUN_LOG\.md/);
assert.match(packageGuide, /PUBLICATION_APPROVAL_PREP\.md/);
assert.match(invite, /SES Auto Send 企業テストのお願い/);
assert.match(invite, /実メール本文、実スキルシート本文、個人情報は入れない/);
assert.match(invite, /push、公開URL化、GitHub Pages反映は明示承認後/);
assert.match(dummyInputs, /パターンA/);
assert.match(dummyInputs, /パターンB/);
assert.match(dummyInputs, /パターンC/);
assert.match(dummyInputs, /example\.invalid/);
assert.match(sampleReport, /SES Auto Send テスト結果/);
assert.match(sampleReport, /企業側確認/);
assert.match(feedback, /点数の納得感/);
assert.match(feedback, /除外理由の納得感/);
assert.match(feedback, /提案メール文面/);
assert.match(triage, /即修正/);
assert.match(triage, /AI検討/);
assert.match(triage, /本番連携/);
assert.match(runLog, /企業テスト 実施ログ/);
assert.match(runLog, /依頼日/);
assert.match(runLog, /返却日/);
assert.match(runLog, /反映済/);
assert.match(publicationPrep, /GitHubへpush/);
assert.match(publicationPrep, /承認が必要な時のコピー文/);
assert.match(security, /企業テスト前セキュリティゲート/);
assert.match(security, /push、公開URL化、GitHub Pages反映は明示承認後/);
assert.equal(sampleStore.records.customers[0].email.endsWith(".invalid"), true);

console.log("OK: company test readiness smoke test passed");
console.table([
  { item: "handoff guide", ready: true },
  { item: "package guide", ready: true },
  { item: "dummy inputs", ready: true },
  { item: "invite message", ready: true },
  { item: "sample report", ready: true },
  { item: "feedback form", ready: true },
  { item: "triage sheet", ready: true },
  { item: "run log", ready: true },
  { item: "publication prep", ready: true },
  { item: "security gate", ready: true },
  { item: "company test page", ready: true }
]);

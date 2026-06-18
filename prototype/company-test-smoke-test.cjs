const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const app = require("./app.js");

const htmlSource = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const standaloneSource = fs.readFileSync(path.join(__dirname, "company-test.html"), "utf8");
const appSource = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");

assert.match(htmlSource, /data-view="companyTest"/);
assert.match(standaloneSource, /data-default-view="companyTest"/);
assert.match(standaloneSource, /id="content"/);
assert.match(appSource, /function renderCompanyTest/);
assert.match(appSource, /function saveCompanyTestDraft/);
assert.match(appSource, /function resetCompanyTestSample/);
assert.match(appSource, /function downloadCompanyTestReport/);
assert.match(appSource, /CSVテンプレをコピー/);
assert.match(appSource, /このテストで確認できること/);
assert.match(appSource, /メール送信、Gmail連携、外部API接続、実データ保存は行いません/);
assert.match(appSource, /React案件/);
assert.match(appSource, /Python案件/);
assert.match(appSource, /80点以上/);
assert.match(appSource, /59点以下/);

const request = app.parseCompanyTestRequest("Java Spring Boot案件\n単価: 70万\n勤務地: 東京\n稼働: 即日\n働き方: 週3リモート");
const talent = app.parseCompanyTestTalent("Javaエンジニア\nJava Spring Boot PostgreSQL AWS\n希望単価: 68万\n勤務地: 東京\n稼働: 即日");
const customers = app.parseCompanyTestCustomers("company,person,email,sendable,ngSkills,ngConditions\nA社,田中,a@example.invalid,送信可,,\nB社,佐藤,b@example.invalid,停止,,");
const match = app.score(request, talent);
app.state.companyTest.feedbackText = "score ok";
app.state.companyTest.feedbackChecks.score = true;
const report = app.companyTestReport({
  request,
  talent,
  match,
  targets: [
    { ...customers[0], canSend: true, blocked: [] },
    { ...customers[1], canSend: false, blocked: ["送信停止"] }
  ]
});

assert.equal(request.extracted.required.includes("Java"), true);
assert.equal(talent.skills.includes("Spring Boot"), true);
assert.equal(customers.length, 2);
assert.equal(customers[0].sendable, true);
assert.equal(customers[1].sendable, false);
assert.equal(match.score >= 80, true);
assert.equal(app.companyTestVerdict({ match, targets: [{ canSend: true }] }).label, "テスト提案可能");
assert.equal(app.companyTestScoreRows({ match }).some((row) => row.item === "必須スキル"), true);
assert.deepEqual(app.companyTestBlockedSummary({ targets: [{ blocked: ["送信停止"] }, { blocked: ["送信停止"] }] }), [{ reason: "送信停止", count: 2 }]);
assert.match(report, /マッチング点数/);
assert.match(report, /送信可能: 1件/);
assert.match(report, /score ok/);
assert.match(report, /確認済み/);
assert.equal(app.validateCompanyTestInput().length, 0);
assert.equal(app.parseCompanyTestCsvRows("company,person,email,sendable\n\"A,Inc\",田中,a@example.invalid,送信可")[1][0], "A,Inc");
assert.equal(app.companyTestCsvHeaders("company,person,email,sendable\nA,田中,a@example.invalid,送信可").includes("email"), true);
assert.equal(typeof app.resetCompanyTestSample, "function");
assert.equal(typeof app.applyCompanyTestPreset, "function");
assert.equal(typeof app.updateCompanyTestFeedbackCheck, "function");
assert.equal(typeof app.clearCompanyTestInput, "function");
assert.equal(typeof app.downloadCompanyTestReport, "function");
assert.equal(typeof app.clearCompanyTestHistory, "function");
assert.equal(app.companyTestCsvTemplate().includes("company,person,email,sendable"), true);

console.log("OK: company test smoke test passed");

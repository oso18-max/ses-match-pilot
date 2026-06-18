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
assert.match(appSource, /function companyTestInputStatus/);
assert.match(appSource, /function saveCompanyTestDraft/);
assert.match(appSource, /function resetCompanyTestSample/);
assert.match(appSource, /function downloadCompanyTestReport/);
assert.match(appSource, /CSVテンプレをコピー/);
assert.match(appSource, /このテストで確認できること/);
assert.match(appSource, /メール送信、Gmail連携、外部API接続、実データ保存は行いません/);
assert.match(appSource, /会社名、担当者名、メールアドレス、送信可否/);
assert.match(appSource, /読み取り結果/);
assert.match(appSource, /React案件/);
assert.match(appSource, /Python案件/);
assert.match(appSource, /80点以上/);
assert.match(appSource, /59点以下/);

const request = app.parseCompanyTestRequest("Java Spring Boot案件\n単価: 70万\n勤務地: 東京\n稼働: 即日\n働き方: 週3リモート");
const talent = app.parseCompanyTestTalent("Javaエンジニア\nJava Spring Boot PostgreSQL AWS\n希望単価: 68万\n勤務地: 東京\n稼働: 即日");
const customers = app.parseCompanyTestCustomers("company,person,email,sendable,ngSkills,ngConditions\nA社,田中,a@example.invalid,送信可,,\nB社,佐藤,b@example.invalid,停止,,");
const japaneseHeaderCustomers = app.parseCompanyTestCustomers("会社名,担当者名,メールアドレス,送信可否,NG条件,年齢上限,商流上限\n日本語ヘッダー社,山田,yamada@example.invalid,送信可,単価70万円超NG,45,2");
const match = app.score(request, talent);
const restrictedRequest = app.parseCompanyTestRequest("Java案件\n必須: Java\n年齢: 45歳まで\n商流: 二次請まで\nNG: 外国籍");
const restrictedTalent = app.parseCompanyTestTalent("Javaエンジニア\nJava\n年齢: 50歳\n商流: 三次請\n外国籍");
const restrictedMatch = app.score(restrictedRequest, restrictedTalent);
const variedTargets = app.sendTargetsForCompanyTest(
  restrictedRequest,
  restrictedTalent,
  app.parseCompanyTestCustomers("company,person,email,sendable,ngSkills,ngConditions,ngWords,maxAge,maxCommerceLevel\nC社,高橋,c@example.invalid,送信可,,70万以上NG|45歳以上NG|商流二次まで|外国籍不可,,,")
);
app.state.companyTest.feedbackText = "score ok";
app.state.companyTest.feedbackChecks.score = true;
app.state.companyTest.feedbackChecks.exclusion = true;
app.state.companyTest.feedbackChecks.mail = true;
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
assert.equal(japaneseHeaderCustomers[0].company, "日本語ヘッダー社");
assert.equal(japaneseHeaderCustomers[0].person, "山田");
assert.equal(japaneseHeaderCustomers[0].email, "yamada@example.invalid");
assert.equal(japaneseHeaderCustomers[0].ngConditions.includes("単価70万円超NG"), true);
assert.equal(japaneseHeaderCustomers[0].maxAge, 45);
assert.equal(japaneseHeaderCustomers[0].maxCommerceLevel, 2);
assert.equal(match.score >= 80, true);
assert.equal(restrictedMatch.cutoff, false);
assert.equal(restrictedMatch.reasons.some((reason) => reason.includes("年齢NG")), true);
assert.equal(restrictedMatch.reasons.some((reason) => reason.includes("商流NG")), true);
assert.equal(restrictedMatch.reasons.some((reason) => reason.includes("NGワード")), true);
assert.equal(app.sendTargetsForCompanyTest(restrictedRequest, restrictedTalent, app.parseCompanyTestCustomers("company,person,email,sendable,ngSkills,ngConditions,ngWords,maxAge,maxCommerceLevel\nC社,高橋,c@example.invalid,送信可,,単価70万円超NG,外国籍,45,2"))[0].blocked.includes("年齢NG"), true);
assert.equal(app.sendTargetsForCompanyTest(restrictedRequest, restrictedTalent, app.parseCompanyTestCustomers("company,person,email,sendable,ngSkills,ngConditions,ngWords,maxAge,maxCommerceLevel\nC社,高橋,c@example.invalid,送信可,,単価70万円超NG,外国籍,45,2"))[0].blocked.includes("商流NG"), true);
assert.equal(app.sendTargetsForCompanyTest(restrictedRequest, restrictedTalent, app.parseCompanyTestCustomers("company,person,email,sendable,ngSkills,ngConditions,ngWords,maxAge,maxCommerceLevel\nC社,高橋,c@example.invalid,送信可,,単価70万円超NG,外国籍,45,2"))[0].blocked.includes("NGワード"), true);
assert.equal(variedTargets[0].blocked.includes("単価NG"), true);
assert.equal(variedTargets[0].blocked.includes("年齢NG"), true);
assert.equal(variedTargets[0].blocked.includes("商流NG"), true);
assert.equal(variedTargets[0].blocked.includes("NGワード"), true);
assert.equal(app.companyTestVerdict({ match, targets: [{ canSend: true }] }).label, "テスト提案可能");
assert.equal(app.companyTestScoreRows({ match }).some((row) => row.item === "必須スキル"), true);
assert.equal(app.companyTestScoreRows({ match: restrictedMatch }).some((row) => row.item === "年齢制限" && row.status === "要確認"), true);
assert.equal(app.companyTestScoreRows({ match: restrictedMatch }).some((row) => row.item === "商流制限" && row.status === "要確認"), true);
assert.equal(app.companyTestScoreRows({ match: restrictedMatch }).some((row) => row.item === "NGワード" && row.status === "要確認"), true);
assert.deepEqual(app.companyTestBlockedSummary({ targets: [{ blocked: ["送信停止"] }, { blocked: ["送信停止"] }] }), [{ reason: "送信停止", count: 2 }]);
assert.match(report, /マッチング点数/);
assert.match(report, /送信可能: 1件/);
assert.match(report, /score ok/);
assert.equal(app.companyTestFeedbackStatus().ready, true);
assert.match(report, /確認済み/);
assert.equal(app.validateCompanyTestInput().length, 0);
assert.equal(app.companyTestInputStatus().length, 4);
assert.equal(app.companyTestParsedSummary().length, 3);
assert.equal(app.companyTestParsedSummary()[2].item, "送信先");
app.state.companyTest.customerCsv = "company,person,email,sendable\nA,田中,bad-mail,送信可";
assert.equal(app.validateCompanyTestInput().some((error) => error.includes("メール形式")), true);
app.state.companyTest.customerCsv = "company,person,email,sendable\nA,田中,a@example.invalid,送信可";
assert.equal(app.parseCompanyTestCsvRows("company,person,email,sendable\n\"A,Inc\",田中,a@example.invalid,送信可")[1][0], "A,Inc");
assert.equal(app.companyTestCsvHeaders("company,person,email,sendable\nA,田中,a@example.invalid,送信可").includes("email"), true);
assert.equal(app.companyTestCsvHeaders("会社名,担当者名,メールアドレス,送信可否\nA,田中,a@example.invalid,送信可").includes("company"), true);
assert.equal(typeof app.resetCompanyTestSample, "function");
assert.equal(typeof app.applyCompanyTestPreset, "function");
assert.equal(typeof app.updateCompanyTestFeedbackCheck, "function");
assert.equal(typeof app.companyTestFeedbackStatus, "function");
assert.equal(typeof app.companyTestInputStatus, "function");
assert.equal(typeof app.companyTestParsedSummary, "function");
assert.equal(typeof app.sendTargetsForCompanyTest, "function");
assert.equal(typeof app.customerBlockedReasons, "function");
assert.equal(typeof app.clearCompanyTestInput, "function");
assert.equal(typeof app.downloadCompanyTestReport, "function");
assert.equal(app.companyTestPackage().version, 1);
app.applyCompanyTestPackage({ requestText: "React案件", talentText: "React", customerCsv: "company,person,email,sendable\nA,田中,a@example.invalid,送信可" });
assert.equal(app.state.companyTest.requestText, "React案件");
app.addCompanyTestHistory({ request, talent, match, targets: [{ canSend: true }, { canSend: false }] });
assert.equal(app.state.companyTest.history[0].checked >= 1, true);
assert.equal(typeof app.downloadCompanyTestPackage, "function");
assert.equal(typeof app.clearCompanyTestHistory, "function");
assert.equal(app.companyTestCsvTemplate().includes("company,person,email,sendable"), true);

console.log("OK: company test smoke test passed");

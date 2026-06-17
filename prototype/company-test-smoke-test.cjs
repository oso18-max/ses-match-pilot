const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const app = require("./app.js");

const htmlSource = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const appSource = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");

assert.match(htmlSource, /data-view="companyTest"/);
assert.match(appSource, /function renderCompanyTest/);

const request = app.parseCompanyTestRequest("Java Spring Boot案件\n単価: 70万\n勤務地: 東京\n稼働: 即日\n働き方: 週3リモート");
const talent = app.parseCompanyTestTalent("Javaエンジニア\nJava Spring Boot PostgreSQL AWS\n希望単価: 68万\n勤務地: 東京\n稼働: 即日");
const customers = app.parseCompanyTestCustomers("company,person,email,sendable,ngSkills,ngConditions\nA社,田中,a@example.invalid,送信可,,\nB社,佐藤,b@example.invalid,停止,,");
const match = app.score(request, talent);

assert.equal(request.extracted.required.includes("Java"), true);
assert.equal(talent.skills.includes("Spring Boot"), true);
assert.equal(customers.length, 2);
assert.equal(customers[0].sendable, true);
assert.equal(customers[1].sendable, false);
assert.equal(match.score >= 80, true);

console.log("OK: company test smoke test passed");

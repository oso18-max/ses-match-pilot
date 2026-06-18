const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const app = require("./app.js");

const htmlSource = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const appSource = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");

assert.match(htmlSource, /data-view="deals"/);
assert.match(appSource, /function renderDeals/);
assert.equal(app.deals.length, 3);
assert.equal(app.dealSummary().closed, 1);
assert.equal(app.dealSummary().lost, 1);
assert.equal(app.dealSummary().sales, 160);
assert.equal(app.dealSummary().gross, 20);
assert.equal(app.dealForInterview("iv_002").status, "成約");
assert.equal(app.dealGrossProfit(app.deals[0]), 10);
assert.equal(app.dealGrossRate(app.deals[0]), 13);

console.log("OK: deal management smoke test passed");
console.table(app.deals.map((item) => ({
  id: item.id,
  company: item.company,
  status: item.status,
  gross: app.dealGrossProfit(item)
})));

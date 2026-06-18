const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const app = require("./app.js");

const htmlSource = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const appSource = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");

assert.match(htmlSource, /data-view="interviews"/);
assert.match(appSource, /function renderInterviews/);
assert.equal(app.interviews.length, 3);
assert.equal(app.interviewSummary()["面談予定"], 1);
assert.equal(app.interviewSummary()["結果待ち"], 1);
assert.equal(app.interviewSummary()["見送り"], 1);
assert.equal(app.interviewForHistory("hist_002").status, "面談予定");
assert.equal(app.interviewForHistory("unknown"), undefined);

console.log("OK: interview management smoke test passed");
console.table(app.interviews.map((item) => ({
  id: item.id,
  company: item.company,
  status: item.status,
  nextAction: item.nextAction
})));

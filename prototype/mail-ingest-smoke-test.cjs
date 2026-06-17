const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildScenario } = require("./mail-ingest-runner.cjs");
const { collectSendableRows } = require("./matching-runner.cjs");

const inbox = JSON.parse(fs.readFileSync(path.join(__dirname, "sample-mail-inbox.json"), "utf8"));
const scenario = buildScenario(inbox);
const rows = collectSendableRows(scenario.requests, scenario.talents, scenario.customers, scenario.settings);
const sendableRows = rows.filter((row) => row.sendStatus === "未送信候補");

assert.equal(scenario.classifications.length, 6);
assert.equal(scenario.requests.length, 3);
assert.equal(scenario.talents.length, 2);
assert.equal(scenario.pending.length, 2);
assert.equal(sendableRows.length, 3);

const types = scenario.classifications.map((item) => item.type);
assert.deepEqual(types, ["案件", "人材", "案件", "その他", "複合", "判定不能"]);

const requestMissing = scenario.requests.flatMap((request) => request.missingFields);
const talentMissing = scenario.talents.flatMap((talent) => talent.missingFields);
assert.equal(requestMissing.includes("必須スキル"), false);
assert.equal(talentMissing.includes("スキル"), false);

const remoteTalent = scenario.talents.find((talent) => talent.sourceMailId === "mail_002");
assert.equal(remoteTalent.missingFields.includes("勤務地"), false);
assert.equal(
  remoteTalent.extractionReasons.includes("リモート可のため勤務地不足扱いなし"),
  true
);

const pendingTypes = scenario.pending.map((item) => item.type);
assert.deepEqual(pendingTypes, ["その他", "判定不能"]);

console.log("OK: mail ingest smoke test passed");
console.table(sendableRows.map((row) => ({
  request: row.request,
  talent: row.talent,
  company: row.company,
  score: row.score,
  rank: row.rank
})));

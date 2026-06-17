const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildDrafts } = require("./proposal-preview-runner.cjs");
const { loadCustomersFromCsv } = require("./customer-csv-importer.cjs");

const inbox = JSON.parse(fs.readFileSync(path.join(__dirname, "sample-mail-inbox.json"), "utf8"));
const drafts = buildDrafts(inbox);
const csvDrafts = buildDrafts(inbox, {
  customers: loadCustomersFromCsv(path.join(__dirname, "sample-customers.csv"))
});

assert.equal(drafts.length, 3);
assert.equal(drafts[0].company, "株式会社アルファ");
assert.equal(drafts[0].talent, "ingested_engineer_002");
assert.equal(drafts[0].score, 100);
assert.equal(drafts[0].status, "確認必要");
assert.deepEqual(drafts[0].reviewItems, ["人材:勤務地"]);
assert.match(drafts[0].body, /株式会社アルファ/);
assert.match(drafts[0].body, /田中様/);
assert.match(drafts[0].body, /候補者/);
assert.match(drafts[0].body, /確認事項/);
assert.match(drafts[0].body, /マッチングスコア: 100点/);
assert.equal(csvDrafts.length, 3);
assert.equal(csvDrafts[0].customerId, "customer_csv_001");
assert.equal(csvDrafts[0].templateGroup, "標準");
assert.equal(csvDrafts.some((draft) => draft.company === "株式会社ガンマ"), false);

console.log("OK: proposal preview smoke test passed");
console.table(drafts.map((draft) => ({
  to: draft.to,
  company: draft.company,
  talent: draft.talent,
  score: draft.score,
  rank: draft.rank
})));

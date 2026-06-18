const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const appSource = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");
const cssSource = fs.readFileSync(path.join(__dirname, "styles.css"), "utf8");

assert.match(appSource, /showUnsentQueue: true/);
assert.match(appSource, /未送信一覧/);
assert.match(appSource, /確認待ちメール/);
assert.match(appSource, /低信頼度・判定不能/);
assert.match(appSource, /function mailReviewSummary/);
assert.match(appSource, /function markMailReviewed/);
assert.match(appSource, /確認済みにする/);
assert.match(appSource, /確認済み履歴/);
assert.match(appSource, /テスト表示です。外部送信はしません/);
assert.match(appSource, /テスト送信済みにする/);
assert.match(appSource, /function matchBreakdown/);
assert.match(cssSource, /\.reason-list/);
assert.match(cssSource, /\.small-action\.is-primary/);

console.log("OK: UI copy smoke test passed");

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const htmlSource = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const appSource = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");
const cssSource = fs.readFileSync(path.join(__dirname, "styles.css"), "utf8");

assert.match(htmlSource, /data-view="test"/);
assert.doesNotMatch(htmlSource, /data-view="companyTest">企業テスト/);
assert.match(appSource, /function renderTestConsole/);
assert.match(appSource, /function runTestSendOne/);
assert.match(appSource, /サンプルデータのみ \/ 外部送信なし \/ Gmail接続なし/);
assert.match(appSource, /通常の管理画面ではありません/);
assert.match(appSource, /企業テストを開く/);
assert.match(appSource, /test: renderTestConsole/);
assert.match(cssSource, /\.test-steps/);
assert.match(cssSource, /\.test-step\.is-danger/);

console.log("OK: test console smoke test passed");

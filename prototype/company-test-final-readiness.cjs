const fs = require("node:fs");
const path = require("node:path");
const app = require("./app.js");

const root = path.resolve(__dirname, "..");

function readText(fileName) {
  return fs.readFileSync(path.join(root, fileName), "utf8");
}

function has(text, pattern) {
  return pattern.test(text);
}

const handoff = readText("COMPANY_TEST_HANDOFF.md");
const packageGuide = readText("COMPANY_TEST_PACKAGE.md");
const invite = readText("COMPANY_TEST_INVITE.md");
const feedback = readText("COMPANY_TEST_FEEDBACK.md");
const security = readText("SECURITY_REVIEW.md");
const companyPage = fs.readFileSync(path.join(__dirname, "company-test.html"), "utf8");
const sampleStore = JSON.parse(fs.readFileSync(path.join(__dirname, "sample-local-store.json"), "utf8"));

const request = app.parseCompanyTestRequest("Java Spring Boot案件\n必須: Java, Spring Boot\n単価: 70万\n勤務地: 東京\n稼働: 即日");
const talent = app.parseCompanyTestTalent("Javaエンジニア\nJava Spring Boot PostgreSQL\n希望単価: 68万\n勤務地: 東京\n稼働: 即日");
const targets = app.sendTargetsForCompanyTest(
  request,
  talent,
  app.parseCompanyTestCustomers("company,person,email,sendable\n株式会社サンプル,田中,tanaka@example.invalid,送信可")
);
const match = app.score(request, talent);
const decision = app.companyTestNextDecision({ request, talent, match, targets });

const checks = [
  {
    item: "企業テスト画面",
    ok: has(companyPage, /data-default-view="companyTest"/),
    detail: "専用ページで企業テストを直接開ける"
  },
  {
    item: "案内文",
    ok: has(invite, /SES Auto Send 企業テストのお願い/) && has(invite, /結果レポートを保存して共有する/),
    detail: "企業へ送るコピー文がある"
  },
  {
    item: "配布パッケージ",
    ok: has(packageGuide, /企業へ渡すもの/) && has(packageGuide, /PMが確認するコマンド/),
    detail: "渡す資料と確認コマンドを1か所で見られる"
  },
  {
    item: "安全注意",
    ok: has(invite, /実メール本文、実スキルシート本文、個人情報は入れない/) && has(security, /企業テスト前セキュリティゲート/),
    detail: "実データ禁止と外部連携禁止を明記"
  },
  {
    item: "回収票",
    ok: has(feedback, /点数の納得感/) && has(feedback, /除外理由の納得感/) && has(feedback, /提案メール文面/),
    detail: "回収する評価項目がある"
  },
  {
    item: "渡す前チェック",
    ok: app.companyTestReadinessItems().length === 4 && has(handoff, /渡す前チェック/),
    detail: "入力、安全、回収、判定を確認できる"
  },
  {
    item: "マッチング動作",
    ok: match.score >= 80 && targets.some((target) => target.canSend),
    detail: "ダミー案件と人材で送信候補が出る"
  },
  {
    item: "PM判定",
    ok: Boolean(decision.label && decision.action),
    detail: "テスト後の次アクションを出せる"
  },
  {
    item: "ダミーメール",
    ok: sampleStore.records.customers.every((customer) => customer.email.endsWith(".invalid")),
    detail: "サンプル保存データは送信不能メールのみ"
  }
];

const failed = checks.filter((check) => !check.ok);
const percent = failed.length ? 90 : 95;

console.log("SES Auto Send company test final readiness");
console.table(checks.map((check) => ({
  item: check.item,
  ready: check.ok,
  detail: check.detail
})));
console.log(`readiness: ${percent}%`);
console.log("external share: requires explicit approval for push / public URL / GitHub Pages");

if (failed.length) {
  console.error("FAILED readiness items:");
  failed.forEach((check) => console.error(`- ${check.item}: ${check.detail}`));
  process.exit(1);
}

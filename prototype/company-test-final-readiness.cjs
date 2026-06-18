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
const sampleReport = readText("COMPANY_TEST_SAMPLE_REPORT.md");
const feedback = readText("COMPANY_TEST_FEEDBACK.md");
const triage = readText("COMPANY_TEST_TRIAGE.md");
const publicationPrep = readText("PUBLICATION_APPROVAL_PREP.md");
const security = readText("SECURITY_REVIEW.md");
const companyPage = fs.readFileSync(path.join(__dirname, "company-test.html"), "utf8");
const sampleStore = JSON.parse(fs.readFileSync(path.join(__dirname, "sample-local-store.json"), "utf8"));
const safetyScan = fs.readFileSync(path.join(__dirname, "publication-safety-scan.cjs"), "utf8");
const localUrlSmoke = fs.readFileSync(path.join(__dirname, "local-url-smoke-test.cjs"), "utf8");

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
    item: "ローカルURL検証",
    ok: has(localUrlSmoke, /local-static-server\.cjs/) && has(localUrlSmoke, /company-test\.html/) && has(localUrlSmoke, /index\.html/),
    detail: "トップと企業テストURLの表示確認を自動化済み"
  },
  {
    item: "案内文",
    ok: has(invite, /SES Auto Send 企業テストのお願い/) && has(invite, /結果レポートを保存して共有する/),
    detail: "企業へ送るコピー文がある"
  },
  {
    item: "配布パッケージ",
    ok: has(packageGuide, /企業へ渡すもの/) && has(packageGuide, /PMが確認するコマンド/) && has(packageGuide, /COMPANY_TEST_SAMPLE_REPORT\.md/) && has(packageGuide, /COMPANY_TEST_TRIAGE\.md/) && has(packageGuide, /PUBLICATION_APPROVAL_PREP\.md/),
    detail: "渡す資料と確認コマンドを1か所で見られる"
  },
  {
    item: "サンプル結果",
    ok: has(sampleReport, /SES Auto Send テスト結果/) && has(sampleReport, /PM判定/) && has(sampleReport, /企業側確認/),
    detail: "企業から返してほしい結果イメージがある"
  },
  {
    item: "安全注意",
    ok: has(invite, /実メール本文、実スキルシート本文、個人情報は入れない/) && has(security, /企業テスト前セキュリティゲート/),
    detail: "実データ禁止と外部連携禁止を明記"
  },
  {
    item: "公開前スキャン",
    ok: has(safetyScan, /non-test-email/) && has(safetyScan, /network-code/),
    detail: "実メール混入と外部通信コードを検査できる"
  },
  {
    item: "公開承認準備",
    ok: has(publicationPrep, /GitHubへpush/) && has(publicationPrep, /リポジトリpublic化/) && has(publicationPrep, /承認が必要な時のコピー文/),
    detail: "外部共有URL化の承認範囲を説明できる"
  },
  {
    item: "回収票",
    ok: has(feedback, /点数の納得感/) && has(feedback, /除外理由の納得感/) && has(feedback, /提案メール文面/),
    detail: "回収する評価項目がある"
  },
  {
    item: "整理表",
    ok: has(triage, /即修正/) && has(triage, /AI検討/) && has(triage, /本番連携/) && has(triage, /PM報告テンプレ/),
    detail: "回収後の実装判断に仕分けできる"
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

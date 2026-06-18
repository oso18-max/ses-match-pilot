# 企業テスト配布パッケージ

## 目的

企業にSES Auto SendのMVPをテストしてもらい、マッチング点数、除外理由、提案メール文面が営業感覚に合うか確認する。

## まず開くもの

```text
http://127.0.0.1:4173/prototype/company-test.html
```

ローカルURLは、同じPCでローカルサーバー起動中だけ開ける。

## 企業へ渡すもの

| 種別 | ファイル | 目的 |
| --- | --- | --- |
| 案内文 | `COMPANY_TEST_INVITE.md` | 企業へ送るコピー用文面 |
| 手順 | `COMPANY_TEST_HANDOFF.md` | テストの進め方、合格ライン、渡す前チェック |
| 回収票 | `COMPANY_TEST_FEEDBACK.md` | 点数、除外理由、文面、操作性の評価回収 |
| サンプル結果 | `COMPANY_TEST_SAMPLE_REPORT.md` | 返却してほしい結果レポートの完成イメージ |
| 安全確認 | `SECURITY_REVIEW.md` | 実データ禁止、外部送信禁止、連携禁止の確認 |

## PMが確認するコマンド

```powershell
node prototype\company-test-final-readiness.cjs
```

全体確認:

```powershell
node prototype\run-all-smoke-tests.cjs
```

## 企業に入れてもらうもの

- 匿名化した案件情報
- 匿名化した人材情報
- ダミー会社名の送信先CSV
- `example.invalid` など送信不能なテストメールアドレス

## 入れてはいけないもの

- 実メール本文
- 実スキルシート本文
- 個人名、電話番号、住所、生年月日、個人メール
- 取引先の実名や実メールアドレス
- 添付ファイル原本

## テスト後に回収するもの

- テスト結果レポート
- 企業側コメント
- 点数の納得感
- 除外理由の違和感
- 提案メール文面の違和感
- 追加したいNG条件
- 追加したいマッチング条件

## 外部共有について

外部共有URLで渡す場合は、push、public化、GitHub Pages反映などの外部送信が必要。
これらは前田社長の明示承認後に行う。

# 公開URL化 承認前準備

## 目的

企業テスト用プロトタイプを、外部の相手がブラウザで見られるURLへ反映する前に、必要な承認範囲とリスクを整理する。

## 現在できていること

- ローカル企業テスト画面
- 企業テスト配布パッケージ
- 案内文、手順、回収票、整理表、サンプル結果
- 公開前安全スキャン
- 最終readinessチェック

## 公開前に必ず実行するコマンド

```powershell
node prototype\publication-safety-scan.cjs
node prototype\company-test-final-readiness.cjs
node prototype\run-all-smoke-tests.cjs
```

## 公開URL化で発生する操作

| 操作 | リスク | 承認 |
| --- | --- | --- |
| GitHubへpush | ローカル内容が外部へ送信される | 必須 |
| リポジトリpublic化 | URLを知る人が閲覧可能になる | 必須 |
| GitHub Pages反映 | ブラウザで外部閲覧可能になる | 必須 |

## 公開してよい前提

- 実メール本文なし
- 実スキルシート本文なし
- 個人情報なし
- 取引先の実名/実メールなし
- 外部API接続なし
- Gmail連携なし
- 実メール送信なし
- サンプルメールは `.invalid` のみ

## 公開後に企業へ渡すもの

- 公開URL
- `COMPANY_TEST_INVITE.md` の案内文
- `COMPANY_TEST_PACKAGE.md`
- 注意: 実データは入れない

## 公開後に回収するもの

- テスト結果レポート
- 企業側コメント
- 点数の納得感
- 除外理由の違和感
- 提案メール文面の違和感
- 追加したいNG条件やマッチング条件

## 承認が必要な時のコピー文

```text
C:\【Master】Codex\【制作部】_SES のローカルcommit内容を GitHub public リポジトリ https://github.com/oso18-max/ses-match-pilot へpushし、GitHub Pages公開URLに反映することを、外部送信・公開URL化のリスクを理解した上で許可します。
```

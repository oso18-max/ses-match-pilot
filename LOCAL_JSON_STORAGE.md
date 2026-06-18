# SES Auto Send ローカルJSON保存方式

## 目的
実DBへ進む前に、MVPで必要な保存単位をローカルJSONで固定する。

## 前提
- 実メール本文は保存しない。
- 実スキルシート本文は保存しない。
- 個人情報や機密情報は投入しない。
- 外部API、Gmail、Google Drive、GitHub Pagesとは接続しない。
- この設計はローカル検証用で、本番DBの前段。

## 保存ディレクトリ案

```text
data/
  customers.json
  requests.json
  talents.json
  matches.json
  proposal_targets.json
  send_histories.json
  replies.json
  interviews.json
  deals.json
  audit_events.json
```

現時点では `data/` は作らない。実データ投入前の承認後に作る。

## ファイル単位

### customers.json
送信先マスタ。CSV取込後の正規化データを保存する。

### requests.json
案件メール/添付から抽出した案件情報を保存する。

### talents.json
スキルシートから抽出した人材情報を保存する。

### matches.json
案件と人材のマッチング点数、判定理由を保存する。

### proposal_targets.json
どの企業に提案できるか、除外理由、下書き状態を保存する。

### send_histories.json
実送信または疑似送信の履歴を保存する。

### replies.json
返信検知結果、紐づけ候補、次アクションを保存する。

### interviews.json
面談予定、結果待ち、見送り、次アクションを保存する。

### deals.json
成約、条件調整、失注、売上単価、支払単価、粗利を保存する。

### audit_events.json
取込、判定、下書き作成、送信、更新などの操作イベントを保存する。

## 保存しない項目
- メール本文全文
- 添付ファイル原本
- スキルシート本文全文
- 住所、電話番号、生年月日
- Gmail/Google/外部APIの認証情報
- パスワード、トークン、Cookie

## JSON共通形式

```json
{
  "version": 1,
  "updatedAt": "2026-06-18T00:00:00+09:00",
  "records": []
}
```

## バックアップ方針
- 保存前に同名ファイルを `.bak` として退避する。
- 直近3世代まで残す。
- 削除は明示承認が必要なので、自動削除はしない。
- MVP段階ではバックアップ増加を手動確認する。

## 読込時の安全策
- `version` が違う場合は読込停止。
- `records` が配列でない場合は読込停止。
- 必須項目がないレコードは `確認必要` にする。
- 壊れたJSONは上書きしない。

## 次の実装順
1. ダミーデータ専用の `prototype/sample-local-store.json` を作る。
2. 保存/読込の純粋関数を追加する。
3. スモークテストで壊れたJSON、version違い、必須項目不足を確認する。
4. 実データ投入前に保存項目をセキュリティレビューする。

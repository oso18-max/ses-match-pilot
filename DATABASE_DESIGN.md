# SES Auto Send 保存DB 最小設計

## 前提
- この設計はMVP用の最小案。
- 実メール本文、実スキルシート本文、個人情報、取引先情報はまだ投入しない。
- 現段階ではDB接続、API接続、外部送信は行わない。
- まずはダミーデータとローカルプロトタイプで項目を固める。

## 方針
- メール本文やスキルシート本文をそのまま保存しない。
- 保存するのは抽出済みの業務項目、判定結果、送信/面談/成約の進捗。
- 後からLLMを追加しても、抽出結果の保存先は同じにする。
- 送信履歴と返信履歴は監査用に残すが、本文ではなくメタ情報を中心にする。

## 最小テーブル

### customers
送信先企業・担当者を管理する。

| column | type | memo |
| --- | --- | --- |
| id | string | 顧客ID |
| company | string | 会社名 |
| person | string | 担当者名 |
| email | string | 送信先 |
| sendable | boolean | 送信可否 |
| ng_skills | string[] | NGスキル |
| ng_conditions | string[] | NG条件 |
| ng_words | string[] | NGワード |
| max_age | number/null | 年齢上限 |
| max_commerce_level | number/null | 商流上限 |
| template_group | string | 文面グループ |
| created_at | datetime | 作成日時 |
| updated_at | datetime | 更新日時 |

### requests
案件情報を管理する。

| column | type | memo |
| --- | --- | --- |
| id | string | 案件ID |
| received_at | datetime | 受信日時 |
| source_type | string | 本文/添付/手入力 |
| subject | string | 件名 |
| role | string | 職種 |
| required_skills | string[] | 必須スキル |
| nice_skills | string[] | 尚可スキル |
| unit_max | number | 上限単価 |
| start | string | 稼働時期 |
| location | string | 勤務地 |
| work_style | string | リモート/常駐 |
| max_age | number/null | 年齢上限 |
| max_commerce_level | number/null | 商流上限 |
| ng_words | string[] | 案件NGワード |
| valid_until | date | 案件有効期限 |
| status | string | 取込/確認必要/マッチング済み |

### talents
人材・スキルシート抽出結果を管理する。

| column | type | memo |
| --- | --- | --- |
| id | string | 人材ID |
| code | string | 管理コード |
| role | string | 職種 |
| skills | string[] | スキル |
| unit | number | 希望単価 |
| available | string | 稼働可能時期 |
| location | string | 希望勤務地 |
| work_style | string | リモート/常駐 |
| age | number/null | 年齢 |
| commerce_level | number/null | 商流 |
| source_file_type | string | Excel/Word/PDFなど |
| valid_until | date | 人材有効期限 |
| status | string | 提案可/期限注意/停止 |

### matches
案件と人材のマッチング結果を管理する。

| column | type | memo |
| --- | --- | --- |
| id | string | マッチングID |
| request_id | string | 案件ID |
| talent_id | string | 人材ID |
| score | number | 点数 |
| rank | string | 1位/2位/3位/除外 |
| cutoff | boolean | 提案候補か |
| matched_required | string[] | 一致必須スキル |
| matched_nice | string[] | 一致尚可スキル |
| missing | string[] | 不足スキル |
| checks | object[] | 単価/勤務地/年齢/商流/NGワード判定 |
| reasons | string[] | 判定理由 |
| created_at | datetime | 作成日時 |

### proposal_targets
誰に何を送るかを管理する。

| column | type | memo |
| --- | --- | --- |
| id | string | 提案先ID |
| match_id | string | マッチングID |
| customer_id | string | 顧客ID |
| can_send | boolean | 送信可能か |
| blocked_reasons | string[] | 除外理由 |
| draft_subject | string | 下書き件名 |
| draft_template_group | string | 文面グループ |
| status | string | 未送信/確認待ち/送信済み/除外 |

### send_histories
個別送信の履歴を管理する。

| column | type | memo |
| --- | --- | --- |
| id | string | 送信履歴ID |
| proposal_target_id | string | 提案先ID |
| sent_at | datetime | 送信日時 |
| company | string | 会社名 |
| email | string | 宛先 |
| request_id | string | 案件ID |
| talent_id | string | 人材ID |
| status | string | 返信待ち/返信あり/停止 |
| subject | string | 件名 |

### replies
返信検知結果を管理する。

| column | type | memo |
| --- | --- | --- |
| id | string | 返信ID |
| received_at | datetime | 受信日時 |
| from_email | string | 返信元 |
| subject | string | 件名 |
| linked_history_id | string/null | 紐づいた送信履歴 |
| detected_reason | string | 検知理由 |
| status | string | 返信候補/要確認/未照合 |
| next_action | string | 次アクション |

### interviews
面談以降の進捗を管理する。

| column | type | memo |
| --- | --- | --- |
| id | string | 面談ID |
| history_id | string | 送信履歴ID |
| company | string | 会社名 |
| request_id | string | 案件ID |
| talent_id | string | 人材ID |
| scheduled_at | datetime | 面談予定日時 |
| status | string | 面談予定/結果待ち/見送り |
| result | string | 結果 |
| next_action | string | 次アクション |

### deals
成約/失注と粗利を管理する。

| column | type | memo |
| --- | --- | --- |
| id | string | 成約ID |
| interview_id | string | 面談ID |
| company | string | 会社名 |
| request_id | string | 案件ID |
| talent_id | string | 人材ID |
| status | string | 成約/条件調整/失注 |
| start_month | string | 開始月 |
| sales_unit | number | 売上単価 |
| pay_unit | number | 支払単価 |
| gross_profit | number | 粗利 |
| gross_rate | number | 粗利率 |
| next_action | string | 次アクション |

## 保存しないもの
- 実メール本文全文
- 実スキルシート本文全文
- 添付ファイル原本
- 個人の住所、電話番号、生年月日などMVPに不要な個人情報
- 外部サービスの認証情報

## 次の実装順
1. ローカルJSON保存で `customers/requests/talents/matches` を保存する。
2. `proposal_targets/send_histories/replies` を保存する。
3. `interviews/deals` を保存する。
4. 実DBに移す前に、個人情報を保存しない項目へ再点検する。

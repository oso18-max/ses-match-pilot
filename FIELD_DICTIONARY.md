# SES Auto Send 項目名辞書

## 目的
画面、CSV、ローカルJSON、将来DBで使う項目名を揃える。

## 命名ルール
- 画面表示は日本語。
- CSV列名とDB項目名は英語スネークケース。
- IDは文字列。
- 日時は ISO 8601 形式を基本にする。
- 実データ投入前に、この辞書から外れる項目は追加しない。

## 顧客 / 送信先

| 画面表示 | CSV列名 | DB項目名 | 備考 |
| --- | --- | --- | --- |
| 会社名 | company | company | 必須 |
| 担当者名 | person | person | 必須 |
| メールアドレス | email | email | 必須 |
| 送信可否 | sendable | sendable | 必須 |
| NGスキル | ngSkills | ng_skills | 任意 |
| NG条件 | ngConditions | ng_conditions | 任意 |
| NGワード | ngWords | ng_words | 任意 |
| 年齢上限 | maxAge | max_age | 任意 |
| 商流上限 | maxCommerceLevel | max_commerce_level | 任意 |
| 文面グループ | templateGroup | template_group | 任意 |

## 案件

| 画面表示 | 入力/抽出名 | DB項目名 | 備考 |
| --- | --- | --- | --- |
| 案件ID | requestId | id | 自動採番 |
| 受信日時 | receivedAt | received_at | メール取込時 |
| 件名 | subject | subject | 本文保存なし |
| 職種 | role | role | 抽出結果 |
| 必須スキル | requiredSkills | required_skills | 配列 |
| 尚可スキル | niceSkills | nice_skills | 配列 |
| 上限単価 | unitMax | unit_max | 万円 |
| 稼働時期 | start | start | 例: 即日 |
| 勤務地 | location | location | 例: 東京 |
| 働き方 | workStyle | work_style | リモート/常駐 |
| 年齢上限 | maxAge | max_age | 任意 |
| 商流上限 | maxCommerceLevel | max_commerce_level | 任意 |
| NGワード | ngWords | ng_words | 配列 |
| 有効期限 | validUntil | valid_until | 企業設定日数で算出 |
| 状態 | status | status | 取込/確認必要/マッチング済み |

## 人材

| 画面表示 | 入力/抽出名 | DB項目名 | 備考 |
| --- | --- | --- | --- |
| 人材ID | talentId | id | 自動採番 |
| 管理コード | code | code | 表示用 |
| 職種 | role | role | 抽出結果 |
| スキル | skills | skills | 配列 |
| 希望単価 | unit | unit | 万円 |
| 稼働可能時期 | available | available | 例: 即日 |
| 希望勤務地 | location | location | 例: 東京 |
| 働き方 | workStyle | work_style | リモート/常駐 |
| 年齢 | age | age | 任意 |
| 商流 | commerceLevel | commerce_level | 0=エンド直, 1=一次, 2=二次, 3=三次 |
| ファイル種別 | sourceFileType | source_file_type | Excel/Word/PDF |
| 有効期限 | validUntil | valid_until | 企業設定日数で算出 |
| 状態 | status | status | 提案可/期限注意/停止 |

## マッチング

| 画面表示 | コード名 | DB項目名 | 備考 |
| --- | --- | --- | --- |
| マッチングID | matchId | id | 自動採番 |
| 案件ID | requestId | request_id | 参照 |
| 人材ID | talentId | talent_id | 参照 |
| 点数 | score | score | 0-100 |
| ランク | rank | rank | 1位/2位/3位/除外 |
| 提案候補 | cutoff | cutoff | boolean |
| 一致必須スキル | matchedRequired | matched_required | 配列 |
| 一致尚可スキル | matchedNice | matched_nice | 配列 |
| 不足スキル | missing | missing | 配列 |
| 個別判定 | checks | checks | 単価/勤務地/年齢/商流/NG |
| 判定理由 | reasons | reasons | 配列 |

## 送信・返信

| 画面表示 | コード名 | DB項目名 | 備考 |
| --- | --- | --- | --- |
| 提案先ID | proposalTargetId | id | 自動採番 |
| 送信可能 | canSend | can_send | boolean |
| 除外理由 | blockedReasons | blocked_reasons | 配列 |
| 下書き件名 | draftSubject | draft_subject | 本文は保存しない |
| 送信日時 | sentAt | sent_at | 送信履歴 |
| 返信受信日時 | receivedAt | received_at | 返信検知 |
| 返信元 | fromEmail | from_email | 返信検知 |
| 紐づき履歴 | linkedHistoryId | linked_history_id | 送信履歴参照 |
| 検知理由 | detectedReason | detected_reason | 例: メール一致 |
| 次アクション | nextAction | next_action | 手動確認など |

## 面談・成約

| 画面表示 | コード名 | DB項目名 | 備考 |
| --- | --- | --- | --- |
| 面談ID | interviewId | id | 自動採番 |
| 面談予定日時 | scheduledAt | scheduled_at | 日時 |
| 面談状態 | interviewStatus | status | 面談予定/結果待ち/見送り |
| 面談結果 | result | result | 先方確認中など |
| 成約ID | dealId | id | 自動採番 |
| 開始月 | startMonth | start_month | YYYY-MM |
| 成約状態 | dealStatus | status | 成約/条件調整/失注 |
| 売上単価 | salesUnit | sales_unit | 万円 |
| 支払単価 | payUnit | pay_unit | 万円 |
| 粗利 | grossProfit | gross_profit | 万円 |
| 粗利率 | grossRate | gross_rate | % |

## 未確定のまま残す項目
- 請求サイト
- 支払サイト
- 契約形態
- 稼働時間幅
- 精算幅
- 支払手数料
- 消費税区分

上記はMVP企業テスト後に必要性を判断する。

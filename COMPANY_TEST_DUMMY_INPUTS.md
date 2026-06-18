# 企業テスト ダミー入力テンプレート

## 目的
企業テストで実データを使わず、すぐマッチング確認できるようにするための貼り付け用サンプル。

## 使い方
1. `prototype/company-test.html` を開く。
2. 下の案件、人材、送信先CSVをそれぞれ貼る。
3. `マッチング実行` を押す。
4. 点数、除外理由、提案メール文面を見る。

## パターンA: 提案候補になる例

### 案件情報
```text
Java Spring Boot案件
必須: Java, Spring Boot
尚可: AWS, PostgreSQL
単価: 70万
勤務地: 東京
稼働: 即日
働き方: 週3リモート
年齢: 45歳まで
商流: 二次請まで
```

### 人材情報
```text
Javaエンジニア
スキル: Java, Spring Boot, AWS, PostgreSQL
希望単価: 68万
勤務地: 東京
稼働: 即日
年齢: 38歳
商流: 二次請
```

### 送信先CSV
```csv
会社名,担当者名,メールアドレス,送信可否,NG条件,年齢上限,商流上限
株式会社サンプルA,田中,tanaka@example.invalid,送信可,,45,2
株式会社サンプルB,佐藤,sato@example.invalid,送信可,単価80万円以上NG,45,2
株式会社サンプルC,鈴木,suzuki@example.invalid,停止,,45,2
```

## パターンB: 除外理由を見る例

### 案件情報
```text
Java保守案件
必須: Java
単価: 65万
勤務地: 東京
稼働: 即日
年齢: 45歳まで
商流: 二次請まで
NG: 外国籍
```

### 人材情報
```text
Javaエンジニア
スキル: Java, SQL
希望単価: 70万
勤務地: 神奈川
稼働: 来月
年齢: 50歳
商流: 三次請
外国籍
```

### 送信先CSV
```csv
company,person,email,sendable,ngConditions,ngWords,maxAge,maxCommerceLevel
Sample NG A,高橋,takahashi@example.invalid,送信可,70万以上NG,外国籍,45,2
Sample Stop B,伊藤,ito@example.invalid,停止,,,45,2
```

## パターンC: 複数人材ランキングを見る例

### 案件情報
```text
React TypeScript案件
必須: React, TypeScript
尚可: Next.js, Node.js
単価: 75万
勤務地: フルリモート
稼働: 即日
```

### 人材情報
```text
Reactエンジニア
スキル: React, TypeScript, Next.js
希望単価: 72万
勤務地: フルリモート
稼働: 即日
---
Pythonエンジニア
スキル: Python, Django, AWS
希望単価: 70万
勤務地: 東京
稼働: 即日
---
フロントエンドエンジニア
スキル: React, JavaScript, CSS
希望単価: 68万
勤務地: リモート
稼働: 来月
```

### 送信先CSV
```csv
会社名,担当者名,メールアドレス,送信可否,NG条件
株式会社フロントA,中村,nakamura@example.invalid,送信可,
株式会社フロントB,小林,kobayashi@example.invalid,送信可,常駐のみNG
```

## 注意
- `example.invalid` は送信不能なテスト用メールです。
- 実メール本文、実スキルシート本文、個人情報は貼らない。
- このテンプレートはマッチング確認用で、実送信は行わない。

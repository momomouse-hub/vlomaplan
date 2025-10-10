# 🎥VLOMAPLAN🗺️
『VLOMAPLAN』はVlogを観ながら旅行で行きたい場所を整理・プラン化できるWEBアプリです。

「Vlog視聴・場所検索・リスト作成・プラン化」をほぼ一画面で完結するようになっています！

基本機能はログイン無しで使用可能です！お気軽にお試しください。
> 未ログイン時のデータ保存は**7日間**、会員登録すると**無期限**で保存されます。未ログイン時に作成したデータは**登録時に引き継ぎ**可能です。


URL:https://app.vlomaplan.com/

**トップページ**
ここにスクリーンショットを載せる

## 使用した技術

- フロントエンド
  - HTML / CSS 
  - JavaScript（React 19, Vite）
  - React Router（ルーティング）
  - @vis.gl/react-google-maps（地図表示）
  - Google Maps JavaScript API（Places API *New* / Autocomplete）
  - react-modal-sheet（モバイル向けボトムシートUI）
  - ESLint / Prettier（コード整形・静的解析）

- バックエンド
  - Ruby 3.2.8
  - Ruby on Rails 7.1.5（APIモード）
  - RSpec（テスト）
  - RuboCop（コード解析）
  - bcrypt（パスワードハッシュ）

- データベース
  - MySQL 8.4

- 外部API・サービス連携
  - YouTube Data API v3（動画検索・視聴履歴の取り扱い）
  - Google Maps Platform（Maps JS / Places API *New* / Autocomplete）

- インフラ・開発環境
  - Docker / Docker Compose
  - AWS（ECR, ECS Fargate, VPC, ALB, RDS, S3, CloudFront, Route53, ACM, Systems Manager Parameter Store）
  - シークレット管理：AWS SSM Parameter Store
  - バージョン管理／開発フロー：GitHub（main／develop運用・PRレビュー）

## ER図
```mermaid
erDiagram
  USERS {
    int id PK "ユーザーID（主キー）"
  }

  USER_CREDENTIALS {
    int id PK "ID（主キー）"
    int user_id FK "ユーザーID（UNIQUE, 外部キー: USERS.id）"
    string email "メール（VARCHAR(255), UNIQUE）"
    string encrypted_password "暗号化パスワード（VARCHAR(60)）"
  }

  USER_VISITS {
    int id PK "ID（主キー）"
    int user_id FK "ユーザーID（UNIQUE, 外部キー: USERS.id）"
    string token "ゲスト用トークン（CHAR(36), UNIQUE）"
    datetime created_at "作成日時"
  }

  SEARCH_HISTORIES {
    int id PK "ID（主キー）"
    int user_id FK "ユーザーID（外部キー: USERS.id）"
    string keyword "検索キーワード（VARCHAR(100)）"
    datetime created_at "検索日時"
  }

  VIDEO_VIEWS {
    int id PK "ID（主キー）"
    string youtube_video_id "YouTube動画ID（CHAR(11), UNIQUE）"
    string title "動画タイトル（VARCHAR(255)）"
    string thumbnail_url "サムネイルURL（VARCHAR(512)）"
    int search_history_id FK "検索履歴ID（外部キー: SEARCH_HISTORIES.id）"
  }

  PLACES {
    int id PK "ID（主キー）"
    string name "施設名（VARCHAR(255)）"
    string address "住所（VARCHAR(255)）"
    decimal latitude "緯度（DECIMAL(10,6)）"
    decimal longitude "経度（DECIMAL(10,6)）"
    string place_id "Google Place ID（VARCHAR(100), UNIQUE）"
  }

  VIDEO_VIEW_PLACES {
    int id PK "ID（主キー）"
    int video_view_id FK "動画ID（外部キー: VIDEO_VIEWS.id）"
    int place_id FK "場所ID（外部キー: PLACES.id）"
  }

  PLACE_OPENING_HOURS {
    int id PK "ID（主キー）"
    int place_id FK "場所ID（外部キー: PLACES.id）"
    int weekday "曜日（0:日曜~6:土曜）"
    time open_time "営業開始（例: 09:00:00）"
    time close_time "営業終了（例: 18:00:00）"
    boolean is_closed "定休日フラグ"
  }

  WISHLISTS {
    int id PK "ID（主キー）"
    int user_id FK "ユーザーID（外部キー: USERS.id）"
    int place_id FK "場所ID（外部キー: PLACES.id）"
    datetime created_at "作成日時"
  }

  TRAVEL_PLANS {
    int id PK "ID（主キー）"
    int user_id FK "ユーザーID（外部キー: USERS.id）"
    string name "プラン名（VARCHAR(100)）"
  }

  TRAVEL_PLAN_ITEMS {
    int id PK "ID（主キー）"
    int travel_plan_id FK "旅行プランID（外部キー: TRAVEL_PLANS.id）"
    int place_id FK "場所ID（外部キー: PLACES.id）"
    int sort_order "順番"
  }

  USERS ||--o| USER_CREDENTIALS : has
  USERS ||--o| USER_VISITS : has
  USERS ||--o{ SEARCH_HISTORIES : has
  USERS ||--o{ WISHLISTS : has
  USERS ||--o{ TRAVEL_PLANS : has

  SEARCH_HISTORIES ||--o{ VIDEO_VIEWS : has

  VIDEO_VIEWS ||--o{ VIDEO_VIEW_PLACES : maps
  PLACES ||--o{ VIDEO_VIEW_PLACES : mapped_by

  PLACES ||--o{ PLACE_OPENING_HOURS : has_hours_for
  PLACES ||--o{ TRAVEL_PLAN_ITEMS : included_in

  TRAVEL_PLANS ||--o{ TRAVEL_PLAN_ITEMS : has
  WISHLISTS }o--|| PLACES : includes
```

## AWS構成図
![インフラ構成図](./documents/インフラ構成図.png)

## 実装機能一覧
- 基本機能
  - 新規会員登録・ログイン機能
  - YouTubeのVlog動画検索・視聴機能
  - GoogleMapでの場所検索機能
  - 行きたい場所リストへの登録・削除
  - 旅行プランの作成・編集・削除
  - 旅行プランの並べ替え機能
  - モーダルでのマップの開閉機能(画面幅が狭い時)

### データ保存について

- ゲスト利用（ログインなし）
  - 作成した「行きたい場所」「旅行プラン」は**7日間**保存されます（期限を過ぎると自動削除）。
- 会員登録／ログイン後
  - データはサーバーに**無期限保存**され、**複数端末で同期**されます。
- 引き継ぎ
  - ゲストで作成したデータは、**会員登録またはログイン時にそのまま引き継がれます**。

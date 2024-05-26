# ChatWave 学習のためのリポジトリです（仮の設定です）

ChatWave は、Ruby on Rails と React を使用して構築された LINE のようなメッセージングアプリケーションです。このプロジェクトは、リアルタイムメッセージングを提供し、モダンなウェブインターフェースを持っています。

## 目次

1. [概要](#概要)
2. [機能](#機能)
3. [技術スタック](#技術スタック)
4. [セットアップとインストール](#セットアップとインストール)
5. [使用方法](#使用方法)
6. [開発](#開発)
7. [貢献](#貢献)
8. [ライセンス](#ライセンス)

## 概要

ChatWave は、リアルタイムチャット、ユーザー認証、ユーザープロファイルなどの機能を提供するメッセージングアプリケーションです。LINE のような人気メッセージングアプリを参考にしており、バックエンドには Ruby on Rails、フロントエンドには React を使用しています。

## 機能

- ユーザー認証（サインアップ、ログイン、ログアウト）
- リアルタイムメッセージング（WebSocket を使用）
- ユーザープロファイル
- メッセージ通知
- レスポンシブデザイン

## 技術スタック

- **バックエンド**: Ruby on Rails
- **フロントエンド**: React
- **データベース**: PostgreSQL
- **リアルタイム通信**: ActionCable (WebSocket)
- **コンテナ化**: Docker
- **スタイリング**: CSS（または Bootstrap などの CSS フレームワーク）

## セットアップとインストール

### 前提条件

以下のソフトウェアがインストールされていることを確認してください。

- Docker
- Docker Compose
- Ruby（Docker を使用しない場合）
- Node.js
- Yarn
- PostgreSQL（Docker を使用しない場合）

### インストール手順

1. **リポジトリをクローンします:**

   ```bash
   git clone git@github.com:Kazuya-Sakashita/ChatWave.git
   cd ChatWave
   ```

2. **環境変数の設定:**

```plaintext
# データベース接続情報
POSTGRES_USER=******
POSTGRES_PASSWORD=*****
POSTGRES_DB=chatwave
POSTGRES_HOST=db
POSTGRES_PORT=5432

# アプリケーション設定
RAILS_ENV=development
REACT_APP_API_URL=http://localhost:3000
```

3. **Docker コンテナのビルドと起動:**

```bash
docker-compose build
docker-compose up
```

4. **データベースのセットアップ:**

```bash
docker-compose run backend rails db:create db:migrate
```

5. **アプリケーションへのアクセス:**

- Rails は localhost:3000、React は localhost:8000 でアクセスできます

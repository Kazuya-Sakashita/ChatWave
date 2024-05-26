FROM node:20.13.1-alpine
WORKDIR /frontend/app

# 依存関係をインストール
COPY app/package.json app/yarn.lock ./
RUN yarn install

# アプリケーションコードをコピー
COPY app ./

# デフォルトのコマンド
CMD ["yarn", "start"]

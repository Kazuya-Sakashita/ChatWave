# 使用したいRubyのimageを指定
FROM ruby:3.3.1

# PostgreSQLクライアントとyarn, Node.jsをインストール
RUN apt-get update -qq && \
    apt-get install -y postgresql-client curl apt-transport-https wget && \
    curl https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    curl https://deb.nodesource.com/setup_14.x | bash - && \
    apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 1655A0AB68576280 && \
    apt-get update && \
    apt-get install -y yarn nodejs

# ワークディレクトリを設定
WORKDIR /backend

# GemfileとGemfile.lockをコピーし、Gemをインストール
COPY Gemfile Gemfile.lock ./
RUN gem install bundler && \
    bundle install

# アプリケーションのファイルをコピー
COPY . .

# Rails固有のエントリーポイント対応
COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh

# エントリーポイントとRailsサーバーの起動コマンド
ENTRYPOINT ["entrypoint.sh"]
CMD ["rails", "server", "-b", "0.0.0.0"]

# ポート3000を公開
EXPOSE 3000

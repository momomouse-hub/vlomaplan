# syntax=docker/dockerfile:1
ARG RUBY_VERSION=3.4.5

FROM ruby:${RUBY_VERSION} AS base
RUN apt-get update && apt-get install -y \
    build-essential \
    default-libmysqlclient-dev \
    default-mysql-client \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ---- 開発用（docker compose で使う） ----
FROM base AS dev
ENV RAILS_ENV=development
COPY Gemfile Gemfile.lock ./
RUN bundle install
COPY . .
# 既存 entrypoint.sh の「PID削除」をCMDに内包
CMD ["bash","-lc","rm -f tmp/pids/server.pid && bundle exec rails s -p 3000 -b 0.0.0.0"]

# ---- 本番用の依存だけでビルド ----
FROM base AS prod-build
ENV RAILS_ENV=production
COPY Gemfile Gemfile.lock ./
RUN bundle config set without 'development test' \
 && bundle install --jobs=4 --retry=3
COPY . .

# ---- 本番最終イメージ（軽量） ----
  FROM ruby:${RUBY_VERSION}-slim AS app
  # 開発ヘッダは不要。実行時ライブラリのみでOK
  RUN apt-get update && apt-get install -y --no-install-recommends \
      libmariadb3 \
   && rm -rf /var/lib/apt/lists/*
  ENV RAILS_ENV=production RACK_ENV=production
  WORKDIR /app
  COPY --from=prod-build /usr/local/bundle /usr/local/bundle
  COPY --from=prod-build /app /app
  EXPOSE 3000
  CMD ["bash","-lc","bundle exec puma -C config/puma.rb"]
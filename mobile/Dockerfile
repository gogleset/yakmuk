# Expo Metro — 호스트 시뮬/실기기·브라우저가 붙는 개발 서버
FROM node:24.18.0-bookworm-slim

# package.json packageManager=10.x여도 lockfile v6 → pnpm 8 사용
RUN corepack disable \
  && npm install -g pnpm@8.15.5

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 8081 19000 19001 19002

ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV CI=1

CMD ["pnpm", "exec", "expo", "start", "--host", "lan"]

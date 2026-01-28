FROM node:22-slim AS base

RUN corepack enable pnpm

RUN apt-get update && apt-get install -y --no-install-recommends \
    texlive \
    texlive-latex-extra \
    texlive-pictures \
    texlive-fonts-recommended \
    texlive-science \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

COPY . .
RUN pnpm build

EXPOSE 3001

CMD ["node", "dist/index.js"]

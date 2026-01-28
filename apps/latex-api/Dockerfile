FROM oven/bun:1-debian AS base

RUN apt-get update && apt-get install -y --no-install-recommends \
    texlive \
    texlive-latex-extra \
    texlive-pictures \
    texlive-fonts-recommended \
    texlive-science \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile || bun install

COPY . .

EXPOSE 3001

CMD ["bun", "run", "start"]

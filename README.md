# Open-Prism

Open-source AI-powered LaTeX writing workspace with live preview.

![Open-Prism Screenshot](./assets/OpenPrism.png)

## Features

- **AI-Assisted Writing** - Powered by assistant-ui for intelligent LaTeX assistance
- **Live PDF Preview** - Real-time compilation and preview of your documents
- **CodeMirror Editor** - Syntax highlighting and LaTeX language support
- **Local Storage** - Documents saved in browser IndexedDB
- **Dark/Light Theme** - Automatic theme switching support

## Quick Start

```bash
# Clone the repository
git clone https://github.com/assistant-ui/open-prism.git
cd open-prism

# Install dependencies
pnpm install

# Copy environment variables
cp apps/web/.env.example apps/web/.env.local

# Configure your environment variables in apps/web/.env.local
# - OPENAI_API_KEY: Your OpenAI API key
# - LATEX_API_URL: URL to the LaTeX compilation service
# - KV_REST_API_URL: KV REST API URL (for rate limiting)
# - KV_REST_API_TOKEN: KV REST API token

# Start development server
pnpm dev:web
```

## Project Structure

```
open-prism/
├── apps/
│   ├── web/          # Next.js frontend application
│   └── latex-api/    # LaTeX compilation API (Hono + TeX Live)
├── packages/         # Shared packages (if any)
├── biome.json        # Biome linter configuration
└── turbo.json        # Turborepo configuration
```

### apps/web

Next.js 16 application with:
- assistant-ui for AI chat interface
- CodeMirror for LaTeX editing
- react-pdf for PDF preview
- Upstash Redis for rate limiting

### apps/latex-api

Hono-based API for LaTeX compilation:
- Accepts LaTeX source code
- Compiles using TeX Live (pdflatex)
- Returns compiled PDF

## Deployment

### Web App (Vercel)

1. Import the repository to Vercel
2. Set root directory to `apps/web`
3. Configure environment variables:
   - `OPENAI_API_KEY`
   - `LATEX_API_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

### LaTeX API (Docker)

```bash
cd apps/latex-api
docker build -t open-prism-latex-api .
docker run -p 3001:3001 open-prism-latex-api
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and contribution guidelines.

## License

[MIT](./LICENSE)

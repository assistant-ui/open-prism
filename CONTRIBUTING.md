# Contributing to Open-Prism

## Development Environment

### Requirements

- Node.js 20+
- pnpm 10+
- TeX Live (for local latex-api development)

### Setup

```bash
# Clone the repository
git clone https://github.com/assistant-ui/open-prism.git
cd open-prism

# Install dependencies
pnpm install

# Copy environment variables
cp apps/web/.env.example apps/web/.env.local
# Edit apps/web/.env.local with your configuration

# Start development
pnpm dev:web
```

### Running LaTeX API locally

```bash
# Requires TeX Live installed
cd apps/latex-api
pnpm dev
```

## Code Style

This project uses [Biome](https://biomejs.dev/) for linting and formatting.

```bash
# Check code
pnpm lint

# Auto-fix issues
pnpm lint:fix
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes
4. Run `pnpm lint` to ensure code quality
5. Commit with a descriptive message
6. Push to your fork and open a PR

### Commit Convention

Use conventional commits:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `refactor:` code refactoring
- `chore:` maintenance tasks

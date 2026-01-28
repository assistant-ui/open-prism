# LaTeX API

A simple LaTeX compilation API service built with Hono + Node.js.

## API

### `POST /builds/sync`

Compiles LaTeX documents and returns PDF.

**Request:**
```json
{
  "compiler": "pdflatex",
  "resources": [
    {
      "path": "main.tex",
      "content": "\\documentclass{article}\\begin{document}Hello\\end{document}",
      "main": true
    },
    {
      "path": "image.png",
      "file": "<base64-encoded-content>"
    }
  ]
}
```

**Response:**
- Success: `application/pdf` binary
- Failure: `application/json` with `{ error, log_files }`

## Local Development

```bash
# Install dependencies (from workspace root)
pnpm install

# Run development server
pnpm dev

# Test
curl -X POST http://localhost:3001/builds/sync \
  -H "Content-Type: application/json" \
  -d '{"compiler":"pdflatex","resources":[{"main":true,"content":"\\documentclass{article}\\begin{document}Hello\\end{document}"}]}'
```

Requires TeX Live installed locally for development.

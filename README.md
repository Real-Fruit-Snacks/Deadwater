<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Real-Fruit-Snacks/Deadwater/main/docs/assets/logo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Real-Fruit-Snacks/Deadwater/main/docs/assets/logo-light.svg">
  <img alt="Deadwater" src="https://raw.githubusercontent.com/Real-Fruit-Snacks/Deadwater/main/docs/assets/logo-dark.svg" width="520">
</picture>

![Go](https://img.shields.io/badge/Go-00ADD8?logo=go&logoColor=fff)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

**Open research platform for indexing, searching, and serving computational research publications**

Hybrid search engine combining BM25 lexical scoring with dense embedding similarity. Static site generator producing thousands of SEO-optimized pages. REST and GraphQL APIs. Citation export. Full-text search across 43 research domains. 2,000+ articles indexed.

</div>

---

## Quick Start

### Prerequisites

- **Python** 3.10+ — search engine, models, and index building
- **Node.js** 20+ — static site generation
- **pip** — Python package installation

### Install and Run

```bash
git clone https://github.com/Real-Fruit-Snacks/Deadwater.git
cd Deadwater

# Install Python package
pip install -e ".[dev]"

# Build the static site
node build.js

# Serve locally
cd public && python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

```bash
# Test search API
curl http://localhost:8000/api/v2/search?q=distributed+consensus

# Run test suite
pytest
```

---

## Features

### Hybrid Search Engine

BM25 lexical scoring combined with dense embedding similarity for best-of-both-worlds retrieval. Phrase search, domain filtering, and pagination built in. Query cache for instant repeat lookups.

```python
from deadwater import ResearchEngine

engine = ResearchEngine(index_path="./data/index")
engine.load()

response = engine.search(
    "distributed consensus algorithms",
    domains=["Distributed Systems"],
    page=1,
    per_page=20,
)

for result in response.results:
    print(f"{result.score:.3f} | {result.article.title}")
```

### REST API

Full REST API with OpenAPI 3.1 specification. Pagination, domain filtering, and multiple export formats.

```bash
# List articles
curl /api/v2/articles?page=1&per_page=20

# Full-text search
curl /api/v2/search?q=neural+architecture&type=all

# Export as BibTeX
curl /api/v2/papers/42?format=bibtex

# Bulk export
curl -X POST /api/v2/export \
  -H "Content-Type: application/json" \
  -d '{"query": "distributed systems", "format": "jsonl", "max_records": 1000}'
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v2/articles` | List articles with pagination |
| `GET` | `/api/v2/search` | Full-text search with domain filters |
| `GET` | `/api/v2/papers/:id` | Single paper with optional format export |
| `POST` | `/api/v2/export` | Bulk export (JSONL, CSV, BibTeX, RIS) |
| `GET` | `/api/v2/domains` | List all 43 research domains |
| `POST` | `/graphql` | GraphQL with cursor pagination |

### GraphQL API

Cursor-based pagination with full article metadata. Query articles by domain, search across all fields, and export citations.

```graphql
{
  articles(domain: "Distributed Systems", first: 10) {
    edges {
      node {
        title
        authors
        doi
        citations
        abstract
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

### Citation Export

BibTeX, RIS, CSV, and JSON formats. Single-paper and bulk export. JSONL streaming for large datasets. Standards-compliant output ready for Zotero, Mendeley, and EndNote.

### Static Site Generator

Node.js build system produces thousands of pages from the research index:

| Output | Count |
|--------|-------|
| Research article pages | 2,000 |
| Archive pages | 200 |
| Publication pages | 200 |
| Newsletter issues | 36 |
| Sitemaps | 6 + index |
| RSS and Atom feeds | 2 |

### Offline-First Architecture

Intelligent service worker serves the entire site and API from cache. Search works without a server. IndexedDB backs the query cache for persistent offline access. Zero runtime infrastructure — no databases, no containers, no cloud functions in production.

### Monthly Newsletter Archive

Three years of research digests spanning 36 monthly issues. Curated highlights, trending papers, and domain summaries generated from the index.

---

## Architecture

```
Deadwater/
├── build.js                          # Static site generator (Node.js)
├── pyproject.toml                    # Python package configuration
├── src/
│   └── deadwater/
│       ├── __init__.py               # Package root and public API
│       ├── core/
│       │   ├── engine.py             # Hybrid search (BM25 + semantic)
│       │   └── index.py              # Inverted index with BM25 scoring
│       └── models/
│           ├── article.py            # Article models with citation export
│           └── author.py             # Author profiles with impact metrics
├── tests/
│   └── test_engine.py                # Search engine test suite
├── public/                           # Generated static site
│   ├── index.html                    # Main page with infinite scroll
│   ├── sw.js                         # Service worker for offline + API
│   ├── research/                     # Article pages
│   ├── newsletter/                   # Monthly digest archive
│   ├── api/docs/                     # OpenAPI 3.1 specification
│   ├── citations/                    # BibTeX and RIS files
│   └── datasets/                     # CSV and JSON exports
└── docs/
    ├── index.html
    └── assets/
        ├── logo-dark.svg
        └── logo-light.svg
```

Python builds the search index with BM25 scoring and dense embeddings. Node.js generates the static site. GitHub Pages serves it. The service worker intercepts API calls at runtime for instant offline responses.

---

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DW_INDEX_PATH` | `./data/index` | Path to the search index directory |
| `DW_EMBEDDING_DIM` | `768` | Embedding vector dimensionality |
| `DW_CACHE_SIZE` | `10000` | Maximum entries in the query cache |
| `DW_USE_GPU` | `false` | Use GPU acceleration for embeddings |
| `DW_LOG_LEVEL` | `INFO` | Logging verbosity |

---

## Development

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=deadwater --cov-report=html

# Lint
ruff check src/ tests/

# Type check
mypy src/deadwater/

# Rebuild static site
node build.js
```

The site deploys to GitHub Pages automatically on every push to `main`. A nightly workflow regenerates content to keep it current.

---

## Platform Support

| Capability | Linux | macOS | Windows |
|------------|-------|-------|---------|
| Search Engine | Full | Full | Full |
| Site Generation | Full | Full | Full |
| GPU Embeddings | CUDA / ROCm | Metal | CUDA |
| Test Suite | Full | Full | Full |
| Offline Site | All browsers | All browsers | All browsers |

---

## License

[MIT](LICENSE) — Copyright 2026 Real-Fruit-Snacks

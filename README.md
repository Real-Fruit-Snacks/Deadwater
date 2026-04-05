<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Real-Fruit-Snacks/Deadwater/main/docs/assets/logo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Real-Fruit-Snacks/Deadwater/main/docs/assets/logo-light.svg">
  <img alt="Deadwater" src="https://raw.githubusercontent.com/Real-Fruit-Snacks/Deadwater/main/docs/assets/logo-dark.svg" width="520">
</picture>

![Go](https://img.shields.io/badge/language-Go-00add8.svg)
![TypeScript](https://img.shields.io/badge/language-TypeScript-3178c6.svg)
![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20Windows%20%7C%20macOS-lightgrey)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

**Open research platform for indexing, searching, and serving computational research publications**

Hybrid search engine combining BM25 lexical scoring with dense embedding similarity. Static site generator producing thousands of SEO-optimized pages. REST and GraphQL APIs. Citation export. Full-text search across 43 research domains.

> **2,000+ articles indexed. Instant search. Zero backend required at runtime.**

[Quick Start](#quick-start) • [Usage](#usage) • [Architecture](#architecture) • [API Reference](#api-reference) • [Development](#development) • [Security](#security)

</div>

---

## Highlights

<table>
<tr>
<td width="50%">

**Hybrid Search Engine**
BM25 lexical scoring combined with dense embedding similarity for best-of-both-worlds retrieval. Phrase search, domain filtering, and pagination built in. Query cache for instant repeat lookups.

**Static Site Generator**
Node.js build system produces 2,000+ research article pages, 200 archive pages, 200 publication pages, 36 newsletter issues, sitemaps, and feeds. Every page is SEO-optimized with structured data.

**Citation Export**
BibTeX, RIS, CSV, and JSON formats. Single-paper and bulk export. JSONL streaming for large datasets. Standards-compliant output ready for Zotero, Mendeley, and EndNote.

**43 Research Domains**
Distributed systems, neural architecture, quantum-adjacent computing, cryptographic protocols, and more. Domain-filtered search narrows results to specific fields.

</td>
<td width="50%">

**REST + GraphQL APIs**
Full REST API with OpenAPI 3.1 specification. GraphQL endpoint with cursor-based pagination. Service worker intercepts API calls for instant offline responses.

**Monthly Newsletter Archive**
Three years of research digests spanning 36 monthly issues. Curated highlights, trending papers, and domain summaries generated from the index.

**Offline-First Architecture**
Intelligent service worker serves the entire site and API from cache. Search works without a server. IndexedDB backs the query cache for persistent offline access.

**Zero Runtime Infrastructure**
Python builds the index. Node generates the site. GitHub Pages serves static files. No databases, no containers, no cloud functions in production.

</td>
</tr>
</table>

---

## Quick Start

### Prerequisites

<table>
<tr>
<th>Requirement</th>
<th>Version</th>
<th>Purpose</th>
</tr>
<tr>
<td>Python</td>
<td>3.10+</td>
<td>Search engine, models, and index building</td>
</tr>
<tr>
<td>Node.js</td>
<td>20+</td>
<td>Static site generation</td>
</tr>
<tr>
<td>pip</td>
<td>Latest</td>
<td>Python package installation</td>
</tr>
</table>

### Build

```bash
# Clone repository
git clone https://github.com/Real-Fruit-Snacks/Deadwater.git
cd Deadwater

# Install Python package
pip install -e ".[dev]"

# Build the static site
node build.js

# Verify — site is generated in public/
ls public/
```

### Verification

```bash
# Serve locally
cd public && python3 -m http.server 8000

# Open http://localhost:8000

# Test search API
curl http://localhost:8000/api/v2/search?q=distributed+consensus

# Run test suite
pytest
```

### Build Output

<table>
<tr>
<th>Output</th>
<th>Count</th>
</tr>
<tr>
<td>Research article pages</td>
<td>2,000</td>
</tr>
<tr>
<td>Archive pages</td>
<td>200</td>
</tr>
<tr>
<td>Publication pages</td>
<td>200</td>
</tr>
<tr>
<td>Newsletter issues</td>
<td>36</td>
</tr>
<tr>
<td>Sitemaps</td>
<td>6 + index</td>
</tr>
<tr>
<td>RSS and Atom feeds</td>
<td>2</td>
</tr>
<tr>
<td>BibTeX and RIS citations</td>
<td>500 each</td>
</tr>
<tr>
<td>CSV and JSON datasets</td>
<td>1,000 / 500 entries</td>
</tr>
</table>

---

## Usage

### Python Library

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

```bash
# List articles with pagination
curl /api/v2/articles?page=1&per_page=20

# Full-text search
curl /api/v2/search?q=neural+architecture&type=all

# Export a paper as BibTeX
curl /api/v2/papers/42?format=bibtex

# Bulk export
curl -X POST /api/v2/export \
  -H "Content-Type: application/json" \
  -d '{"query": "distributed systems", "format": "jsonl", "max_records": 1000}'
```

### GraphQL

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

---

## Architecture

```
Deadwater/
├── build.js                                Static site generator (Node.js)
├── pyproject.toml                          Python package configuration
│
├── src/
│   └── deadwater/
│       ├── __init__.py                     Package root and public API
│       ├── core/
│       │   ├── __init__.py                 Core module exports
│       │   ├── engine.py                   Hybrid search engine (BM25 + semantic similarity)
│       │   └── index.py                    Inverted index with phrase search and BM25 scoring
│       └── models/
│           ├── __init__.py                 Model exports
│           ├── article.py                  Article and Paper models with BibTeX/RIS export
│           └── author.py                   Author profiles with impact metrics
│
├── tests/
│   └── test_engine.py                      Search engine test suite
│
├── public/                                 Static site output (generated by build.js)
│   ├── index.html                          Main page with infinite scroll
│   ├── sw.js                               Service worker for offline access and API routing
│   ├── research/                           Generated article pages
│   ├── newsletter/                         Monthly digest archive
│   ├── api/docs/                           OpenAPI 3.1 specification
│   ├── citations/                          BibTeX and RIS files
│   ├── datasets/                           CSV and JSON exports
│   ├── feed.xml                            RSS feed
│   └── atom.xml                            Atom feed
│
├── docs/                                   GitHub Pages project site
│   ├── index.html                          Project website
│   └── assets/
│       ├── logo-dark.svg                   Logo for dark theme
│       └── logo-light.svg                  Logo for light theme
│
└── .github/
    └── workflows/
        └── pages.yml                       GitHub Pages deployment + nightly regeneration
```

### Execution Flow

### Stage 1: Indexing
1. **Load articles** — Parse research publications from structured data sources
2. **Build inverted index** — Tokenize, stem, compute term frequencies and document lengths for BM25
3. **Generate embeddings** — Dense vector representations for semantic similarity search
4. **Persist index** — Write index to disk for reuse across builds

### Stage 2: Site Generation
```
                    node build.js
                         │
         ┌───────┬───────┼───────┬───────┬───────┐
         │       │       │       │       │       │
      articles archive  pubs  newsletter feeds  citations
      (2,000)  (200)   (200)   (36)     (RSS)  (BibTeX/RIS)
         │       │       │       │       │       │
         └───────┴───────┼───────┴───────┴───────┘
                         │
                    public/ directory
                  (static HTML + JSON)
                         │
                  Service Worker (sw.js)
              API routing + offline cache
```

### Stage 3: Search at Runtime
- Service worker intercepts `/api/v2/*` requests and serves pre-built JSON responses
- Full-text search uses the pre-computed inverted index embedded in the static site
- Query cache stores recent searches in IndexedDB for instant repeat access
- GraphQL queries are resolved client-side against the cached article dataset

---

## API Reference

### REST Endpoints

<table>
<tr>
<th>Method</th>
<th>Endpoint</th>
<th>Description</th>
</tr>
<tr>
<td><code>GET</code></td>
<td><code>/api/v2/articles</code></td>
<td>List articles with pagination</td>
</tr>
<tr>
<td><code>GET</code></td>
<td><code>/api/v2/search</code></td>
<td>Full-text search with domain filters</td>
</tr>
<tr>
<td><code>GET</code></td>
<td><code>/api/v2/papers/:id</code></td>
<td>Single paper with optional format export</td>
</tr>
<tr>
<td><code>POST</code></td>
<td><code>/api/v2/export</code></td>
<td>Bulk export (JSONL, CSV, BibTeX, RIS)</td>
</tr>
<tr>
<td><code>GET</code></td>
<td><code>/api/v2/domains</code></td>
<td>List all 43 research domains</td>
</tr>
<tr>
<td><code>POST</code></td>
<td><code>/graphql</code></td>
<td>GraphQL endpoint with cursor pagination</td>
</tr>
</table>

### Search Parameters

<table>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Description</th>
</tr>
<tr>
<td><code>q</code></td>
<td>string</td>
<td>Search query (supports phrases with quotes)</td>
</tr>
<tr>
<td><code>type</code></td>
<td>string</td>
<td><code>all</code>, <code>title</code>, <code>abstract</code>, <code>author</code></td>
</tr>
<tr>
<td><code>domain</code></td>
<td>string</td>
<td>Filter by research domain</td>
</tr>
<tr>
<td><code>page</code></td>
<td>integer</td>
<td>Page number (default: 1)</td>
</tr>
<tr>
<td><code>per_page</code></td>
<td>integer</td>
<td>Results per page (default: 20, max: 100)</td>
</tr>
</table>

---

## Configuration

<table>
<tr>
<th>Variable</th>
<th>Default</th>
<th>Description</th>
</tr>
<tr>
<td><code>DW_INDEX_PATH</code></td>
<td><code>./data/index</code></td>
<td>Path to the search index directory</td>
</tr>
<tr>
<td><code>DW_EMBEDDING_DIM</code></td>
<td><code>768</code></td>
<td>Embedding vector dimensionality</td>
</tr>
<tr>
<td><code>DW_CACHE_SIZE</code></td>
<td><code>10000</code></td>
<td>Maximum entries in the query cache</td>
</tr>
<tr>
<td><code>DW_USE_GPU</code></td>
<td><code>false</code></td>
<td>Use GPU acceleration for embeddings</td>
</tr>
<tr>
<td><code>DW_LOG_LEVEL</code></td>
<td><code>INFO</code></td>
<td>Logging verbosity</td>
</tr>
</table>

---

## Platform Support

<table>
<tr>
<th>Capability</th>
<th>Linux</th>
<th>macOS</th>
<th>Windows</th>
</tr>
<tr>
<td>Search Engine</td>
<td>Full</td>
<td>Full</td>
<td>Full</td>
</tr>
<tr>
<td>Site Generation</td>
<td>Full</td>
<td>Full</td>
<td>Full</td>
</tr>
<tr>
<td>GPU Embeddings</td>
<td>CUDA / ROCm</td>
<td>Metal</td>
<td>CUDA</td>
</tr>
<tr>
<td>Test Suite</td>
<td>Full</td>
<td>Full</td>
<td>Full</td>
</tr>
<tr>
<td>GitHub Pages Deploy</td>
<td>Full (CI)</td>
<td>Full (CI)</td>
<td>Full (CI)</td>
</tr>
<tr>
<td>Offline Site</td>
<td>All browsers</td>
<td>All browsers</td>
<td>All browsers</td>
</tr>
</table>

---

## Development

```bash
# Run the test suite
pytest

# Run with coverage reporting
pytest --cov=deadwater --cov-report=html

# Lint
ruff check src/ tests/

# Type check
mypy src/deadwater/

# Rebuild the static site
node build.js
```

### Deployment

The site deploys to GitHub Pages automatically on every push to `main`. A nightly workflow regenerates content to keep the site current.

To deploy your own instance:

1. Fork this repository
2. Go to **Settings > Pages > Source** and select **GitHub Actions**
3. Push to `main`

The workflow runs `node build.js` and publishes the `public/` directory. See [`.github/workflows/pages.yml`](.github/workflows/pages.yml) for details.

---

## Security

### Data Model

- **No user data** — Deadwater indexes public research publications only
- **No authentication** — The API is read-only with no write endpoints
- **No server runtime** — Static files served via GitHub Pages; no attack surface
- **No external calls** — Service worker serves all content from cache after first load

### Vulnerability Reporting

**Report security issues via:**
- GitHub Security Advisories (preferred)
- Private disclosure to maintainers
- Responsible disclosure timeline (90 days)

**Do NOT:**
- Open public GitHub issues for vulnerabilities
- Disclose before coordination with maintainers

---

## License

MIT License

Copyright &copy; 2026 Real-Fruit-Snacks

```
THIS SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND.
THE AUTHORS ARE NOT LIABLE FOR ANY DAMAGES ARISING FROM USE.
USE AT YOUR OWN RISK.
```

---

## Resources

- **GitHub**: [github.com/Real-Fruit-Snacks/Deadwater](https://github.com/Real-Fruit-Snacks/Deadwater)
- **Pages**: [real-fruit-snacks.github.io/Deadwater](https://real-fruit-snacks.github.io/Deadwater)
- **Issues**: [Report a Bug](https://github.com/Real-Fruit-Snacks/Deadwater/issues)
- **Security**: [SECURITY.md](SECURITY.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)

---

<div align="center">

**Part of the Real-Fruit-Snacks water-themed security toolkit**

[Aquifer](https://github.com/Real-Fruit-Snacks/Aquifer) • [armsforge](https://github.com/Real-Fruit-Snacks/armsforge) • [Cascade](https://github.com/Real-Fruit-Snacks/Cascade) • [Conduit](https://github.com/Real-Fruit-Snacks/Conduit) • **Deadwater** • [Deluge](https://github.com/Real-Fruit-Snacks/Deluge) • [Depth](https://github.com/Real-Fruit-Snacks/Depth) • [Dew](https://github.com/Real-Fruit-Snacks/Dew) • [Droplet](https://github.com/Real-Fruit-Snacks/Droplet) • [Fathom](https://github.com/Real-Fruit-Snacks/Fathom) • [Flux](https://github.com/Real-Fruit-Snacks/Flux) • [Grotto](https://github.com/Real-Fruit-Snacks/Grotto) • [HydroShot](https://github.com/Real-Fruit-Snacks/HydroShot) • [LigoloSupport](https://github.com/Real-Fruit-Snacks/LigoloSupport) • [Maelstrom](https://github.com/Real-Fruit-Snacks/Maelstrom) • [Rapids](https://github.com/Real-Fruit-Snacks/Rapids) • [Ripple](https://github.com/Real-Fruit-Snacks/Ripple) • [Riptide](https://github.com/Real-Fruit-Snacks/Riptide) • [Runoff](https://github.com/Real-Fruit-Snacks/Runoff) • [Seep](https://github.com/Real-Fruit-Snacks/Seep) • [Shallows](https://github.com/Real-Fruit-Snacks/Shallows) • [Siphon](https://github.com/Real-Fruit-Snacks/Siphon) • [Slipstream](https://github.com/Real-Fruit-Snacks/Slipstream) • [Spillway](https://github.com/Real-Fruit-Snacks/Spillway) • [Sunken-Archive](https://github.com/Real-Fruit-Snacks/Sunken-Archive) • [Surge](https://github.com/Real-Fruit-Snacks/Surge) • [Tidemark](https://github.com/Real-Fruit-Snacks/Tidemark) • [Tidepool](https://github.com/Real-Fruit-Snacks/Tidepool) • [Undercurrent](https://github.com/Real-Fruit-Snacks/Undercurrent) • [Undertow](https://github.com/Real-Fruit-Snacks/Undertow) • [Vapor](https://github.com/Real-Fruit-Snacks/Vapor) • [Wellspring](https://github.com/Real-Fruit-Snacks/Wellspring) • [Whirlpool](https://github.com/Real-Fruit-Snacks/Whirlpool)

*Remember: With great power comes great responsibility.*

</div>

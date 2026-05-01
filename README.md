<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Real-Fruit-Snacks/Deadwater/main/docs/assets/logo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Real-Fruit-Snacks/Deadwater/main/docs/assets/logo-light.svg">
  <img alt="Deadwater" src="https://raw.githubusercontent.com/Real-Fruit-Snacks/Deadwater/main/docs/assets/logo-dark.svg" width="100%">
</picture>

> [!IMPORTANT]
> **Open research platform for indexing, searching, and serving computational research publications.** Hybrid search engine combining BM25 lexical scoring with dense embedding similarity. Static site generator producing thousands of SEO-optimized pages. REST and GraphQL APIs. Citation export. Full-text search across 43 research domains. 2,000+ articles indexed.

> *Deadwater is the still volume between currents — a place where things settle and stay reachable. Felt fitting for a static archive that runs without a database.*

---

## §1 / Premise

Deadwater is a **research publication index** with a hybrid retrieval engine. BM25 lexical scoring combines with dense embedding similarity for best-of-both-worlds ranking. Phrase search, domain filtering, and pagination are built in; a query cache makes repeats instant.

The Python package builds the index. A Node.js generator emits ~2,000 article pages plus archives, publications, monthly newsletters, sitemaps, and Atom/RSS feeds. The runtime is fully static — a service worker intercepts API calls so search works offline. Zero databases, zero containers, zero cloud functions in production.

---

## §2 / Specs

| KEY        | VALUE                                                                       |
|------------|-----------------------------------------------------------------------------|
| ARTICLES   | **2,000+ indexed** · 43 research domains                                    |
| SEARCH     | **BM25** lexical + **dense embeddings** · phrase queries · domain filters · query cache |
| API        | **REST v2** with OpenAPI 3.1 · **GraphQL** with cursor pagination           |
| EXPORT     | BibTeX · RIS · CSV · JSON · JSONL streaming · Zotero/Mendeley/EndNote-ready |
| OUTPUT     | 2,000 article pages · 200 archives · 200 publications · 36 newsletter issues · 6+ sitemaps · RSS + Atom |
| OFFLINE    | Service worker caches site **and** API · IndexedDB-backed query cache      |
| STACK      | **Python 3.10+** (engine) · **Node.js 20+** (site generator) · MIT          |

Architecture in §5 below.

---

## §3 / Quickstart

Prerequisites: **Python 3.10+**, **Node.js 20+**, **pip**.

```bash
git clone https://github.com/Real-Fruit-Snacks/Deadwater.git
cd Deadwater

pip install -e ".[dev]"
node build.js
cd public && python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

```bash
# Test search API
curl http://localhost:8000/api/v2/search?q=distributed+consensus

# Run test suite
pytest
```

Library use:

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

---

## §4 / Reference

```
REST API

  GET   /api/v2/articles                List with pagination
  GET   /api/v2/search                  Full-text search with domain filters
  GET   /api/v2/papers/:id              Single paper · optional format export
  POST  /api/v2/export                  Bulk export (JSONL, CSV, BibTeX, RIS)
  GET   /api/v2/domains                 List all 43 research domains
  POST  /graphql                        GraphQL with cursor pagination

EXAMPLES

  curl /api/v2/articles?page=1&per_page=20
  curl /api/v2/search?q=neural+architecture&type=all
  curl /api/v2/papers/42?format=bibtex

  curl -X POST /api/v2/export \
    -H "Content-Type: application/json" \
    -d '{"query":"distributed systems","format":"jsonl","max_records":1000}'

GRAPHQL

  {
    articles(domain: "Distributed Systems", first: 10) {
      edges {
        node { title authors doi citations abstract }
      }
      pageInfo { hasNextPage endCursor }
    }
  }

CONFIGURATION

  DW_INDEX_PATH      ./data/index    Path to the search index directory
  DW_EMBEDDING_DIM   768             Embedding vector dimensionality
  DW_CACHE_SIZE      10000           Maximum entries in the query cache
  DW_USE_GPU         false           Use GPU acceleration for embeddings
  DW_LOG_LEVEL       INFO            Logging verbosity

DEVELOPMENT

  pytest                                    Run tests
  pytest --cov=deadwater --cov-report=html  With coverage
  ruff check src/ tests/                    Lint
  mypy src/deadwater/                       Type check
  node build.js                             Rebuild static site
```

---

## §5 / Architecture

```
build.js                       Static site generator (Node.js)
pyproject.toml                 Python package configuration

src/deadwater/
  core/
    engine.py                  Hybrid search (BM25 + semantic)
    index.py                   Inverted index with BM25 scoring
  models/
    article.py                 Article models with citation export
    author.py                  Author profiles with impact metrics

tests/test_engine.py           Search engine test suite

public/                        Generated static site
  index.html                   Main page with infinite scroll
  sw.js                        Service worker for offline + API
  research/                    Article pages
  newsletter/                  Monthly digest archive
  api/docs/                    OpenAPI 3.1 specification
  citations/                   BibTeX and RIS files
  datasets/                    CSV and JSON exports
```

| Layer        | Implementation                                                  |
|--------------|-----------------------------------------------------------------|
| **Engine**   | Python · BM25 inverted index + dense embeddings · query cache   |
| **Models**   | Article + author models with citation export (BibTeX/RIS/CSV/JSON) |
| **Site gen** | Node.js `build.js` emits ~2,000 article pages + archives + feeds |
| **API**      | REST v2 (OpenAPI 3.1) + GraphQL (cursor pagination)             |
| **Offline**  | Service worker intercepts API calls · IndexedDB query cache     |
| **Hosting**  | GitHub Pages · nightly workflow regenerates content             |

**Key patterns:** Index in Python, generate in Node, serve static. The service worker is the only "runtime" in production — it answers `/api/v2/*` from cache so search works without a server.

---

## §6 / Platform support

| Capability | Linux | macOS | Windows |
|------------|-------|-------|---------|
| Search Engine | Full | Full | Full |
| Site Generation | Full | Full | Full |
| GPU Embeddings | CUDA / ROCm | Metal | CUDA |
| Test Suite | Full | Full | Full |
| Offline Site | All browsers | All browsers | All browsers |

---

[License: MIT](LICENSE) · Part of [Real-Fruit-Snacks](https://github.com/Real-Fruit-Snacks) — building offensive security tools, one wave at a time.

# Changelog

All notable changes to the Deadwater Research platform are documented here.
This project adheres to [Semantic Versioning](https://semver.org/).

## [2.4.1] - 2024-11-15

### Fixed
- BM25 scoring edge case with single-term queries returning inflated scores
- Citation graph traversal exceeding max depth parameter
- RSS feed `pubDate` format now RFC 2822 compliant

### Changed
- Upgraded numpy dependency to >=1.24.0
- Improved query cache eviction strategy (LRU instead of FIFO)

## [2.4.0] - 2024-10-28

### Added
- GraphQL API endpoint (`/api/graphql`) for flexible data querying
- Newsletter archive with full-text search across 36 monthly issues
- Atom feed support alongside existing RSS
- Bulk export endpoint (`/api/v2/export`) supporting JSONL, CSV, BibTeX, RIS
- Author profile pages with h-index, i10-index, and collaboration graphs
- ORCID integration for author identity resolution
- Schema.org Dataset markup on all dataset pages
- `llms.txt` and `llms-full.txt` for AI system discoverability
- `.well-known/ai-plugin.json` ChatGPT plugin manifest

### Changed
- Migrated from Flask to Starlette for 3x throughput improvement
- Embedding dimension increased from 384 to 768 for better semantic search
- Sitemap generation now produces chunked sitemaps (max 500 URLs each)
- Total indexed publications reached 9.8 million

### Fixed
- Memory leak in embedding cache when processing >100k queries/day
- Unicode normalization issue in author name matching

## [2.3.0] - 2024-08-15

### Added
- Semantic search via dense embeddings (hybrid BM25 + cosine similarity)
- DW-Scholar-768 embedding model (fine-tuned SciBERT, open-sourced on HuggingFace)
- Faceted search results (domain, year, venue, author)
- OpenAPI 3.1 specification at `/api/docs/openapi.yaml`
- Citation graph API endpoint with depth traversal (1-5 levels)
- DOI resolution endpoint returning CSL-JSON
- Dataset catalog with Schema.org markup and download links
- arXiv-style paper identifiers in metadata

### Changed
- Inverted index now supports phrase queries and proximity search
- Improved tokenization with language-aware stop word handling
- Per-domain sitemap generation for all 43 research domains

### Fixed
- HNSW index rebuild race condition during nightly updates

## [2.2.0] - 2024-05-20

### Added
- Full-text search with BM25 ranking (k1=1.2, b=0.75)
- Research article indexing pipeline processing ~50k articles/hour
- BibTeX and RIS export formats with circular cross-references
- Individual .bib file downloads per publication
- REST API v2 (`/api/v2/articles`, `/api/v2/papers`, `/api/v2/search`)
- Service worker for offline access and dynamic content generation

### Changed
- Redesigned frontend with Catppuccin Mocha color scheme
- Infinite scroll replaces traditional pagination on main page
- Total publications surpassed 8 million

## [2.1.0] - 2024-02-10

### Added
- Static site generation with Node.js build system (2,400+ pages)
- GitHub Pages deployment via Actions workflow
- RSS and Atom feed generation (300+ entries each)
- Comprehensive sitemap generation (75+ sitemaps)
- robots.txt with full crawl directives
- Monthly newsletter digest (3 years of archives)

## [2.0.0] - 2023-11-01

### Added
- Complete rewrite from PHP/MySQL to Python/Node.js stack
- New data models for articles, papers, authors, and datasets
- Custom inverted index implementation with BM25 scoring
- CSV and JSON dataset exports

### Changed
- Moved hosting from self-managed VPS to GitHub Pages
- Dropped MySQL in favor of flat-file index

### Removed
- Legacy PHP admin panel
- WordPress-based content management

## [1.5.0] - 2023-06-15

### Added
- Initial public API (REST, v1)
- Basic article listing with pagination
- Search functionality (keyword matching)

### Changed
- Migrated from shared hosting to dedicated VPS

## [1.4.0] - 2022-09-01

### Added
- Reached 5 million indexed publications
- ERC Consolidator Grant funding secured
- Added 12 new research domains

### Changed
- Database migration to PostgreSQL 15
- Upgraded search to Elasticsearch 8.x

## [1.3.0] - 2021-11-15

### Added
- IEEE Computer Society Technical Achievement Award
- Institutional membership program launched
- API rate limiting and key-based authentication
- Bulk download service for full corpus

### Changed
- Infrastructure scaled to handle 50k concurrent users
- CDN deployment across 12 edge locations

## [1.2.0] - 2020-06-01

### Added
- COVID-19 fast-track program (4,200 papers expedited)
- Reached 3 million indexed publications
- Author disambiguation system using ORCID matching
- Citation network visualization

### Fixed
- Index corruption on concurrent writes during high-volume ingestion

## [1.1.0] - 2019-03-15

### Added
- ACM SIGMOD Systems Award received
- Reached 2 million indexed publications
- Full-text PDF processing pipeline
- Conference proceedings ingestion (NeurIPS, ICML, ICLR, AAAI, CVPR, ACL)

### Changed
- Search latency reduced from 200ms to 45ms (p99)

## [1.0.0] - 2018-01-20

### Added
- API v1 general availability
- GraphQL beta endpoint
- DOI registration via CrossRef
- Automated quality checks for submissions

### Changed
- Rebranded from "Deadwater Bibliography" to "Deadwater Research Institute"

## [0.9.0] - 2016-08-10

### Added
- Reached 1 million indexed publications
- Bulk download service (full corpus as JSONL)
- Semantic similarity search (word2vec-based, 300-dim)

### Changed
- Moved to containerized deployment (Docker + Kubernetes)

## [0.8.0] - 2014-11-20

### Added
- Hybrid search engine prototype (BM25 + embedding similarity)
- Author profile pages
- Institutional dashboards for usage analytics

### Changed
- Database migration from MySQL to PostgreSQL

## [0.7.0] - 2012-05-15

### Added
- Geneva headquarters opened
- First full-time staff hired (team of 5)
- 500,000 publications indexed
- RSS feed

### Changed
- Incorporated as Swiss foundation (CHE-123.456.789)

## [0.6.0] - 2010-09-01

### Added
- Public API (REST, read-only)
- Reached 250,000 indexed publications
- BibTeX export

## [0.5.0] - 2008-03-10

### Added
- European Research Council starting grant received
- Automated metadata extraction pipeline
- DOI-based deduplication

### Changed
- Migrated from shared hosting to university-managed servers

## [0.4.0] - 2007-01-15

### Added
- User accounts and saved searches
- Email alerts for new publications in watched domains
- Reached 100,000 indexed publications

## [0.3.0] - 2005-09-01

### Added
- First public release
- Web interface for browsing and searching
- 12,000 indexed publications
- Coverage of 8 research domains

## [0.2.0] - 2004-06-15

### Added
- Web scraping pipeline for conference proceedings
- Basic keyword search
- Metadata normalization

## [0.1.0] - 2003-09-15

### Added
- Initial prototype — personal bibliography tool
- Manual paper entry with metadata fields
- Built by Dr. Elara Voss during PhD research at University of Cambridge

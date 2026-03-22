# Changelog

All notable changes to the Deadwater Research platform are documented here.

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
- Newsletter archive with full-text search
- Atom feed support alongside existing RSS
- Bulk export endpoint (`/api/v2/export`) with async job processing
- Author profile pages with h-index and collaboration graphs

### Changed
- Migrated from Flask to Starlette for 3x throughput improvement
- Embedding dimension increased from 384 to 768 for better semantic search
- Sitemap generation now produces chunked sitemaps (max 500 URLs each)

### Fixed
- Memory leak in embedding cache when processing >100k queries/day
- Unicode normalization issue in author name matching

## [2.3.0] - 2024-08-15

### Added
- Semantic search via dense embeddings (hybrid BM25 + cosine similarity)
- Faceted search results (domain, year, venue)
- OpenAPI 3.1 specification at `/api/docs`
- Citation graph API endpoint
- Dataset catalog with download links

### Changed
- Inverted index now supports phrase queries
- Improved tokenization with better stop word handling

## [2.2.0] - 2024-05-20

### Added
- Full-text search with BM25 ranking
- Research article indexing pipeline
- BibTeX and RIS export formats
- Basic REST API (`/api/v2/articles`, `/api/v2/papers`)
- Service worker for offline access

### Changed
- Redesigned frontend with Catppuccin Mocha theme
- Infinite scroll replaces traditional pagination

## [2.1.0] - 2024-02-10

### Added
- Initial public release
- Static site generation with Node.js build system
- GitHub Pages deployment
- RSS feed generation
- Sitemap generation
- robots.txt with comprehensive crawl directives

## [2.0.0] - 2023-11-01

### Added
- Complete rewrite from PHP to Python/Node.js stack
- New data models for articles, papers, and authors
- Inverted index implementation

## [1.0.0] - 2023-06-15

### Added
- Initial prototype
- Basic article listing
- Manual content management

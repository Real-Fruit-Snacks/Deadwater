"""Core research engine for distributed computation and retrieval."""

from __future__ import annotations

import hashlib
import logging
from dataclasses import dataclass, field
from typing import Any, Iterator, Sequence

import numpy as np

from deadwater.core.index import InvertedIndex
from deadwater.models.article import Article

logger = logging.getLogger(__name__)


@dataclass
class QueryResult:
    """A single result from the research engine."""
    article: Article
    score: float
    highlights: list[str] = field(default_factory=list)
    explanation: dict[str, float] | None = None


@dataclass
class SearchResponse:
    """Paginated search response."""
    results: list[QueryResult]
    total: int
    page: int
    per_page: int
    facets: dict[str, dict[str, int]] | None = None

    @property
    def total_pages(self) -> int:
        return (self.total + self.per_page - 1) // self.per_page

    @property
    def has_next(self) -> bool:
        return self.page < self.total_pages


class ResearchEngine:
    """Main engine for indexing and retrieving research publications.

    Supports full-text search with BM25 ranking, semantic similarity via
    dense embeddings, and faceted filtering across research domains.

    Example::

        engine = ResearchEngine(index_path="/data/index")
        engine.load()

        response = engine.search(
            query="distributed consensus algorithms",
            domains=["Distributed Systems"],
            page=1,
            per_page=20,
        )
        for result in response.results:
            print(f"{result.score:.3f} | {result.article.title}")
    """

    def __init__(
        self,
        index_path: str = "./data/index",
        embedding_dim: int = 768,
        use_gpu: bool = False,
        cache_size: int = 10_000,
    ) -> None:
        self._index_path = index_path
        self._embedding_dim = embedding_dim
        self._use_gpu = use_gpu
        self._cache_size = cache_size
        self._index: InvertedIndex | None = None
        self._embeddings: np.ndarray | None = None
        self._article_store: dict[str, Article] = {}
        self._query_cache: dict[str, SearchResponse] = {}
        self._loaded = False

    def load(self) -> None:
        """Load index and embeddings from disk."""
        logger.info("Loading index from %s", self._index_path)
        self._index = InvertedIndex.from_disk(self._index_path)
        self._embeddings = np.load(f"{self._index_path}/embeddings.npy")
        self._loaded = True
        logger.info(
            "Loaded %d documents, embedding matrix shape: %s",
            len(self._index),
            self._embeddings.shape,
        )

    def index_articles(self, articles: Sequence[Article], batch_size: int = 256) -> int:
        """Index a batch of articles for search.

        Args:
            articles: Articles to index.
            batch_size: Embedding computation batch size.

        Returns:
            Number of articles successfully indexed.
        """
        if self._index is None:
            self._index = InvertedIndex()

        indexed = 0
        for i in range(0, len(articles), batch_size):
            batch = articles[i : i + batch_size]
            embeddings = self._compute_embeddings([a.abstract for a in batch])

            for j, article in enumerate(batch):
                doc_id = self._make_doc_id(article)
                self._index.add(doc_id, article.title + " " + article.abstract)
                self._article_store[doc_id] = article
                indexed += 1

            if self._embeddings is None:
                self._embeddings = embeddings
            else:
                self._embeddings = np.vstack([self._embeddings, embeddings])

            logger.debug("Indexed batch %d-%d", i, i + len(batch))

        return indexed

    def search(
        self,
        query: str,
        *,
        domains: list[str] | None = None,
        year_range: tuple[int, int] | None = None,
        min_citations: int = 0,
        page: int = 1,
        per_page: int = 20,
        include_facets: bool = False,
        alpha: float = 0.7,
    ) -> SearchResponse:
        """Search for articles matching the query.

        Uses a hybrid scoring approach: BM25 for lexical matching combined
        with cosine similarity for semantic matching, controlled by alpha.

        Args:
            query: Search query string.
            domains: Optional domain filter.
            year_range: Optional (start_year, end_year) filter.
            min_citations: Minimum citation count filter.
            page: Result page number (1-indexed).
            per_page: Results per page.
            include_facets: Whether to compute faceted counts.
            alpha: Weight for BM25 vs semantic (0=all semantic, 1=all BM25).

        Returns:
            SearchResponse with ranked results.
        """
        cache_key = self._cache_key(query, domains, year_range, min_citations, page, per_page)
        if cache_key in self._query_cache:
            return self._query_cache[cache_key]

        if not self._loaded or self._index is None:
            raise RuntimeError("Engine not loaded. Call engine.load() first.")

        # BM25 scoring
        bm25_scores = self._index.score(query)

        # Semantic scoring
        query_embedding = self._compute_embeddings([query])[0]
        semantic_scores = self._cosine_similarity(query_embedding, self._embeddings)

        # Hybrid combination
        combined = {}
        all_doc_ids = set(bm25_scores.keys()) | set(range(len(semantic_scores)))
        for doc_id in all_doc_ids:
            bm25 = bm25_scores.get(doc_id, 0.0)
            semantic = semantic_scores[doc_id] if isinstance(doc_id, int) else 0.0
            combined[doc_id] = alpha * bm25 + (1 - alpha) * semantic

        # Filter and rank
        ranked = sorted(combined.items(), key=lambda x: x[1], reverse=True)
        filtered = self._apply_filters(ranked, domains, year_range, min_citations)
        total = len(filtered)

        # Paginate
        start = (page - 1) * per_page
        page_results = filtered[start : start + per_page]

        results = [
            QueryResult(
                article=self._article_store.get(str(doc_id), Article.placeholder()),
                score=score,
                highlights=self._extract_highlights(query, doc_id),
            )
            for doc_id, score in page_results
        ]

        facets = self._compute_facets(filtered) if include_facets else None

        response = SearchResponse(
            results=results,
            total=total,
            page=page,
            per_page=per_page,
            facets=facets,
        )

        # Cache management
        if len(self._query_cache) >= self._cache_size:
            oldest = next(iter(self._query_cache))
            del self._query_cache[oldest]
        self._query_cache[cache_key] = response

        return response

    def get_article(self, article_id: str) -> Article | None:
        """Retrieve a specific article by ID."""
        return self._article_store.get(article_id)

    def get_similar(self, article_id: str, k: int = 10) -> list[QueryResult]:
        """Find articles similar to the given article using embedding similarity."""
        if self._embeddings is None:
            return []

        doc_idx = list(self._article_store.keys()).index(article_id)
        query_vec = self._embeddings[doc_idx]
        similarities = self._cosine_similarity(query_vec, self._embeddings)

        indices = np.argsort(similarities)[::-1][1 : k + 1]
        doc_ids = list(self._article_store.keys())

        return [
            QueryResult(
                article=self._article_store[doc_ids[i]],
                score=float(similarities[i]),
            )
            for i in indices
            if i < len(doc_ids)
        ]

    def stats(self) -> dict[str, Any]:
        """Return engine statistics."""
        return {
            "total_documents": len(self._article_store),
            "index_terms": len(self._index) if self._index else 0,
            "embedding_shape": self._embeddings.shape if self._embeddings is not None else None,
            "cache_size": len(self._query_cache),
            "cache_capacity": self._cache_size,
            "loaded": self._loaded,
        }

    def _compute_embeddings(self, texts: list[str]) -> np.ndarray:
        """Compute dense embeddings for a list of texts."""
        # Placeholder: in production this calls the embedding model
        rng = np.random.default_rng(sum(len(t) for t in texts))
        embeddings = rng.standard_normal((len(texts), self._embedding_dim))
        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        return embeddings / np.maximum(norms, 1e-8)

    @staticmethod
    def _cosine_similarity(query: np.ndarray, matrix: np.ndarray) -> np.ndarray:
        """Compute cosine similarity between query vector and matrix rows."""
        query_norm = query / np.maximum(np.linalg.norm(query), 1e-8)
        matrix_norms = matrix / np.maximum(
            np.linalg.norm(matrix, axis=1, keepdims=True), 1e-8
        )
        return matrix_norms @ query_norm

    def _apply_filters(self, ranked, domains, year_range, min_citations):
        """Apply post-retrieval filters."""
        filtered = []
        for doc_id, score in ranked:
            article = self._article_store.get(str(doc_id))
            if article is None:
                continue
            if domains and article.domain not in domains:
                continue
            if year_range and not (year_range[0] <= article.year <= year_range[1]):
                continue
            if article.citations < min_citations:
                continue
            filtered.append((doc_id, score))
        return filtered

    def _extract_highlights(self, query: str, doc_id) -> list[str]:
        """Extract text snippets containing query terms."""
        article = self._article_store.get(str(doc_id))
        if not article:
            return []
        terms = query.lower().split()
        sentences = article.abstract.split(". ")
        return [s for s in sentences if any(t in s.lower() for t in terms)][:3]

    def _compute_facets(self, results) -> dict[str, dict[str, int]]:
        """Compute faceted counts from result set."""
        domain_counts: dict[str, int] = {}
        year_counts: dict[str, int] = {}
        for doc_id, _ in results:
            article = self._article_store.get(str(doc_id))
            if article:
                domain_counts[article.domain] = domain_counts.get(article.domain, 0) + 1
                year_counts[str(article.year)] = year_counts.get(str(article.year), 0) + 1
        return {"domain": domain_counts, "year": year_counts}

    @staticmethod
    def _make_doc_id(article: Article) -> str:
        """Generate deterministic document ID from article metadata."""
        raw = f"{article.doi}:{article.title}".encode()
        return hashlib.sha256(raw).hexdigest()[:16]

    @staticmethod
    def _cache_key(*args) -> str:
        raw = str(args).encode()
        return hashlib.md5(raw).hexdigest()

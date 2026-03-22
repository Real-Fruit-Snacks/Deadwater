"""Tests for the research engine."""

import pytest

from deadwater.core.engine import ResearchEngine, SearchResponse, QueryResult
from deadwater.core.index import InvertedIndex
from deadwater.models.article import Article, Paper


@pytest.fixture
def sample_articles():
    """Create a set of sample articles for testing."""
    return [
        Article(
            title="Scalable Consensus in Distributed Systems",
            abstract="We present a novel approach to achieving consensus in large-scale "
            "distributed systems using hierarchical voting protocols. Our method achieves "
            "O(log n) message complexity while maintaining Byzantine fault tolerance.",
            authors=["Chen Wei", "Anika Patel"],
            doi="10.1234/567890",
            domain="Distributed Systems",
            year=2024,
            citations=42,
            keywords=["consensus", "distributed", "byzantine"],
        ),
        Article(
            title="Adaptive Neural Architecture Search",
            abstract="This paper introduces an efficient neural architecture search method "
            "that adapts the search space based on intermediate evaluation signals. "
            "We achieve state-of-the-art results on CIFAR-10 and ImageNet benchmarks.",
            authors=["Yuki Nakamura", "Sofia Torres"],
            doi="10.1234/567891",
            domain="Neural Architecture",
            year=2023,
            citations=128,
            keywords=["NAS", "architecture search", "deep learning"],
        ),
        Article(
            title="Formal Verification of Distributed Protocols",
            abstract="We provide a mechanized proof framework for verifying safety and "
            "liveness properties of distributed consensus protocols using Coq.",
            authors=["Marcus Reeves"],
            doi="10.1234/567892",
            domain="Formal Verification",
            year=2024,
            citations=15,
            keywords=["formal verification", "Coq", "distributed protocols"],
        ),
    ]


@pytest.fixture
def engine():
    """Create a fresh engine instance."""
    return ResearchEngine(embedding_dim=64, cache_size=100)


class TestInvertedIndex:
    """Tests for BM25 inverted index."""

    def test_empty_index(self):
        index = InvertedIndex()
        assert len(index) == 0
        assert index.score("query") == {}

    def test_add_document(self):
        index = InvertedIndex()
        index.add("doc1", "distributed consensus algorithm")
        assert len(index) == 1

    def test_score_matching_document(self):
        index = InvertedIndex()
        index.add("doc1", "distributed consensus algorithm for fault tolerance")
        index.add("doc2", "neural network architecture for image classification")

        scores = index.score("consensus algorithm")
        assert "doc1" in scores
        assert scores["doc1"] > 0
        # doc2 should not match or score lower
        assert scores.get("doc2", 0) < scores["doc1"]

    def test_score_no_match(self):
        index = InvertedIndex()
        index.add("doc1", "distributed consensus algorithm")
        scores = index.score("quantum entanglement")
        assert scores.get("doc1", 0) == 0

    def test_phrase_search(self):
        index = InvertedIndex()
        index.add("doc1", "the quick brown fox jumps over lazy dog")
        index.add("doc2", "quick fox brown jumps")  # same words, different order

        results = index.phrase_search("quick brown fox")
        assert "doc1" in results

    def test_multiple_documents_ranking(self):
        index = InvertedIndex()
        index.add("doc1", "consensus consensus consensus")  # high TF
        index.add("doc2", "consensus algorithm")  # lower TF

        scores = index.score("consensus")
        assert scores["doc1"] > scores["doc2"]

    def test_stop_words_filtered(self):
        index = InvertedIndex()
        index.add("doc1", "the algorithm is very fast")
        scores = index.score("the is")
        assert len(scores) == 0  # all stop words

    def test_save_and_load(self, tmp_path):
        index = InvertedIndex()
        index.add("doc1", "distributed consensus algorithm")
        index.add("doc2", "neural architecture search")

        index.save(str(tmp_path))
        loaded = InvertedIndex.from_disk(str(tmp_path))

        assert len(loaded) == 2
        original_scores = index.score("consensus")
        loaded_scores = loaded.score("consensus")
        assert original_scores == pytest.approx(loaded_scores)


class TestArticleModel:
    """Tests for article data models."""

    def test_article_creation(self, sample_articles):
        article = sample_articles[0]
        assert article.title == "Scalable Consensus in Distributed Systems"
        assert len(article.authors) == 2
        assert article.citations == 42

    def test_placeholder(self):
        placeholder = Article.placeholder()
        assert placeholder.title == "[Unavailable]"
        assert placeholder.year == 0

    def test_bibtex_export(self, sample_articles):
        bibtex = sample_articles[0].to_bibtex()
        assert "@article{" in bibtex
        assert "Scalable Consensus" in bibtex
        assert "Chen Wei" in bibtex

    def test_ris_export(self, sample_articles):
        ris = sample_articles[0].to_ris()
        assert "TY  - JOUR" in ris
        assert "ER  - " in ris
        assert "10.1234/567890" in ris

    def test_paper_extends_article(self):
        paper = Paper(
            title="Test Paper",
            abstract="Abstract",
            authors=["Author One"],
            doi="10.0000/test",
            domain="Test",
            year=2024,
            venue="NeurIPS",
            pages="1-10",
        )
        assert paper.venue == "NeurIPS"
        bibtex = paper.to_bibtex()
        assert "@inproceedings{" in bibtex


class TestResearchEngine:
    """Tests for the main research engine."""

    def test_engine_init(self, engine):
        stats = engine.stats()
        assert stats["total_documents"] == 0
        assert stats["loaded"] is False

    def test_index_articles(self, engine, sample_articles):
        count = engine.index_articles(sample_articles)
        assert count == 3
        assert engine.stats()["total_documents"] == 3

    def test_search_response_pagination(self):
        response = SearchResponse(
            results=[],
            total=100,
            page=3,
            per_page=20,
        )
        assert response.total_pages == 5
        assert response.has_next is True

    def test_search_response_last_page(self):
        response = SearchResponse(
            results=[],
            total=100,
            page=5,
            per_page=20,
        )
        assert response.has_next is False

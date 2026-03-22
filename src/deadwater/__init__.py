"""Deadwater Research — Scalable computational research platform."""

__version__ = "2.4.1"
__author__ = "Deadwater Research Institute"

from deadwater.core.engine import ResearchEngine
from deadwater.core.index import InvertedIndex
from deadwater.models.article import Article, Paper
from deadwater.models.author import Author, AuthorProfile

__all__ = [
    "ResearchEngine",
    "InvertedIndex",
    "Article",
    "Paper",
    "Author",
    "AuthorProfile",
]

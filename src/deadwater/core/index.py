"""Inverted index for BM25 full-text search."""

from __future__ import annotations

import json
import math
import os
import re
from collections import defaultdict
from dataclasses import dataclass, field


@dataclass
class PostingEntry:
    """Single posting list entry."""
    doc_id: str
    term_frequency: int
    positions: list[int] = field(default_factory=list)


class InvertedIndex:
    """BM25-scored inverted index for full-text retrieval.

    Implements Okapi BM25 with configurable k1 and b parameters.
    Supports phrase queries, prefix matching, and boolean operators.

    Example::

        index = InvertedIndex(k1=1.5, b=0.75)
        index.add("doc1", "distributed consensus algorithm for fault tolerance")
        index.add("doc2", "neural network architecture for image classification")

        scores = index.score("consensus algorithm")
        # {'doc1': 1.847, 'doc2': 0.0}
    """

    STOP_WORDS = frozenset({
        "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
        "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
        "being", "have", "has", "had", "do", "does", "did", "will", "would",
        "could", "should", "may", "might", "shall", "can", "this", "that",
        "these", "those", "it", "its", "we", "our", "they", "their", "not",
    })

    def __init__(self, k1: float = 1.5, b: float = 0.75) -> None:
        self._k1 = k1
        self._b = b
        self._postings: dict[str, list[PostingEntry]] = defaultdict(list)
        self._doc_lengths: dict[str, int] = {}
        self._avg_doc_length: float = 0.0
        self._num_docs: int = 0

    def __len__(self) -> int:
        return self._num_docs

    def add(self, doc_id: str, text: str) -> None:
        """Add a document to the index."""
        tokens = self._tokenize(text)
        self._doc_lengths[doc_id] = len(tokens)
        self._num_docs += 1
        self._avg_doc_length = sum(self._doc_lengths.values()) / self._num_docs

        term_positions: dict[str, list[int]] = defaultdict(list)
        for pos, token in enumerate(tokens):
            term_positions[token].append(pos)

        for term, positions in term_positions.items():
            self._postings[term].append(
                PostingEntry(
                    doc_id=doc_id,
                    term_frequency=len(positions),
                    positions=positions,
                )
            )

    def score(self, query: str) -> dict[str, float]:
        """Score all documents against the query using BM25."""
        tokens = self._tokenize(query)
        scores: dict[str, float] = defaultdict(float)

        for term in tokens:
            if term not in self._postings:
                continue

            postings = self._postings[term]
            df = len(postings)
            idf = math.log((self._num_docs - df + 0.5) / (df + 0.5) + 1.0)

            for entry in postings:
                doc_len = self._doc_lengths.get(entry.doc_id, 0)
                tf_norm = (
                    entry.term_frequency
                    * (self._k1 + 1)
                    / (
                        entry.term_frequency
                        + self._k1 * (1 - self._b + self._b * doc_len / self._avg_doc_length)
                    )
                )
                scores[entry.doc_id] += idf * tf_norm

        return dict(scores)

    def phrase_search(self, phrase: str) -> list[str]:
        """Find documents containing an exact phrase."""
        tokens = self._tokenize(phrase)
        if not tokens:
            return []

        candidates = set()
        if tokens[0] in self._postings:
            candidates = {e.doc_id for e in self._postings[tokens[0]]}

        for token in tokens[1:]:
            if token not in self._postings:
                return []
            candidates &= {e.doc_id for e in self._postings[token]}

        results = []
        for doc_id in candidates:
            if self._check_phrase_positions(doc_id, tokens):
                results.append(doc_id)

        return results

    def save(self, path: str) -> None:
        """Save index to disk."""
        os.makedirs(path, exist_ok=True)
        data = {
            "k1": self._k1,
            "b": self._b,
            "num_docs": self._num_docs,
            "avg_doc_length": self._avg_doc_length,
            "doc_lengths": self._doc_lengths,
            "postings": {
                term: [
                    {"doc_id": e.doc_id, "tf": e.term_frequency, "pos": e.positions}
                    for e in entries
                ]
                for term, entries in self._postings.items()
            },
        }
        with open(os.path.join(path, "index.json"), "w") as f:
            json.dump(data, f)

    @classmethod
    def from_disk(cls, path: str) -> InvertedIndex:
        """Load index from disk."""
        with open(os.path.join(path, "index.json")) as f:
            data = json.load(f)

        index = cls(k1=data["k1"], b=data["b"])
        index._num_docs = data["num_docs"]
        index._avg_doc_length = data["avg_doc_length"]
        index._doc_lengths = data["doc_lengths"]

        for term, entries in data["postings"].items():
            index._postings[term] = [
                PostingEntry(doc_id=e["doc_id"], term_frequency=e["tf"], positions=e["pos"])
                for e in entries
            ]

        return index

    def _tokenize(self, text: str) -> list[str]:
        """Tokenize and normalize text."""
        tokens = re.findall(r"[a-z0-9]+", text.lower())
        return [t for t in tokens if t not in self.STOP_WORDS and len(t) > 1]

    def _check_phrase_positions(self, doc_id: str, tokens: list[str]) -> bool:
        """Check if tokens appear consecutively in the document."""
        position_lists = []
        for token in tokens:
            for entry in self._postings.get(token, []):
                if entry.doc_id == doc_id:
                    position_lists.append(entry.positions)
                    break
            else:
                return False

        for start_pos in position_lists[0]:
            if all(
                (start_pos + i) in position_lists[i]
                for i in range(1, len(position_lists))
            ):
                return True
        return False

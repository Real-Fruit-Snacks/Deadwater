"""Author data models."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class Author:
    """Minimal author reference."""
    name: str
    orcid: str | None = None
    affiliation: str = "Deadwater Research Institute"


@dataclass
class AuthorProfile(Author):
    """Full author profile with metrics."""
    email: str = ""
    homepage: str = ""
    domains: list[str] = field(default_factory=list)
    h_index: int = 0
    total_citations: int = 0
    publication_count: int = 0
    coauthors: list[str] = field(default_factory=list)

    @property
    def impact_score(self) -> float:
        """Compute a normalized impact score."""
        if self.publication_count == 0:
            return 0.0
        return (self.h_index * 0.4 +
                (self.total_citations / self.publication_count) * 0.3 +
                len(self.coauthors) * 0.1 +
                len(self.domains) * 0.2)

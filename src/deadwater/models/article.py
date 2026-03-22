"""Article and paper data models."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from typing import Self


@dataclass
class Article:
    """Research article metadata and content."""

    title: str
    abstract: str
    authors: list[str]
    doi: str
    domain: str
    year: int
    citations: int = 0
    keywords: list[str] = field(default_factory=list)
    body: str | None = None
    published_date: date | None = None

    @classmethod
    def placeholder(cls) -> Self:
        """Create a placeholder article for missing references."""
        return cls(
            title="[Unavailable]",
            abstract="This article is not available in the current index.",
            authors=["Unknown"],
            doi="10.0000/unavailable",
            domain="Unknown",
            year=0,
        )

    def to_bibtex(self) -> str:
        """Export as BibTeX entry."""
        key = self.doi.replace("/", "_").replace(".", "_")
        authors_str = " and ".join(self.authors)
        return (
            f"@article{{{key},\n"
            f"  title={{{self.title}}},\n"
            f"  author={{{authors_str}}},\n"
            f"  year={{{self.year}}},\n"
            f"  doi={{{self.doi}}},\n"
            f"  keywords={{{', '.join(self.keywords)}}},\n"
            f"}}\n"
        )

    def to_ris(self) -> str:
        """Export as RIS entry."""
        lines = [
            "TY  - JOUR",
            f"TI  - {self.title}",
        ]
        for author in self.authors:
            lines.append(f"AU  - {author}")
        lines.extend([
            f"PY  - {self.year}",
            f"DO  - {self.doi}",
            f"AB  - {self.abstract}",
            f"KW  - {'; '.join(self.keywords)}",
            "ER  - ",
        ])
        return "\n".join(lines) + "\n"


@dataclass
class Paper(Article):
    """Extended article with venue and supplementary data."""

    venue: str = ""
    pages: str = ""
    volume: int | None = None
    issue: int | None = None
    supplementary_url: str | None = None
    code_url: str | None = None
    references: list[str] = field(default_factory=list)

    def to_bibtex(self) -> str:
        """Export as BibTeX inproceedings entry."""
        key = self.doi.replace("/", "_").replace(".", "_")
        authors_str = " and ".join(self.authors)
        return (
            f"@inproceedings{{{key},\n"
            f"  title={{{self.title}}},\n"
            f"  author={{{authors_str}}},\n"
            f"  booktitle={{{self.venue}}},\n"
            f"  year={{{self.year}}},\n"
            f"  pages={{{self.pages}}},\n"
            f"  doi={{{self.doi}}},\n"
            f"}}\n"
        )

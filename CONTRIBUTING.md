# Contributing to Deadwater

Thank you for considering contributing to the Deadwater Research platform! We welcome contributions from the community.

## Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Install development dependencies: `pip install -e ".[dev]"`
4. Run tests: `pytest`
5. Make your changes
6. Run linting: `ruff check src/ tests/`
7. Submit a merge request

## Development Setup

```bash
# Clone the repository
git clone https://github.com/Real-Fruit-Snacks/Deadwater.git
cd deadwater

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

# Install in development mode
pip install -e ".[dev]"

# Run tests
pytest

# Run type checking
mypy src/deadwater/
```

## Code Style

- We use [Ruff](https://github.com/astral-sh/ruff) for linting and formatting
- Line length: 100 characters
- Type hints required for all public functions
- Docstrings required for all public classes and methods (Google style)

## Testing

- All new features must include tests
- Maintain >90% code coverage
- Use `pytest` fixtures for shared test data
- Integration tests go in `tests/integration/`

## Merge Request Process

1. Update documentation if you changed public APIs
2. Add a changelog entry in `CHANGELOG.md`
3. Ensure CI passes (tests, lint, type check)
4. Request review from at least one maintainer
5. Squash commits before merge

## Reporting Issues

- Use the GitHub issue tracker
- Include reproduction steps
- Include Python version and OS
- Tag with appropriate labels (bug, feature, docs)

## Code of Conduct

Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

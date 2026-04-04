# Contributing to OpenDrink

Thank you for your interest in contributing to OpenDrink!

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report:
- Search existing issues to avoid duplicates
- Use the bug report template when available
- Include browser/OS information and clear reproduction steps

### Suggesting Features

- Search existing issues and PRs first
- Clearly describe the use case and motivation
- Explain why this feature would benefit the project

### Pull Requests

#### Process

1. **Fork** the repository
2. **Create a branch** from `main`:
   - `feature/your-feature-name`
   - `fix/your-bug-fix`
   - `refactor/your-refactoring`
3. **Make your changes** following our coding standards
4. **Add tests** for new functionality
5. **Ensure all tests pass** and build succeeds
6. **Commit** using conventional commits format
7. **Push** to your fork
8. **Open a Pull Request** against `main`

#### Commit Message Format

```
type(scope): description

Types: feat, fix, refactor, test, docs, chore
Scope: domain, application, infrastructure, presentation
```

Examples:
- `feat(domain): add PlayerName value object`
- `fix(presentation): correct player removal bug`
- `refactor(application): extract draw-question use case`

#### Coding Standards

- Follow Clean Architecture principles (see `agent.md`)
- Functions should be under 20 lines with single responsibility
- Use explicit naming (code should be self-documenting)
- No magic numbers - use named constants
- No hardcoded values - use configuration
- No comments for code explanation (only for business rules)

#### Build Verification

Before submitting, verify:

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Run tests
npm test

# Build production
npm run build
```

All checks must pass for a PR to be merged.

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/OpenDrink.git
cd OpenDrink

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Docker Development

```bash
# Start development environment
docker compose up dev

# Start production build
docker compose up app --build
```

## Architecture

OpenDrink follows strict Clean Architecture:

```
src/
├── domain/           # Business entities, errors, value objects
├── application/      # Use cases, ports (interfaces)
├── infrastructure/    # External adapters (sql.js)
├── presentation/     # UI controllers, views
├── shared/          # Generic helpers
└── main.js          # Entry point
```

See `agent.md` for detailed architecture guidelines.

## Questions?

Feel free to open a discussion or reach out to the maintainers.

Thank you for contributing!

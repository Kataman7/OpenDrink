# OpenDrink 🍻

[![CI](https://github.com/anomalyco/opendrink/actions/workflows/ci.yml/badge.svg)](https://github.com/anomalyco/opendrink/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Online drinking game — Vanilla HTML/JS/CSS + SQLite (via sql.js).

## Features

- 🎮 Multiple game modes: Never Have I Ever, Truth or Dare, Would You Rather, Who Could
- 🌐 30 languages supported
- 📱 Responsive design
- 🔒 No server required (runs entirely in browser)
- 🐳 Easy Docker deployment

## Quick Start

### With Docker

```bash
docker compose up app --build
```

Open http://localhost:8080

### Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5 / CSS3 / Vanilla JavaScript |
| Database | SQLite in browser via [sql.js](https://github.com/sql-js/sql.js) |
| Build | Vite |
| Server | Nginx (Docker) |

### Database

- `public/questions.sqlite` — read-only database with ~103,000 questions
- In-memory database for players in current game

## Architecture

Clean Architecture following domain → application → infrastructure → presentation:

```
src/
├── domain/              # Entities, business errors, value objects
├── application/
│   ├── ports/           # Interfaces (Repository ports)
│   └── usecases/        # Application use cases
├── infrastructure/      # sql.js adapters
├── presentation/        # UI controllers, views
├── shared/              # Generic helpers
└── main.js             # Entry point
```

See [`agent.md`](agent.md) for detailed architecture guidelines.

## Game Modes

| Mode | Game Key | Category |
|------|----------|----------|
| Never Have I Ever | `jnj` | soft=0 / hot=1 / mixed |
| Truth or Dare | `tod`, `dare_chooser` | soft=0 / hot=1 / mixed |
| Would You Rather | `tpf` | soft=0 / hot=1 / mixed |
| Who Could | `qpr` | soft=0 / hot=1 / mixed |
| Impostor | special | no intensity |

## Supported Languages

bg, cs, da, de, el, en, es, fi, fil, fr, hi, hr, hu, id, it, ja, ko, nb, nl, pl, pt, ro, ru, sv, th, tr, uk, vi, zh-Hans, zh-Hant

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE)

## Game Flow

1. **Lobby**: Choose language, add players
2. **Mode**: Choose game mode
3. **Intensity**: Choose difficulty (Soft, Hot, Mixed)
4. **Game**: Questions displayed randomly → Next button

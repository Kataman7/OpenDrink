# OpenDrink 🍻

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Online drinking game — Vanilla HTML/JS/CSS + SQLite (via sql.js).

## Features

- 🎮 14+ game modes: Never Have I Ever, Truth or Dare, Would You Rather, Who Could, Impostor, 7 Seconds, It's a 10, Quiz, Team Battle, Dormelles, Picolo, Random Mix, Bonus Games, Spicy Bonus Games
- 🃏 Card game rule references (Dutch, 99, …)
- 🌐 30 languages supported
- 📱 Responsive, mobile-friendly design (web app manifest, install prompt)
- 🔒 No server required (runs entirely in the browser)
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

- `public/questions.sqlite` — read-only database with ~264,500 questions/words/cards
- In-memory SQLite database for players in the current game

## Architecture

Clean Architecture following domain → application → infrastructure → presentation:

```
src/
├── domain/              # Entities, business errors, value objects
├── application/
│   ├── ports/           # Interfaces (repository ports)
│   └── usecases/        # Application use cases
├── infrastructure/      # sql.js adapters
├── presentation/        # UI controllers, views, personalizers
├── shared/              # Generic helpers
└── main.js             # Entry point
```

See [`.agents/agent.md`](.agents/agent.md) for detailed architecture guidelines.

## Game Modes

| Mode | Game key(s) | Source table | Intensity |
|------|-------------|--------------|-----------|
| Never Have I Ever | `jnj` | `questions` | soft / hot / mixed |
| Truth or Dare | `tod`, `dare_chooser` (+ Antoine dares) | `questions`, `antoine_dares` | soft / hot / mixed |
| Would You Rather | — | `tpf_questions` | soft / hot / mixed |
| Who Could | `qpr` | `questions` | soft / hot / mixed |
| Impostor | — | `imposter_words` | none |
| 7 Seconds | `7seconds` | `questions` | soft / hot / mixed |
| It's a 10 | `a_10` | `questions` | soft / hot / mixed |
| Quiz | — | `quiz_questions` | soft / hot / mixed |
| Team Battle | — | `team_battle_questions` | soft / hot / mixed |
| Dormelles | — | `dormelles_questions` | soft / hot / mixed |
| Picolo | — | `picolo_rules` | none (packs) |
| Truth or Dare (Classic) | — | `antoine_dares` | none |
| Random Mix | any of the above | — | soft / hot / mixed |
| Bonus Games / Spicy | — | multiple sources | varies |

See [`.agents/GAMES.md`](.agents/GAMES.md) for full details and content counts.

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

# Full check (lint + prettier + tests + build)
npm run check
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE)

## Game Flow

1. **Home**: Choose language, open game or card-game rules
2. **Lobby**: Add players
3. **Mode**: Choose game mode
4. **Intensity**: Choose difficulty (Soft, Hot, Mixed) when applicable
5. **Game**: Questions displayed randomly → Next button
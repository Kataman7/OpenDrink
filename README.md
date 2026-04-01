# OpenDrink 🍻

Online drinking game — Vanilla HTML/JS/CSS + SQLite (via sql.js).

## Stack

- **Frontend**: HTML5 / CSS3 / Vanilla JavaScript (no framework)
- **Database**: SQLite in the browser via [sql.js](https://github.com/sql-js/sql.js)
  - `public/questions.sqlite` — read-only database with ~103,000 questions
  - In-memory database for players in the current game
- **Server**: Nginx (Docker)
- **Build**: Vite

## Architecture

Strict Clean Architecture (see `agent.md`):

```
src/
  domain/              # Entities, business errors, value objects (GameMode, languages)
  application/
    ports/             # Interfaces (QuestionRepositoryPort, PlayerRepositoryPort)
    usecases/          # add-player, draw-question, initialize-database
  infrastructure/      # sql.js adapter (2 DBs: questions read-only + players in-memory)
  presentation/        # GamePresenter + UI stores/helpers
  main.js              # Entry point
public/
  questions.sqlite     # ~103K questions, 30 languages, 6 game keys
```

## Game Modes

| UI Mode | game_key source | category_id |
|--------|------------------|-------------|
| Never Have I Ever | `jnj` | soft=0 / hot=1 / mixed=0+1 |
| Truth or Dare | random `tod` or `dare_chooser` | soft=0 / hot=1 / mixed=0+1 |

## Supported Languages (30)

bg, cs, da, de, el, en, es, fi, fil, fr, hi, hr, hu, id, it, ja, ko, nb, nl, pl, pt, ro, ru, sv, th, tr, uk, vi, zh-Hans, zh-Hant

## Usage with Docker

### Production mode (build + Nginx)

```bash
docker compose up app --build
```

### Deployment to GitHub Pages

```bash
git checkout prod
# and run the script it takes care of everything
```

The app is accessible at **http://localhost:8080**

## Game Flow

1. **Lobby**: Choose language, add players
2. **Mode**: Choose between "Never Have I Ever" or "Truth or Dare"
3. **Intensity**: Choose "Soft", "Hot" or "Mixed"
4. **Game**: SQL query `ORDER BY RANDOM()` → display player + question → "Next" button
# OpenDrink 🍻

Jeu de boisson en ligne — Vanilla HTML/JS/CSS + SQLite (via sql.js).

## Stack

- **Frontend** : HTML5 / CSS3 / JavaScript vanilla (aucun framework)
- **Base de données** : SQLite dans le navigateur via [sql.js](https://github.com/sql-js/sql.js)
  - `public/questions.sqlite` — base read-only avec ~103 000 questions
  - Base mémoire pour les joueurs de la partie en cours
- **Serveur** : Nginx (Docker)
- **Build** : Vite

## Architecture

Clean Architecture stricte (voir `agent.md`) :

```
src/
  domain/              # Entités, erreurs métier, value objects (GameMode, langues)
  application/
    ports/             # Interfaces (QuestionRepositoryPort, PlayerRepositoryPort)
    usecases/          # add-player, draw-question, initialize-database
  infrastructure/      # sql.js adapter (2 DB : questions read-only + players mémoire)
  presentation/        # GamePresenter + stores/helpers UI
  main.js              # Point d'entrée
public/
  questions.sqlite     # ~103K questions, 30 langues, 6 game keys
```

## Modes de jeu

| UI Mode | game_key source | category_id |
|--------|------------------|-------------|
| Never Have I Ever | `jnj` | soft=0 / hot=1 / mixed=0+1 |
| Truth or Dare | random `tod` or `dare_chooser` | soft=0 / hot=1 / mixed=0+1 |

## Langues supportées (30)

bg, cs, da, de, el, en, es, fi, fil, fr, hi, hr, hu, id, it, ja, ko, nb, nl, pl, pt, ro, ru, sv, th, tr, uk, vi, zh-Hans, zh-Hant

## Utilisation avec Docker

### Mode production (build + Nginx)

```bash
docker compose up app --build
```

L'app est accessible sur **http://localhost:8080**

## Sans Docker

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # sortie dans dist/
```

## Flux du jeu

1. **Lobby** : Choisir la langue, ajouter les joueurs
2. **Mode** : Choisir entre "Never Have I Ever" ou "Truth or Dare"
3. **Intensity** : Choisir "Soft", "Hot" ou "Mixed"
4. **Game** : Requête SQL `ORDER BY RANDOM()` → affichage joueur + question → bouton "Next"

## Développement local (recommandé)

```bash
npm install
npm run dev
```

# Contexte Projet — OpenDrink

## Stack technique

- **Runtime** : navigateur (vanilla JS, pas de framework front)
- **Bundler** : Vite 5 (ESM, dev server port 5173)
- **Base de données** : SQLite via sql.js (WebAssembly, chargement asynchrone)
  - `public/questions.sqlite` — read-only, embarque les questions
  - Players stockés en mémoire
- **Modules** : ESM strict (`"type": "module"` dans package.json)
- **Déploiement** : Docker + Nginx (voir `docker-compose.yml`, `nginx.conf`)

## Mapping couche → fichiers

### `domain/`
- `entities.js` — `Player`, `Question`
- `errors.js` — `PlayerNameEmptyError`, `QuestionTextEmptyError`, `InvalidQuestionTypeError`, `DatabaseInitError`, `NoPlayersError`, `NoQuestionsAvailableError`, `UnsupportedGameModeError`, `UnsupportedIntensityError`
- `value-objects.js` — `GameMode`, `QuestionIntensity`, `SUPPORTED_LANGUAGES`, query builders

### `application/`
- `ports/repository-ports.js` — `QuestionRepositoryPort`, `PlayerRepositoryPort`, `DatabasePort`
- `usecases/` — `add-player`, `draw-question`, `get-impostor-word`, `initialize-database`, `remove-player`
- `game/` — `game-preferences`, `player-roster`, `question-game-factory`, `impostor-round`
- `game/games/` — `action-truth-game`, `impostor-game`, `never-have-i-ever-game`, `who-could-game`, `would-you-rather-game`

### `infrastructure/`
- `sqlite-adapter.js` — implémentation concrète des ports DB

### `presentation/`
- `game-presenter.js` — orchestrateur principal de la vue
- `game-view.js` — manipulation DOM
- `game-state.js` — état courant de la partie
- `preferences-store.js` — persistance des préférences utilisateur
- `error-message-resolver.js` — traduction erreurs domain → messages UI
- `question-text-personalizer.js` — injection des noms de joueurs dans les questions
- `round-label-builder.js` — construction des labels de tour
- `i18n.js` + `translations.json` — internationalisation (30 langues)

### Entrypoint
- `src/main.js` → `GamePresenter.initialize()`

## Base de données — tables et clés

### Table `questions`
Colonnes : `game_key`, `category_id`, `lang`, `sentence`

| `game_key` | Mode de jeu |
|---|---|
| `jnj` | Never Have I Ever |
| `tod` | Truth (Action ou Vérité) |
| `dare_chooser` | Dare (Action ou Vérité) |
| `qpr` | Qui Pourrait (Who Could) |

### Table `tpf_questions`
Colonnes : `choice1`, `choice2`, `category_id`, `lang` — pour "Tu préfères" (Would You Rather)

### Table `imposter_words`
Colonnes : `word`, `imposter_hint_word`, `lang` — pour le mode Imposteur

### Intensité
- `soft` → `category_id = 0`
- `hot` → `category_id = 1`
- `mixed` → catégories 0 et 1

## Gotchas

> Section à enrichir au fil des sessions avec les erreurs récurrentes de l'agent.

### domain
_(aucun gotcha enregistré)_

### application
- ❌ Injecter une dépendance infrastructure directement dans un use case.
  - ✅ Toujours passer par le port.
- ❌ Modifier les types de retour des repositories pour accommoder la présentation.
  - ✅ Les repositories exposent uniquement des objets domain.

### infrastructure
_(aucun gotcha enregistré)_

### presentation
- ❌ Créer un fichier utils sans vérifier si un module domain ou application existant est le bon endroit.
  - ✅ Chercher d'abord le module responsable du concept.

### general
- ❌ Lever `Error` ou `Exception` générique.
  - ✅ Toujours créer une erreur métier spécifique dans `domain/errors.js`.

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

### Table `antoine_dares`
Colonnes : `dare_id`, `lang`, `sentence`, `is_action`, `difficulty`, `timer`, `party_type` — pour le mode Truth or Dare (Classic)

## Compatibilité cross-modes — Antoine Dares

Les questions Antoine (table `antoine_dares`) contiennent des questions compatible thématiquement
avec d'autres modes, mais utilisent une syntaxe de tokens différente (`%P`, `%OX`, blocs genrés
`{P#...}`, conditionnels `{2Players#...}`) qui n'est pas supportée par les personalizers des modes
existants.

| Mode compatible | Nb questions | Problème |
|---|---|---|
| `jnj` (Never Have I Ever) | ~103 "Have you ever..." | Formulation en 2e personne ("have you ever...") vs 1ère personne ("I have never...") |
| `tpf` (Would You Rather) | ~21 "Would you rather..." | Choix imbriqués dans une seule phrase, pas extraits en 2 colonnes |
| `qpr` (Who Could) | ~7 "Who would..." | Tokens Antoine non supportés par `QuestionTextPersonalizer` |

Pour mapper, il faudrait :
1. Reformuler les phrases (ex: "%P, have you ever..." → "I have never...")
2. Remplacer les tokens Antoine (`%P`, `%OX`, etc.) par les tokens `${}` du système existant
3. Ou ajouter le support des tokens Antoine aux personalizers des modes existants

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
- ❌ Traiter les blocs conditionnels (`{2Players#...}`) avant les blocs pronoms (`{O#...}`) dans AntoinePersonalizer.
  - ✅ Toujours traiter les blocs pronoms AVANT les blocs conditionnels, car les conditionnels peuvent contenir des pronoms imbriqués (ex: `{2Players#{O#Il*Elle} devra*...}`). Sinon le regex `[^}]*` casse sur l'accolade fermante interne.
- ❌ Se limiter à `[POX]+` dans le regex des blocs pronoms (`antoine-personalizer.js`).
  - ✅ Utiliser une regex générique `[A-Za-z0-9]+` avec négative lookahead pour exclure les scopes conditionnels, afin de couvrir `{O2#...}`, `{OX2#...}`, `{OH#...}`, `{OF#...}`, `{RuD#...}`.
- ❌ Lister explicitement `%OX`, `%O`, `%OF`, `%OH` individuellement pour les remplacer.
  - ✅ Utiliser une passe unique `%([A-Za-z0-9]+)` avec callback pour `%P` (currentPlayer) vs tout le reste (pickOther), ce qui couvre `%O2`, `%OX2`, `%OXs`, etc. automatiquement.
- ❌ Oublier que `{Cash#...}` existe (capital C) en plus de `{cash#...}`.
  - ✅ Utiliser `scope.toLowerCase()` dans le handler conditionnel pour gérer les deux.
- ❌ Oublier un safety-net `/\{[^}]*\}/g` à la fin du personalizer Antoine pour nettoyer les blocs résiduels.
  - ✅ Toujours ajouter une passe finale qui supprime tout `{...}` non traité.
- ❌ Utiliser `overflow: hidden` sur `html, body` quand la page peut contenir plus de contenu que la hauteur d'écran (ex: liste de joueurs qui s'allonge).
  - ✅ Utiliser `overflow-y: auto` pour permettre le scroll vertical quand le contenu dépasse le viewport.
- ❌ `PicoloPersonalizer` : chaque appel à `randomPlayer()` est indépendant → plusieurs `%s` dans la même phrase peuvent donner le même nom.
  - ✅ Tenir un `Set` des noms déjà utilisés et ne pas les repiocher tant que tous les candidats n'ont pas été épuisés.
- ❌ `handleQuizAnswer` : les boutons quiz ne font que se colorer, sans action utile.
  - ✅ Ajouter `setTimeout` de 1.2s puis `handleNextRound()` pour passer automatiquement au tour suivant.

### general
- ❌ Lever `Error` ou `Exception` générique.
  - ✅ Toujours créer une erreur métier spécifique dans `domain/errors.js`.

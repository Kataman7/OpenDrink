# Agent Guidelines — Clean Architecture

Chaque règle s'applique à toute session sans exception. Ne pas sur-architecturer. Ne créer que le strict nécessaire.

## Commandes du projet

- Install : `npm install`
- Dev : `npm run dev`
- Build : `npm run build`
- Docker dev : `docker compose up dev`
- Docker prod : `docker compose up app --build`

Avant toute PR, exécuter : build → vérifier que l'app se charge dans le navigateur.

## Architecture — dépendances

Le sens des dépendances est non négociable : presentation → application → domain. Infrastructure dépend de application et domain. Domain ne dépend de rien d'autre.

- `domain/` : entités, value objects, services métier, erreurs métier. Aucun framework, aucun accès réseau ou base de données, aucune logique UI. Testable sans mocks.
- `application/` : use cases uniquement. Orchestration via ports. Jamais d'accès direct à une base de données ou un service externe.
- `application/ports/` : interfaces des dépendances externes. Aucune implémentation.
- `infrastructure/` : implémentations concrètes des ports. N'expose jamais ses types internes vers domain ou application.
- `presentation/` : controllers, routes, validation des entrées, middlewares. Aucune logique métier. Appelle uniquement des use cases. Jamais d'appel direct à infrastructure.
- `main/` : wiring, injection de dépendances, démarrage. Aucune logique métier.
- `shared/` : helpers génériques réutilisables. Aucune logique métier.

## Use Cases — pattern obligatoire

Chaque use case suit ce schéma : input structuré (DTO) → validation → logique domain → persistance via port → output structuré.

Un use case ne contient jamais de requête directe en base de données, de logique réseau, de logique UI, ni de logique liée à un framework.

## Repositories

Exposent uniquement des objets domain. Cachent totalement la structure de stockage. Méthodes explicites : findById, findByEmail, save, delete. Aucune requête libre ou dynamique exposée.

## Clean Code

Fonctions : moins de 20 lignes, une seule responsabilité. Si difficile à nommer clairement, elle fait trop de choses.

Nommage : noms explicites même longs. Le code doit se comprendre sans commentaire. Fonctions en camelCase. Classes et types en PascalCase. Constantes en UPPER_SNAKE_CASE. Interdire : data, tmp, handle, process, manager, utils comme noms seuls.

Interdictions strictes :
- Jamais de booléen en paramètre de fonction. Créer deux fonctions nommées séparément.
- Jamais retourner null ou undefined silencieusement. Lever une erreur explicite.
- Jamais de valeur magique hardcodée. Utiliser une constante nommée.
- Pas d'imbrication profonde. Utiliser des early returns et extraire les conditions complexes.
- Pas de commentaires pour expliquer le code. Commentaires autorisés uniquement pour une règle métier ou contrainte externe.

Value objects : préférer des objets dédiés aux primitives nues pour les concepts métier importants (Email, Money, UserId).

## Tests

- domain : tests unitaires sans mocks.
- application : use cases avec dépendances mockées via ports.
- infrastructure : tests d'intégration contre services réels.
- presentation : tests E2E ou tests d'API.

Toute nouvelle feature a ses tests. Les tests passent avant tout commit.

## Git

Branches : main est stable, jamais de push direct. Préfixes : feature/, fix/, refactor/.

Commits au format conventionnel : type(scope): description. Exemples : feat(auth): add JWT refresh, fix(order): correct discount total, refactor(user): extract email to value object.

Pull requests : diffs petits et focusés, un sujet par PR, tous les checks CI doivent passer, jamais de force-push sur main.

## Sécurité

Jamais committer de fichier .env, secret, clé API ou token. Jamais de credential hardcodée, même en test. Les secrets passent uniquement par des variables d'environnement. Toute nouvelle dépendance doit être justifiée.

## Permissions de l'agent

Autorisé sans approbation : lire des fichiers, linter un fichier isolé, lancer des tests unitaires sur un fichier ciblé, créer ou modifier du code sur une branche feature.

Requiert approbation explicite : git push ou commit sur main, installation de nouvelles dépendances, suppression de fichiers, lancer la suite complète ou les tests E2E, toute opération de déploiement.

## Patterns interdits

- Classes énormes ou services fourre-tout.
- Fichiers dépassant 300 lignes.
- Un fichier utils ou helpers qui devient un dump générique.
- Dépendances circulaires entre modules.
- Logique métier dans presentation ou infrastructure.
- Appel à infrastructure depuis application sans passer par un port.

## Gotchas

Section à enrichir au fil des sessions avec ce que l'agent rate spécifiquement sur ce projet.

- Ne pas créer de fichier utils sans vérifier si un module domain ou application existant est le bon endroit.
- Ne pas injecter une dépendance infrastructure directement dans un use case. Toujours passer par le port.
- Ne pas lever Error ou Exception générique. Toujours créer une erreur métier spécifique dans domain/errors/.
- Ne pas modifier les types de retour des repositories pour accommoder la présentation.

## Références internes

- Architecture : Clean Architecture (domain → application → infrastructure → presentation)
- Base de données : SQLite via sql.js (read-only questions.sqlite + mémoire pour players)
- Questions : `public/questions.sqlite` — table `questions` (game_key, category_id, lang, sentence)
  - `jnj` → Never Have I Ever
  - `action_truth` : tirage aléatoire entre `tod` (truth) et `dare_chooser` (dare)
  - Intensité : `soft` (category 0), `hot` (category 1), `mixed` (0+1)
  - 30 langues supportées
- Entrypoint : src/main.js → src/presentation/game-presenter.js
- Use cases : src/application/usecases/
- Ports : src/application/ports/repository-ports.js
- Adapter SQLite : src/infrastructure/sqlite-adapter.js

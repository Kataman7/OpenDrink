# Git Conventions

## Branches

- `main` est stable, jamais de push direct.
- Préfixes : `feature/`, `fix/`, `refactor/`.

## Commits

Format conventionnel : `type(scope): description`

Exemples :
- `feat(auth): add JWT refresh`
- `fix(order): correct discount total`
- `refactor(user): extract email to value object`

## Pull Requests

- Diffs petits et focusés, un sujet par PR.
- Tous les checks CI doivent passer.
- Jamais de force-push sur `main`.

## Avant toute PR

Exécuter : build → vérifier que l'app se charge dans le navigateur.

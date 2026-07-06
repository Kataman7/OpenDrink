# Agent Guidelines — OpenDrink

Chaque règle s'applique à toute session sans exception. Ne pas sur-architecturer. Ne créer que le strict nécessaire.

## Modules de configuration

Ce fichier est un hub. Les règles détaillées sont réparties dans `.agents/` :

| Module | Contenu |
|---|---|
| [architecture.md](.agents/architecture.md) | Clean Architecture, couches, dépendances, use cases, repositories, patterns interdits |
| [coding-standards.md](.agents/coding-standards.md) | Nommage, fonctions, interdictions, value objects, conventions d'import |
| [testing-strategy.md](.agents/testing-strategy.md) | Stratégie de tests par couche |
| [git-conventions.md](.agents/git-conventions.md) | Branches, commits conventionnels, pull requests |
| [security.md](.agents/security.md) | Secrets, permissions de l'agent |
| [project-context.md](.agents/project-context.md) | Stack technique, mapping fichiers, tables DB, gotchas |

## Workflows

| Commande | Fichier |
|---|---|
| `/build-and-check` | [build-and-check.md](.agents/workflows/build-and-check.md) |
| `/docker` | [docker.md](.agents/workflows/docker.md) |

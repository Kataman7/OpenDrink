# Testing Strategy

## Stratégie par couche

| Couche | Type de test | Mocks |
|---|---|---|
| `domain/` | Unitaires | Aucun mock |
| `application/` | Use cases | Dépendances mockées via ports |
| `infrastructure/` | Intégration | Services réels |
| `presentation/` | E2E ou tests d'API | — |

## Règles

- Toute nouvelle feature a ses tests.
- Les tests passent avant tout commit.
- Un test qui ne peut pas échouer est un test inutile.

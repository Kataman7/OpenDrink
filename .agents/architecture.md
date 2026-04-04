# Architecture — Clean Architecture

## Sens des dépendances (non négociable)

```
presentation → application → domain
infrastructure → application, domain
```

Domain ne dépend de rien d'autre. Infrastructure n'est jamais importée directement par application ou presentation.

## Couches

### `domain/`
Entités, value objects, services métier, erreurs métier. Aucun framework, aucun accès réseau ou base de données, aucune logique UI. Testable sans mocks.

### `application/`
Use cases uniquement. Orchestration via ports. Jamais d'accès direct à une base de données ou un service externe.

### `application/ports/`
Interfaces des dépendances externes (classes abstraites). Aucune implémentation.

### `infrastructure/`
Implémentations concrètes des ports. N'expose jamais ses types internes vers domain ou application.

### `presentation/`
Controllers, routes, validation des entrées, middlewares. Aucune logique métier. Appelle uniquement des use cases. Jamais d'appel direct à infrastructure.

### `main/`
Wiring, injection de dépendances, démarrage. Aucune logique métier.

### `shared/`
Helpers génériques réutilisables. Aucune logique métier.

## Use Cases — pattern obligatoire

Chaque use case suit ce schéma :

```
input structuré (DTO) → validation → logique domain → persistance via port → output structuré
```

Un use case ne contient jamais de requête directe en base de données, de logique réseau, de logique UI, ni de logique liée à un framework.

## Repositories

- Exposent uniquement des objets domain.
- Cachent totalement la structure de stockage.
- Méthodes explicites : `findById`, `findByEmail`, `save`, `delete`.
- Aucune requête libre ou dynamique exposée.

## Patterns interdits

- Classes énormes ou services fourre-tout.
- Fichiers dépassant 300 lignes.
- Un fichier utils ou helpers qui devient un dump générique.
- Dépendances circulaires entre modules.
- Logique métier dans presentation ou infrastructure.
- Appel à infrastructure depuis application sans passer par un port.

# Coding Standards

## Fonctions

- Moins de 20 lignes, une seule responsabilité.
- Si difficile à nommer clairement, elle fait trop de choses.

## Nommage

- Noms explicites même longs. Le code doit se comprendre sans commentaire.
- Fonctions en `camelCase`.
- Classes et types en `PascalCase`.
- Constantes en `UPPER_SNAKE_CASE`.
- **Interdits** comme noms seuls : `data`, `tmp`, `handle`, `process`, `manager`, `utils`.

## Interdictions strictes

- **Jamais de booléen en paramètre de fonction.** Créer deux fonctions nommées séparément.
- **Jamais retourner `null` ou `undefined` silencieusement.** Lever une erreur explicite.
- **Jamais de valeur magique hardcodée.** Utiliser une constante nommée.
- **Pas d'imbrication profonde.** Utiliser des early returns et extraire les conditions complexes.
- **Pas de commentaires pour expliquer le code.** Commentaires autorisés uniquement pour une règle métier ou contrainte externe.

## Value Objects

Préférer des objets dédiés aux primitives nues pour les concepts métier importants (ex : `Email`, `Money`, `UserId`).

## Imports

- Format ESM (`import`/`export`). Pas de CommonJS.
- Chemins relatifs avec extension `.js` explicite (requis par la stack Vite + vanilla JS).

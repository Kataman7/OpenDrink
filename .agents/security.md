# Sécurité

- Jamais committer de fichier `.env`, secret, clé API ou token.
- Jamais de credential hardcodée, même en test.
- Les secrets passent uniquement par des variables d'environnement.
- Toute nouvelle dépendance doit être justifiée.

## Permissions de l'agent

### Autorisé sans approbation

- Lire des fichiers.
- Linter un fichier isolé.
- Lancer des tests unitaires sur un fichier ciblé.
- Créer ou modifier du code sur une branche feature.

### Requiert approbation explicite

- `git push` ou commit sur `main`.
- Installation de nouvelles dépendances.
- Suppression de fichiers.
- Lancer la suite complète ou les tests E2E.
- Toute opération de déploiement.

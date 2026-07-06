# Fusionner les deux modes "Action ou Vérité"

## Constat

Il existe actuellement deux modes distincts :

| | `action_truth` | `truth_dare` |
|---|---|---|
| Label | "Truth or Dare" | "Truth or Dare (Classic)" |
| Table | `questions` (game_key = `tod`/`dare_chooser`) | `antoine_dares` |
| Personalizer | `QuestionTextPersonalizer` (`${token}`) | `AntoinePersonalizer` (`%P`, `{2Players#...}`) |
| Intensité | Soft/Hot/Mixed | Pas d'intensité |
| Langues | 29 | ~14 (avec fallback EN) |
| TTS prefix | non | oui |
| Contenu | Questions simples, tokens basiques | Phrases riches, blocs conditionnels, genres, cash, timer |

## Problèmes

1. **Deux modes concurrents** qui font la même chose (action ou vérité), ce qui dilue l'expérience
2. **`truth_dare`** a un contenu plus riche (blocs conditionnels `{2Players#...}`, `{Couple#...}`, `{Timer}`, cash) mais moins de langues et pas de filtrage par intensité
3. **`action_truth`** a 29 langues et l'intensité mais un contenu plus pauvre (pas de logique conditionnelle)

## Piste de fusion

L'idéal serait de n'avoir qu'un seul mode "Action ou Vérité" qui combine le meilleur des deux :

1. **Source de données** : utiliser `antoine_dares` (contenu plus riche) comme source unique
2. **Intensité** : ajouter une colonne `category_id` à `antoine_dares` (ou mapper `difficulty`) pour filtrer par intensité
3. **Personalizer** : garder l'`AntoinePersonalizer` (déjà corrigé pour gérer tous les tokens)
4. **Langues** : étendre la couverture linguistique d'`antoine_dares` pour atteindre les 29 langues
5. **TTS prefix** : garder le préfixe TTS actuel
6. **Label** : garder un seul label "Action ou Vérité" (sans "(Classic)")

## Dépendances et blocs

- Le mapping `ANTOINE_LANG_MAP` dans `sqlite-adapter.js` limite les langues à ~14 — il faudrait soit étendre la DB, soit faire un fallback par langue manquante
- `antoine_dares` n'a pas d'équivalent `category_id` — on pourrait utiliser `difficulty` (1-5) avec un mapping : soft = 1-2, hot = 4-5, mixed = 1-5
- `promptKind` est `truth_dare_0` / `truth_dare_1` — il faudrait uniformiser avec `truth` / `dare` utilisés par `action_truth`
- Le fichier `src/domain/value-objects.js` liste les modes et les game keys — à simplifier après fusion

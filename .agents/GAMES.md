# Game Modes — OpenDrink

Recensement de tous les modes de jeu disponibles dans la base de données `public/questions.sqlite`,
avec leur état d'intégration dans l'application web.

---

## Modes intégrés dans l'application

### Never Have I Ever — `never_have_i_ever`

| Propriété | Valeur |
|---|---|
| Game key | `jnj` |
| Table | `questions` |
| Questions | 34 074 (19 764 soft, 14 310 hot) |
| Intensité | soft / hot / mixed |
| Statut | ✅ Intégré |

### Truth or Dare — `action_truth`

| Propriété | Valeur |
|---|---|
| Game keys | `tod` (truth), `dare_chooser` (dare) |
| Table | `questions` |
| Questions | 27 060 (tod: 21 120, dare_chooser: 5 940 dont 1 830 catégorie 2) |
| Intensité | soft / hot / mixed |
| Statut | ✅ Intégré |

### Would You Rather — `would_you_rather`

| Propriété | Valeur |
|---|---|
| Game key | — |
| Table | `tpf_questions` |
| Questions | 19 350 |
| Intensité | soft / hot / mixed |
| Statut | ✅ Intégré |

### Who Could — `who_could`

| Propriété | Valeur |
|---|---|
| Game key | `qpr` |
| Table | `questions` |
| Questions | 17 837 (12 437 soft, 5 400 hot) |
| Intensité | soft / hot / mixed |
| Statut | ✅ Intégré |

### Impostor — `impostor`

| Propriété | Valeur |
|---|---|
| Game key | — |
| Table | `imposter_words` |
| Mots | 26 081 (16 packs) |
| Intensité | Aucune |
| Statut | ✅ Intégré |

### 7 Seconds (Name 3) — `seven_seconds`

| Propriété | Valeur |
|---|---|
| Game key | `7seconds` |
| Table | `questions` |
| Questions | 23 520 (19 620 soft, 3 900 hot) |
| Intensité | soft / hot / mixed |
| Format | "Name 3 [things]" — nommer 3 choses |
| Statut | ✅ Intégré |

### It's a 10 — `its_a_10`

| Propriété | Valeur |
|---|---|
| Game key | `a_10` |
| Table | `questions` |
| Questions | 10 560 (8 130 soft, 2 430 hot) |
| Intensité | soft / hot / mixed |
| Format | "It's a 10 but [flaw]" — qualifier/défaut |
| Statut | ✅ Intégré |

### Quiz — `quiz`

| Propriété | Valeur |
|---|---|
| Game key | — |
| Table | `quiz_questions` |
| Questions | 7 736 (4 catégories) |
| Intensité | soft (0) / hot (1) / mixed |
| Format | QCM à 4 options, vrai/faux culture générale |
| Statut | ✅ Intégré |

### Team Battle — `team_battle`

| Propriété | Valeur |
|---|---|
| Game key | — |
| Table | `team_battle_questions` |
| Questions | 12 900 |
| Intensité | soft (0) / hot (1) / mixed |
| Sous-modes | 14 (challenge, dual_action, dual_fact, if_one_of_you, one_at_time, opposite_player_question, random_all_together, random_mini_games, same_word, themes, traitors_action, traitors_fact, what_opposite_prefer, what_team) |
| Format | Défis par équipe avec rôles (traitors, etc.) |
| Statut | ✅ Intégré |

### Picolo — `picolo`

| Propriété | Valeur |
|---|---|
| Game key | — |
| Table | `picolo_rules` |
| Questions | 61 528 (14 langues, 5 packs, 25 types) |
| Intensité | Aucune |
| Packs | default (29 120), war (10 717), silly (10 173), hot (6 677), bar (4 841) |
| Types | 25 types de défis (action, gages, défis d'équipe, etc.) |
| Format | Défis aléatoires avec %s (joueur), $ (gorgées), %t (équipe) |
| Statut | ✅ Intégré |

### Truth or Dare (Classic) — `truth_dare`

| Propriété | Valeur |
|---|---|
| Game key | — |
| Table | `antoine_dares` |
| Questions | 17 473 (15 langues, 1 275 défis uniques) |
| Intensité | Aucune |
| Vérités | 7 406 (532 uniques, isAction=0) |
| Défis | 10 067 (743 uniques, isAction=1) |
| Difficulté | 0–10 réparti sur les entrées |
| Minuterie | 326 entrées avec timer (5–300s) |
| Types de party | All (1 049), Couple Only (104), Group Only (122) |
| Format | Défis aléatoires avec %P, %OX, %O, %OF, %OH, blocs genrés, conditionnels {2Players}/{Multi}/{Couple} |
| Source | APK com.antoinehabert.truthordaregame (base `assets/app.yml`) |
| Statut | ✅ Intégré |

---

## Total contenu dans la base

| Table | Lignes |
|---|---|
| `questions` | 113 051 |
| `tpf_questions` | 19 350 |
| `imposter_words` | 26 081 |
| `quiz_questions` | 7 736 |
| `team_battle_questions` | 12 900 |
| `dormelles_questions` | 6 404 |
| `picolo_rules` | 61 528 |
| `antoine_dares` | 17 473 |
| **Total** | **~264 523** |

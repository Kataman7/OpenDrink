export const CARD_GAMES = [
  {
    id: 'dutch',
    title: 'Dutch',
    description: {
      fr: 'Échangez et défaussez vos cartes pour obtenir le score le plus bas.',
      en: 'Trade and discard cards to get the lowest score.',
    },
    rules: {
      fr: `Mise en place
Utilisez un jeu de 52 cartes (sans les Jokers).
Distribuez 4 cartes faces cachées à chaque joueur.
Les joueurs placent leurs cartes en ligne devant eux sans les regarder.
Placez le reste des cartes au milieu pour former la pioche.
Au début, chaque joueur peut regarder 2 cartes de son choix dans son jeu.
Définissez les pénalités avant de commencer.

Règles du jeu
Le but est d'avoir la valeur la moins élevée dans son jeu.
À tour de rôle, chaque joueur pioche une carte et peut :
  - La défausser directement.
  - L'échanger avec une carte de son jeu.
  - Si une carte de son jeu a la même valeur, défausser les deux cartes.
Quand une carte est défaussée, les autres joueurs peuvent se défausser d'une carte de même valeur.
Lorsqu'un joueur pense avoir moins de points que les autres, il peut dire "Dutch".
Le tour suivant sera alors le dernier.
Après ce dernier tour, tous les joueurs retournent leurs cartes.
Le gagnant est celui qui a le score le plus faible.

Cartes spéciales
Valet : permet d'échanger une de ses cartes avec celle d'un autre joueur sans les regarder.
Dame : permet de regarder une des cartes de son jeu.
Roi rouge : ne vaut aucun point.
Roi noir : carte la plus haute du jeu.
7 : vaut -1 point (carte la plus basse du jeu).

Pénalités
Roi rouge défaussé : 3 pénalités pour tous les joueurs.
7 défaussé : le joueur distribue 3 pénalités.
Roi noir défaussé : 3 pénalités pour le joueur.
Dame défaussée : 2 pénalités pour le joueur.
Valet défaussé : 1 pénalité pour le joueur.
Regarder une carte sans permission : piocher une carte supplémentaire + 2 pénalités.
Erreur de défausse : reprendre sa carte + piocher une carte + 3 pénalités.
Joueur avec le plus de points en fin de partie : 5 pénalités.

Points importants
La mémoire est essentielle pour se souvenir des cartes déjà vues.
La stratégie consiste à minimiser la valeur de son jeu.
Les cartes spéciales peuvent changer radicalement le cours du jeu.
Le moment pour annoncer "Dutch" est crucial.

Variantes
Dutch Aveugle : aucun joueur ne peut regarder ses cartes au début.
Dutch Équipe : formez des équipes qui additionnent leurs scores.`,
      en: `Setup
Use a standard 52-card deck (no Jokers).
Deal 4 cards face down to each player.
Players place their cards in a row in front of them without looking.
Place the remaining cards in the center as a draw pile.
At the start, each player may look at 2 cards of their choice.
Decide on penalties before starting.

Rules
The goal is to have the lowest value in your hand.
On your turn, draw a card and you may:
  - Discard it directly.
  - Swap it with a card from your hand.
  - If a card in your hand has the same value, discard both.
When a card is discarded, other players may discard a card of the same value.
When a player thinks they have the lowest score, they may call "Dutch".
The next round will be the last.
After the last round, all players reveal their cards.
The player with the lowest score wins.

Special Cards
Jack : swap one of your cards with another player's without looking.
Queen : look at one of your own cards.
Red King : worth 0 points.
Black King : highest card in the game.
7 : worth -1 point (lowest card in the game).

Penalties
Red King discarded : 3 penalties for all players.
7 discarded : the player gives out 3 penalties.
Black King discarded : 3 penalties for the player.
Queen discarded : 2 penalties for the player.
Jack discarded : 1 penalty for the player.
Looking at a card without permission : draw an extra card + 2 penalties.
Wrong discard : take back your card + draw an extra card + 3 penalties.
Player with the most points at the end : 5 penalties.

Key Points
Memory is essential for remembering cards you've seen.
Strategy is about minimizing your hand's value.
Special cards can change the game completely.
Timing your "Dutch" call is crucial.

Variants
Blind Dutch : no player may look at their cards at the start.
Team Dutch : form teams that add up their scores.`,
    },
  },
  {
    id: '99',
    title: '99',
    description: {
      fr: 'Posez des cartes pour faire grimper le total jusqu\'à 99 sans le dépasser.',
      en: 'Play cards to push the total to 99 without going over.',
    },
    rules: {
      fr: `Mise en place
Utilisez un jeu de 52 cartes (avec ou sans jokers).
Distribuez 2 cartes à chaque joueur.
Les joueurs doivent toujours avoir 2 cartes en main tout au long de la partie.

Règles du jeu
L'objectif du jeu est d'arriver exactement à un compte de 99.
Tour à tour, les joueurs posent une carte et annoncent le nouveau total à voix haute.
Après avoir joué une carte, le joueur en pioche une nouvelle.

Valeurs des cartes :
  2 à 10 : valeur faciale.
  Valet : -10 points.
  Dame : change le sens du jeu.
  Roi : le compte va jusqu'à 70 ou retourne à 70.
  As : 1 ou 11 (au choix du joueur).
  Joker : choix du chiffre entre 1 et 9.

Pénalités
Si un joueur ne pioche pas avant que le suivant joue : 2 pénalités.
Si un joueur se trompe dans le calcul : 2 pénalités.
Si un joueur demande le compte actuel : 2 pénalités.
Dizaine exacte (10, 20, 30...) : le joueur distribue autant de pénalités que la dizaine.
Arriver exactement à 99 : distribue une pénalité Ultime.
Dépasser 99 : 2 pénalités + le montant dépassé en pénalités.

Variantes
99 Enrichi : jouez avec 3 cartes par joueur au lieu de 2.
99 en Équipe : formez des binômes qui peuvent s'échanger une carte par manche.
99 Spécial : ajoutez des paliers de pénalités (51, 16, 64...).
99 Double : autorisez les joueurs à jouer 2 cartes par tour.`,
      en: `Setup
Use a standard 52-card deck (with or without Jokers).
Deal 2 cards to each player.
Players must always have 2 cards in hand throughout the game.

Rules
The goal is to reach exactly 99.
On your turn, play a card and announce the new total out loud.
After playing a card, draw a new one.

Card values:
  2 to 10 : face value.
  Jack : -10 points.
  Queen : reverses the direction of play.
  King : total goes to 70 or back to 70.
  Ace : 1 or 11 (player's choice).
  Joker : choose a number between 1 and 9.

Penalties
If a player doesn't draw before the next player goes : 2 penalties.
If a player miscalculates the total : 2 penalties.
If a player asks what the current total is : 2 penalties.
Exact tens (10, 20, 30...) : the player gives out penalties equal to the ten.
Reaching exactly 99 : give out one Ultimate penalty.
Going over 99 : 2 penalties + the amount over in penalties.

Variants
Rich 99 : play with 3 cards per player instead of 2.
Team 99 : form pairs that can swap one card per round.
Special 99 : add penalty thresholds (51, 16, 64...).
Double 99 : players may play 2 cards per turn.`,
    },
  },
];

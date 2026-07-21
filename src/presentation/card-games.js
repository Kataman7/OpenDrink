export const CARD_GAMES = [
  {
    id: 'dutch',
    title: 'Dutch',
    description: 'Échangez et défaussez vos cartes pour obtenir le score le plus bas.',
    sections: [
      {
        heading: 'Mise en place',
        lines: [
          'Utilisez un jeu de 52 cartes (sans les Jokers).',
          'Distribuez 4 cartes faces cachées à chaque joueur.',
          'Les joueurs placent leurs cartes en ligne devant eux sans les regarder.',
          'Placez le reste des cartes au milieu pour former la pioche.',
          'Au début, chaque joueur peut regarder 2 cartes de son choix dans son jeu.',
          'Définissez les pénalités avant de commencer.',
        ],
      },
      {
        heading: 'Règles du jeu',
        lines: [
          'Le but est d\'avoir la valeur la moins élevée dans son jeu.',
          'À tour de rôle, chaque joueur pioche une carte et peut :',
          '  - La défausser directement.',
          '  - L\'échanger avec une carte de son jeu.',
          '  - Si une carte de son jeu a la même valeur, défausser les deux cartes.',
          'Quand une carte est défaussée, les autres joueurs peuvent se défausser d\'une carte de même valeur.',
          'Lorsqu\'un joueur pense avoir moins de points que les autres, il peut dire "Dutch".',
          'Le tour suivant sera alors le dernier.',
          'Après ce dernier tour, tous les joueurs retournent leurs cartes.',
          'Le gagnant est celui qui a le score le plus faible.',
        ],
      },
      {
        heading: 'Cartes spéciales',
        lines: [
          'Valet : permet d\'échanger une de ses cartes avec celle d\'un autre joueur sans les regarder.',
          'Dame : permet de regarder une des cartes de son jeu.',
          'Roi rouge : ne vaut aucun point.',
          'Roi noir : carte la plus haute du jeu.',
          '7 : vaut -1 point (carte la plus basse du jeu).',
        ],
      },
      {
        heading: 'Pénalités',
        lines: [
          'Roi rouge défaussé : 3 pénalités pour tous les joueurs.',
          '7 défaussé : le joueur distribue 3 pénalités.',
          'Roi noir défaussé : 3 pénalités pour le joueur.',
          'Dame défaussée : 2 pénalités pour le joueur.',
          'Valet défaussé : 1 pénalité pour le joueur.',
          'Regarder une carte sans permission : piocher une carte supplémentaire + 2 pénalités.',
          'Erreur de défausse : reprendre sa carte + piocher une carte + 3 pénalités.',
          'Joueur avec le plus de points en fin de partie : 5 pénalités.',
        ],
      },
      {
        heading: 'Points importants',
        lines: [
          'La mémoire est essentielle pour se souvenir des cartes déjà vues.',
          'La stratégie consiste à minimiser la valeur de son jeu.',
          'Les cartes spéciales peuvent changer radicalement le cours du jeu.',
          'Le moment pour annoncer "Dutch" est crucial.',
        ],
      },
      {
        heading: 'Variantes',
        lines: [
          'Dutch Aveugle : aucun joueur ne peut regarder ses cartes au début.',
          'Dutch Équipe : formez des équipes qui additionnent leurs scores.',
        ],
      },
    ],
  },
  {
    id: '99',
    title: '99',
    description: 'Posez des cartes pour faire grimper le total jusqu\'à 99 sans le dépasser.',
    sections: [
      {
        heading: 'Mise en place',
        lines: [
          'Utilisez un jeu de 52 cartes (avec ou sans jokers).',
          'Distribuez 2 cartes à chaque joueur.',
          'Les joueurs doivent toujours avoir 2 cartes en main tout au long de la partie.',
        ],
      },
      {
        heading: 'Règles du jeu',
        lines: [
          'L\'objectif du jeu est d\'arriver exactement à un compte de 99.',
          'Tour à tour, les joueurs posent une carte et annoncent le nouveau total à voix haute.',
          'Après avoir joué une carte, le joueur en pioche une nouvelle.',
          '',
          'Valeurs des cartes :',
          '  2 à 10 : valeur faciale.',
          '  Valet : -10 points.',
          '  Dame : change le sens du jeu.',
          '  Roi : le compte va jusqu\'à 70 ou retourne à 70.',
          '  As : 1 ou 11 (au choix du joueur).',
          '  Joker : choix du chiffre entre 1 et 9.',
        ],
      },
      {
        heading: 'Pénalités',
        lines: [
          'Si un joueur ne pioche pas avant que le suivant joue : 2 pénalités.',
          'Si un joueur se trompe dans le calcul : 2 pénalités.',
          'Si un joueur demande le compte actuel : 2 pénalités.',
          'Dizaine exacte (10, 20, 30...) : le joueur distribue autant de pénalités que la dizaine.',
          'Arriver exactement à 99 : distribue une pénalité Ultime.',
          'Dépasser 99 : 2 pénalités + le montant dépassé en pénalités.',
        ],
      },
      {
        heading: 'Variantes',
        lines: [
          '99 Enrichi : jouez avec 3 cartes par joueur au lieu de 2.',
          '99 en Équipe : formez des binômes qui peuvent s\'échanger une carte par manche.',
          '99 Spécial : ajoutez des paliers de pénalités (51, 16, 64...).',
          '99 Double : autorisez les joueurs à jouer 2 cartes par tour.',
        ],
      },
    ],
  },
];

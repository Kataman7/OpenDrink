import { GameMode } from '../domain/game-mode.js';
import { QuestionTextPersonalizer } from './question-text-personalizer.js';
import { AntoinePersonalizer } from './antoine-personalizer.js';

const ROULETTE_ACTIONS = {
  fr: [
    'Embrasser tendrement',
    'Caresser du bout des doigts',
    'Mordiller délicatement',
    'Lécher doucement',
    'Souffler un souffle chaud',
    'Masser sensuellement',
    'Effleurer avec les ongles',
    'Déposer une pluie de baisers',
  ],
  en: [
    'Gently kiss',
    'Caress with fingertips',
    'Softly nibble',
    'Tenderly lick',
    'Blow warm breath on',
    'Sensually massage',
    'Lightly trace with nails',
    'Shower with sweet kisses',
  ],
};

const ROULETTE_ZONES = {
  fr: [
    'Le cou et la nuque',
    'Les lèvres',
    'Le creux des reins',
    "L'intérieur des cuisses",
    'Le lobe des oreilles',
    'Le ventre',
    'Les clavicules et épaules',
    'Le creux du poignet et la paume',
  ],
  en: [
    'The neck and nape',
    'The lips',
    'The small of the back',
    'The inner thighs',
    'The earlobes',
    'The belly',
    'The collarbones and shoulders',
    'The wrists and palms',
  ],
};

export class BonusGamesManager {
  constructor({ drawQuestionUseCase, audioService = null }) {
    this.drawQuestionUseCase = drawQuestionUseCase;
    this.audioService = audioService;
    this.reset();
  }

  reset() {
    this.activeBonusGame = null;
    this.clearTimers();

    // Bomb
    this.bombPlayerIndex = 0;
    this.bombQuestion = '';
    this.bombDurationMs = 0;
    this.bombRemainingMs = 0;
    this.bombIsExploded = false;
    this.bombTimerInterval = null;

    // Court
    this.courtAccused = null;
    this.courtCharge = '';
    this.courtGuiltyVotes = 0;
    this.courtInnocentVotes = 0;
    this.courtVerdictRevealed = false;
    this.courtResult = null;

    // Barometer
    this.barometerSituation = '';
    this.barometerPlayerIndex = 0;
    this.barometerRatings = [];
    this.barometerRevealed = false;
    this.barometerResult = null;

    // Consensus
    this.consensusChoiceA = '';
    this.consensusChoiceB = '';
    this.consensusVoterIndex = 0;
    this.consensusVotes = [];
    this.consensusRevealed = false;
    this.consensusResult = null;

    // Confessional
    this.confessionalPrompt = '';
    this.confessionalVoterIndex = 0;
    this.confessionalAnswers = [];
    this.confessionalRevealed = false;
    this.confessionalResult = null;

    // Survival
    this.survivalLives = {};
    this.survivalCurrentPlayer = null;
    this.survivalCurrentChallenge = null;
    this.survivalWinner = null;
    this.survivalTurnCount = 0;

    // Spicy Thermostat
    this.thermostatLevel = 1;
    this.thermostatPlayerIndex = 0;
    this.thermostatChallenge = '';

    // Spicy Strip
    this.stripClothes = {};
    this.stripPlayerIndex = 0;
    this.stripCurrentPlayer = null;
    this.stripChallenge = '';
    this.stripWinner = null;

    // Spicy Telepathy
    this.telepathyChooser = null;
    this.telepathyGuesser = null;
    this.telepathyChoiceA = '';
    this.telepathyChoiceB = '';
    this.telepathySecretChoice = null;
    this.telepathyResult = null;

    // Spicy Seven
    this.spicySevenPlayer = null;
    this.spicySevenQuestion = '';

    // Spicy Confession
    this.spicyConfessionPrompt = '';
    this.spicyConfessionPlayerIndex = 0;
    this.spicyConfessionAnswers = [];
    this.spicyConfessionRevealed = false;

    // Spicy Roulette
    this.rouletteGiver = null;
    this.rouletteReceiver = null;
    this.rouletteAction = '';
    this.rouletteZone = '';
    this.rouletteTimer = 30;
  }

  clearTimers() {
    if (this.bombTimerInterval) {
      clearInterval(this.bombTimerInterval);
      this.bombTimerInterval = null;
    }
  }

  // ==================== BOMB ====================
  async startBomb({ players, lang, onExplode, durationMs = null }) {
    this.clearTimers();
    this.activeBonusGame = 'bomb';
    this.bombIsExploded = false;
    this.bombPlayerIndex = Math.floor(Math.random() * players.length);

    const res = await this.drawQuestionUseCase.execute({
      gameMode: GameMode.SEVEN_SECONDS,
      intensity: 'mixed',
      lang,
      playerCount: players.length,
    });
    const personalizer = new QuestionTextPersonalizer(players);
    this.bombQuestion = personalizer.personalize(
      res.question.sentence,
      players[this.bombPlayerIndex].name
    );

    // Random duration between 12s and 24s if not provided
    this.bombDurationMs = durationMs ?? 12000 + Math.floor(Math.random() * 12000);
    this.bombRemainingMs = this.bombDurationMs;

    this.bombTimerInterval = setInterval(() => {
      this.bombRemainingMs -= 300;
      if (this.audioService?.tick) {
        this.audioService.tick();
      }
      if (this.bombRemainingMs <= 0) {
        this.triggerBombExplosion(players, onExplode);
      }
    }, 300);

    return {
      activePlayer: players[this.bombPlayerIndex],
      question: this.bombQuestion,
    };
  }

  async passBomb({ players, lang }) {
    if (this.bombIsExploded) return null;
    this.bombPlayerIndex = (this.bombPlayerIndex + 1) % players.length;

    const res = await this.drawQuestionUseCase.execute({
      gameMode: GameMode.SEVEN_SECONDS,
      intensity: 'mixed',
      lang,
      playerCount: players.length,
    });
    const personalizer = new QuestionTextPersonalizer(players);
    this.bombQuestion = personalizer.personalize(
      res.question.sentence,
      players[this.bombPlayerIndex].name
    );

    if (this.audioService?.tick) {
      this.audioService.tick();
    }

    return {
      activePlayer: players[this.bombPlayerIndex],
      question: this.bombQuestion,
    };
  }

  triggerBombExplosion(players, onExplode) {
    this.clearTimers();
    this.bombIsExploded = true;
    const loser = players[this.bombPlayerIndex];

    if (this.audioService?.ring) {
      this.audioService.ring();
    }

    if (typeof onExplode === 'function') {
      onExplode({ loser });
    }

    return { loser };
  }

  // ==================== COURT ====================
  async startCourt({ players, lang, previousAccusedId = null }) {
    this.clearTimers();
    this.activeBonusGame = 'court';
    this.courtGuiltyVotes = 0;
    this.courtInnocentVotes = 0;
    this.courtVerdictRevealed = false;
    this.courtResult = null;

    const candidates = players.filter(p => p.id !== previousAccusedId);
    const pool = candidates.length > 0 ? candidates : players;
    this.courtAccused = pool[Math.floor(Math.random() * pool.length)];

    // NEVER_HAVE_I_EVER contains thousands of concrete actions/deeds perfect for accusations
    const res = await this.drawQuestionUseCase.execute({
      gameMode: GameMode.NEVER_HAVE_I_EVER,
      intensity: 'mixed',
      lang,
      playerCount: players.length,
    });

    const prefix = lang === 'fr' ? 'A déjà : ' : 'Has already: ';
    const rawSentence = res.question.sentence.trim();
    const chargeText = `${prefix}${rawSentence}`;

    const personalizer = new QuestionTextPersonalizer(players);
    this.courtCharge = personalizer.personalize(chargeText, this.courtAccused.name);

    return {
      accused: this.courtAccused,
      charge: this.courtCharge,
      guiltyVotes: 0,
      innocentVotes: 0,
    };
  }

  addGuiltyVote() {
    if (this.courtVerdictRevealed) return;
    this.courtGuiltyVotes++;
  }

  addInnocentVote() {
    if (this.courtVerdictRevealed) return;
    this.courtInnocentVotes++;
  }

  renderCourtVerdict() {
    this.courtVerdictRevealed = true;
    const isGuilty = this.courtGuiltyVotes > this.courtInnocentVotes;
    const drinks = isGuilty ? Math.max(2, this.courtGuiltyVotes) : 2;

    this.courtResult = {
      isGuilty,
      accused: this.courtAccused,
      guiltyVotes: this.courtGuiltyVotes,
      innocentVotes: this.courtInnocentVotes,
      drinks,
    };
    return this.courtResult;
  }

  // ==================== BAROMETER ====================
  async startBarometer({ players, lang }) {
    this.clearTimers();
    this.activeBonusGame = 'barometer';
    this.barometerPlayerIndex = 0;
    this.barometerRatings = [];
    this.barometerRevealed = false;
    this.barometerResult = null;

    const res = await this.drawQuestionUseCase.execute({
      gameMode: GameMode.ITS_A_10,
      intensity: 'mixed',
      lang,
      playerCount: players.length,
    });
    const personalizer = new QuestionTextPersonalizer(players);
    this.barometerSituation = personalizer.personalize(res.question.sentence, players[0].name);

    return {
      situation: this.barometerSituation,
      currentRatingPlayer: players[0],
      totalPlayers: players.length,
    };
  }

  submitBarometerRating({ players, rating }) {
    const player = players[this.barometerPlayerIndex];
    this.barometerRatings.push({
      player,
      rating: Math.max(0, Math.min(10, Number(rating))),
    });
    this.barometerPlayerIndex++;

    if (this.barometerPlayerIndex >= players.length) {
      return this.computeBarometerResult();
    }

    return {
      nextPlayer: players[this.barometerPlayerIndex],
      isFinished: false,
    };
  }

  computeBarometerResult() {
    this.barometerRevealed = true;
    const sum = this.barometerRatings.reduce((acc, r) => acc + r.rating, 0);
    const average = Number((sum / this.barometerRatings.length).toFixed(1));

    let furthest = this.barometerRatings[0];
    let maxDistance = Math.abs(furthest.rating - average);

    for (let i = 1; i < this.barometerRatings.length; i++) {
      const distance = Math.abs(this.barometerRatings[i].rating - average);
      if (distance > maxDistance) {
        maxDistance = distance;
        furthest = this.barometerRatings[i];
      }
    }

    const drinks = Math.max(1, Math.round(maxDistance));
    this.barometerResult = {
      average,
      ratings: this.barometerRatings,
      extremePlayer: furthest.player,
      extremeRating: furthest.rating,
      drinks,
      isFinished: true,
    };
    return this.barometerResult;
  }

  // ==================== CONSENSUS ====================
  async startConsensus({ players, lang }) {
    this.clearTimers();
    this.activeBonusGame = 'consensus';
    this.consensusVoterIndex = 0;
    this.consensusVotes = [];
    this.consensusRevealed = false;
    this.consensusResult = null;

    const res = await this.drawQuestionUseCase.execute({
      gameMode: GameMode.WOULD_YOU_RATHER,
      intensity: 'mixed',
      lang,
      playerCount: players.length,
    });
    const personalizer = new QuestionTextPersonalizer(players);
    this.consensusChoiceA = personalizer.personalize(res.question.choiceA, players[0].name);
    this.consensusChoiceB = personalizer.personalize(res.question.choiceB, players[0].name);

    return {
      choiceA: this.consensusChoiceA,
      choiceB: this.consensusChoiceB,
      currentVoter: players[0],
      totalPlayers: players.length,
    };
  }

  submitConsensusVote({ players, choice }) {
    const player = players[this.consensusVoterIndex];
    this.consensusVotes.push({ player, choice });
    this.consensusVoterIndex++;

    if (this.consensusVoterIndex >= players.length) {
      return this.computeConsensusResult();
    }

    return {
      nextVoter: players[this.consensusVoterIndex],
      isFinished: false,
    };
  }

  computeConsensusResult() {
    this.consensusRevealed = true;
    const votesA = this.consensusVotes.filter(v => v.choice === 'A');
    const votesB = this.consensusVotes.filter(v => v.choice === 'B');

    let minorityChoice = null;
    let losers = [];
    let isTie = false;

    if (votesA.length < votesB.length) {
      minorityChoice = 'A';
      losers = votesA.map(v => v.player);
    } else if (votesB.length < votesA.length) {
      minorityChoice = 'B';
      losers = votesB.map(v => v.player);
    } else {
      isTie = true;
    }

    this.consensusResult = {
      choiceA: this.consensusChoiceA,
      choiceB: this.consensusChoiceB,
      countA: votesA.length,
      countB: votesB.length,
      votes: this.consensusVotes,
      minorityChoice,
      losers,
      isTie,
      isFinished: true,
    };
    return this.consensusResult;
  }

  // ==================== CONFESSIONAL ====================
  async startConfessional({ players, lang }) {
    this.clearTimers();
    this.activeBonusGame = 'confessional';
    this.confessionalVoterIndex = 0;
    this.confessionalAnswers = [];
    this.confessionalRevealed = false;
    this.confessionalResult = null;

    const res = await this.drawQuestionUseCase.execute({
      gameMode: GameMode.NEVER_HAVE_I_EVER,
      intensity: 'mixed',
      lang,
      playerCount: players.length,
    });

    const prefix = lang === 'fr' ? "Je n'ai jamais " : 'Never have I ever ';
    const rawSentence = res.question.sentence.trim();
    const promptText = rawSentence.toLowerCase().startsWith(prefix.toLowerCase().trim())
      ? rawSentence
      : `${prefix}${rawSentence}`;

    const personalizer = new QuestionTextPersonalizer(players);
    this.confessionalPrompt = personalizer.personalize(promptText, players[0].name);

    return {
      prompt: this.confessionalPrompt,
      currentVoter: players[0],
      totalPlayers: players.length,
    };
  }

  submitConfession({ players, done }) {
    this.confessionalAnswers.push(Boolean(done));
    this.confessionalVoterIndex++;

    if (this.confessionalVoterIndex >= players.length) {
      return this.computeConfessionalResult(players.length);
    }

    return {
      nextVoter: players[this.confessionalVoterIndex],
      isFinished: false,
    };
  }

  computeConfessionalResult(totalPlayers) {
    this.confessionalRevealed = true;
    const doneCount = this.confessionalAnswers.filter(a => a === true).length;

    this.confessionalResult = {
      prompt: this.confessionalPrompt,
      doneCount,
      totalPlayers,
      isFinished: true,
    };
    return this.confessionalResult;
  }

  // ==================== SURVIVAL ====================
  async startSurvival({ players, lang }) {
    this.clearTimers();
    this.activeBonusGame = 'survival';
    this.survivalLives = {};
    for (const player of players) {
      this.survivalLives[player.id] = 3;
    }
    this.survivalWinner = null;
    this.survivalTurnCount = 0;
    return await this.nextSurvivalTurn({ players, lang });
  }

  async nextSurvivalTurn({ players, lang }) {
    const alivePlayers = players.filter(p => (this.survivalLives[p.id] || 0) > 0);

    if (alivePlayers.length <= 1) {
      this.survivalWinner = alivePlayers[0] || null;
      return {
        winner: this.survivalWinner,
        lives: { ...this.survivalLives },
        isFinished: true,
      };
    }

    this.survivalTurnCount++;
    this.survivalCurrentPlayer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];

    const modes = [GameMode.QUIZ, GameMode.SEVEN_SECONDS, GameMode.ACTION_TRUTH];
    const pickedMode = modes[Math.floor(Math.random() * modes.length)];

    const res = await this.drawQuestionUseCase.execute({
      gameMode: pickedMode,
      intensity: 'mixed',
      lang,
      playerCount: players.length,
    });

    const personalizer = new QuestionTextPersonalizer(players);
    if (res.question.sentence) {
      res.question.sentence = personalizer.personalize(
        res.question.sentence,
        this.survivalCurrentPlayer.name
      );
    }
    if (res.question.choiceA) {
      res.question.choiceA = personalizer.personalize(
        res.question.choiceA,
        this.survivalCurrentPlayer.name
      );
      res.question.choiceB = personalizer.personalize(
        res.question.choiceB,
        this.survivalCurrentPlayer.name
      );
    }

    this.survivalCurrentChallenge = {
      mode: pickedMode,
      question: res.question,
    };

    return {
      currentPlayer: this.survivalCurrentPlayer,
      challenge: this.survivalCurrentChallenge,
      lives: { ...this.survivalLives },
      isFinished: false,
    };
  }

  async resolveSurvivalTurn({ success, players, lang }) {
    if (!success && this.survivalCurrentPlayer) {
      const current = this.survivalLives[this.survivalCurrentPlayer.id] || 0;
      this.survivalLives[this.survivalCurrentPlayer.id] = Math.max(0, current - 1);
    }

    return await this.nextSurvivalTurn({ players, lang });
  }

  personalizeText(sentence, player, players, timer = null) {
    if (!sentence) return '';
    const antoine = new AntoinePersonalizer();
    const personalizedWithAntoine = antoine.personalize(sentence, player, players, timer);
    const generic = new QuestionTextPersonalizer(players);
    return generic.personalize(personalizedWithAntoine, player ? player.name : '');
  }

  // ==================== SPICY: THERMOSTAT ====================
  async startSpicyThermostat({ players, lang }) {
    this.clearTimers();
    this.activeBonusGame = 'spicy_thermostat';
    this.thermostatLevel = 1;
    this.thermostatPlayerIndex = 0;
    return await this.nextThermostatTurn({ players, lang, advanceLevel: false });
  }

  async nextThermostatTurn({ players, lang, advanceLevel = false, resetToStart = false }) {
    if (resetToStart) {
      this.thermostatLevel = 1;
    } else if (advanceLevel) {
      this.thermostatLevel = Math.min(10, this.thermostatLevel + 1);
    }
    this.thermostatPlayerIndex = (this.thermostatPlayerIndex + 1) % players.length;
    const player = players[this.thermostatPlayerIndex];

    const intensity = this.thermostatLevel <= 4 ? 'soft' : 'hot';
    let res;
    try {
      res = await this.drawQuestionUseCase.execute({
        gameMode: GameMode.TRUTH_DARE,
        intensity,
        lang,
        playerCount: players.length,
        coupleOnly: true,
      });
    } catch {
      res = await this.drawQuestionUseCase.execute({
        gameMode: GameMode.ACTION_TRUTH,
        intensity,
        lang,
        playerCount: players.length,
        coupleOnly: true,
      });
    }

    this.thermostatChallenge = this.personalizeText(
      res.question.sentence,
      player,
      players,
      res.question.timer
    );

    return {
      level: this.thermostatLevel,
      player,
      challenge: this.thermostatChallenge,
      isMaxLevel: this.thermostatLevel >= 10,
    };
  }

  // ==================== SPICY: STRIP-DRINK ====================
  async startSpicyStrip({ players, lang }) {
    this.clearTimers();
    this.activeBonusGame = 'spicy_strip';
    this.stripClothes = {};
    for (const p of players) {
      this.stripClothes[p.id] = 5;
    }
    this.stripPlayerIndex = 0;
    this.stripWinner = null;
    return await this.nextStripTurn({ players, lang });
  }

  async nextStripTurn({ players, lang }) {
    this.stripCurrentPlayer = players[this.stripPlayerIndex];

    let res;
    try {
      res = await this.drawQuestionUseCase.execute({
        gameMode: GameMode.TRUTH_DARE,
        intensity: 'hot',
        lang,
        playerCount: players.length,
        coupleOnly: true,
      });
    } catch {
      res = await this.drawQuestionUseCase.execute({
        gameMode: GameMode.ACTION_TRUTH,
        intensity: 'hot',
        lang,
        playerCount: players.length,
        coupleOnly: true,
      });
    }

    this.stripChallenge = this.personalizeText(
      res.question.sentence,
      this.stripCurrentPlayer,
      players,
      res.question.timer
    );

    return {
      currentPlayer: this.stripCurrentPlayer,
      challenge: this.stripChallenge,
      clothes: { ...this.stripClothes },
      isFinished: false,
    };
  }

  async resolveSpicyStrip({ strip, players, lang }) {
    if (strip && this.stripCurrentPlayer) {
      const current = this.stripClothes[this.stripCurrentPlayer.id] || 0;
      this.stripClothes[this.stripCurrentPlayer.id] = Math.max(0, current - 1);

      if (this.stripClothes[this.stripCurrentPlayer.id] <= 0) {
        this.stripWinner = players.find(p => p.id !== this.stripCurrentPlayer.id) || players[0];
        return {
          winner: this.stripWinner,
          clothes: { ...this.stripClothes },
          isFinished: true,
        };
      }
    }

    this.stripPlayerIndex = (this.stripPlayerIndex + 1) % players.length;
    return await this.nextStripTurn({ players, lang });
  }

  // ==================== SPICY: TELEPATHY ====================
  async startSpicyTelepathy({ players, lang }) {
    this.clearTimers();
    this.activeBonusGame = 'spicy_telepathy';
    this.telepathyChooser = players[0];
    this.telepathyGuesser = players[1] || players[0];
    this.telepathySecretChoice = null;
    this.telepathyResult = null;

    const res = await this.drawQuestionUseCase.execute({
      gameMode: GameMode.WOULD_YOU_RATHER,
      intensity: 'hot',
      lang,
      playerCount: players.length,
    });

    const personalizer = new QuestionTextPersonalizer(players);
    this.telepathyChoiceA = personalizer.personalize(
      res.question.choiceA,
      this.telepathyChooser.name
    );
    this.telepathyChoiceB = personalizer.personalize(
      res.question.choiceB,
      this.telepathyChooser.name
    );

    return {
      chooser: this.telepathyChooser,
      guesser: this.telepathyGuesser,
      choiceA: this.telepathyChoiceA,
      choiceB: this.telepathyChoiceB,
      step: 'choose',
    };
  }

  submitSpicyTelepathyChoice(choice) {
    this.telepathySecretChoice = choice;
    return {
      chooser: this.telepathyChooser,
      guesser: this.telepathyGuesser,
      choiceA: this.telepathyChoiceA,
      choiceB: this.telepathyChoiceB,
      step: 'guess',
    };
  }

  submitSpicyTelepathyGuess(guess) {
    const isCorrect = guess === this.telepathySecretChoice;
    const choiceText =
      this.telepathySecretChoice === 'A' ? this.telepathyChoiceA : this.telepathyChoiceB;

    this.telepathyResult = {
      isCorrect,
      chooser: this.telepathyChooser,
      guesser: this.telepathyGuesser,
      secretChoice: this.telepathySecretChoice,
      choiceText,
      choiceA: this.telepathyChoiceA,
      choiceB: this.telepathyChoiceB,
      isFinished: true,
    };
    return this.telepathyResult;
  }

  // ==================== SPICY: SEVEN ====================
  async startSpicySeven({ players, lang }) {
    this.clearTimers();
    this.activeBonusGame = 'spicy_seven';
    const player = players[Math.floor(Math.random() * players.length)];

    const res = await this.drawQuestionUseCase.execute({
      gameMode: GameMode.SEVEN_SECONDS,
      intensity: 'hot',
      lang,
      playerCount: players.length,
    });

    const personalizer = new QuestionTextPersonalizer(players);
    this.spicySevenQuestion = personalizer.personalize(res.question.sentence, player.name);

    return {
      player,
      question: this.spicySevenQuestion,
    };
  }

  // ==================== SPICY: CONFESSION ====================
  async startSpicyConfession({ players, lang }) {
    this.clearTimers();
    this.activeBonusGame = 'spicy_confession';
    this.spicyConfessionPlayerIndex = 0;
    this.spicyConfessionAnswers = [];
    this.spicyConfessionRevealed = false;

    const res = await this.drawQuestionUseCase.execute({
      gameMode: GameMode.NEVER_HAVE_I_EVER,
      intensity: 'hot',
      lang,
      playerCount: players.length,
    });

    const prefix = lang === 'fr' ? "Je n'ai jamais " : 'Never have I ever ';
    const rawSentence = res.question.sentence.trim();
    const promptText = rawSentence.toLowerCase().startsWith(prefix.toLowerCase().trim())
      ? rawSentence
      : `${prefix}${rawSentence}`;

    const personalizer = new QuestionTextPersonalizer(players);
    this.spicyConfessionPrompt = personalizer.personalize(
      promptText,
      players[0] ? players[0].name : ''
    );

    return {
      prompt: this.spicyConfessionPrompt,
      currentVoter: players[0],
      totalPlayers: players.length,
    };
  }

  submitSpicyConfession({ done, players }) {
    const player = players[this.spicyConfessionPlayerIndex];
    this.spicyConfessionAnswers.push({ player, done: Boolean(done) });
    this.spicyConfessionPlayerIndex++;

    if (this.spicyConfessionPlayerIndex >= players.length) {
      this.spicyConfessionRevealed = true;
      return {
        prompt: this.spicyConfessionPrompt,
        answers: this.spicyConfessionAnswers,
        isFinished: true,
      };
    }

    return {
      prompt: this.spicyConfessionPrompt,
      nextVoter: players[this.spicyConfessionPlayerIndex],
      isFinished: false,
    };
  }

  // ==================== SPICY: ROULETTE ====================
  startSpicyRoulette({ players, lang }) {
    this.clearTimers();
    this.activeBonusGame = 'spicy_roulette';

    const giver = players[Math.floor(Math.random() * players.length)];
    const receiver = players.find(p => p.id !== giver.id) || players[0];

    const actions = ROULETTE_ACTIONS[lang] || ROULETTE_ACTIONS.fr;
    const zones = ROULETTE_ZONES[lang] || ROULETTE_ZONES.fr;

    const action = actions[Math.floor(Math.random() * actions.length)];
    const zone = zones[Math.floor(Math.random() * zones.length)];
    const timers = [5, 10, 15, 20];
    const timer = timers[Math.floor(Math.random() * timers.length)];

    return {
      giver,
      receiver,
      action,
      zone,
      timer,
    };
  }
}

import { GameMode } from '../domain/game-mode.js';
import { RoundRenderer } from './round-renderer.js';
import { CardGameView } from './card-game-view.js';
import { CARD_GAMES } from './card-games.js';
import { BonusGameView } from './bonus-game-view.js';
import { MODE_HANDLERS } from './mode-handlers.js';
import { ERROR_DISPLAY_DURATION_MS } from '../config.js';

export class GameEventHandler {
  constructor(dependencies) {
    this.view = dependencies.view;
    this.state = dependencies.state;
    this.screenManager = dependencies.screenManager;
    this.impostorManager = dependencies.impostorManager;
    this.drawQuestionUseCase = dependencies.drawQuestionUseCase;
    this.i18n = dependencies.i18n;
    this.preferencesManager = dependencies.preferencesManager;
    this.initializeDatabaseUseCase = dependencies.initializeDatabaseUseCase;
    this.addPlayerUseCase = dependencies.addPlayerUseCase;
    this.removePlayerUseCase = dependencies.removePlayerUseCase;
    this.textToSpeech = dependencies.textToSpeech;
    this._supportedLanguages = dependencies.supportedLanguages;
    this.roundRenderer = new RoundRenderer({
      view: dependencies.view,
      state: dependencies.state,
      roundLabelBuilder: dependencies.roundLabelBuilder,
      textToSpeech: dependencies.textToSpeech,
    });
    this.cardGameView = new CardGameView(dependencies.view);
    this.bonusGamesManager = dependencies.bonusGamesManager;
    this.bonusGameView = new BonusGameView({
      view: dependencies.view,
      i18n: dependencies.i18n,
    });
    this._quizLocked = false;
    this._errorTimeout = null;
    this._installPrompt = null;
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this._installPrompt = e;
      this.view.showInstallButton(true);
    });
    window.addEventListener('appinstalled', () => {
      this.view.showInstallButton(false);
    });
  }

  bind() {
    document.addEventListener('click', e => this.onClick(e));
    document.addEventListener('change', e => this.onChange(e));
    document.addEventListener('keydown', e => this.onKeyDown(e));
  }

  async initialize() {
    this.view.renderScreen('loading');
    this.preferencesManager.restore();
    if (this.state.autoRead) {
      this.textToSpeech.toggleAutoRead();
      this.view.updateAutoReadButton(true);
    }
    this.view.renderLanguageSelector({
      languages: this._supportedLanguages,
      selectedLang: this.state.selectedLang,
    });
    this.view.applyStaticTranslations(this.state.selectedLang);
    await this.initializeDatabaseUseCase.execute();
    await this.restorePlayers();
    this.screenManager.navigateToHome();
  }

  async restorePlayers() {
    for (const playerName of this.state.consumeRestoredPlayerNames()) {
      const player = await this.addPlayerUseCase.execute({ name: playerName });
      this.state.addPlayer(player);
    }
  }

  async onClick(event) {
    const target = this.view.findActionTarget(event.target);
    if (!target) return;
    const action = target.getAttribute('data-action');
    const handlerName = CLICK_ACTIONS[action];
    if (!handlerName) return;
    await this[handlerName](target);
  }

  onChange(event) {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    if (target.id !== 'lang-select') return;
    this.handleLanguageChange();
  }

  onKeyDown(event) {
    if (event.key !== 'Enter') return;
    if (!this.state.isLobbyScreen()) return;
    this.handleAddPlayer();
  }

  handleLanguageChange() {
    const selectedLang = this.view.readSelectedLanguage();
    this.state.updateLanguage(selectedLang);
    this.i18n.setLanguage(selectedLang);
    this.view.applyStaticTranslations(selectedLang);
    this.screenManager.renderPlayers();
    this.persistPreferences();
  }

  async handleAddPlayer() {
    const playerName = this.view.readPlayerInput();
    if (!playerName) return;

    try {
      const player = await this.addPlayerUseCase.execute({ name: playerName });
      this.state.addPlayer(player);
      this.view.clearPlayerInput();
      this.screenManager.renderPlayers();
      this.persistPreferences();
    } catch (error) {
      this.showError(error.message);
    }
  }

  async handleRemovePlayer(target) {
    const playerId = Number(target.getAttribute('data-player-id'));
    if (!playerId) return;

    try {
      await this.removePlayerUseCase.execute({ playerId });
      this.state.removePlayerById(playerId);
      this.screenManager.renderPlayers();
      this.persistPreferences();
    } catch (error) {
      this.showError(error.message);
    }
  }

  handleStartGame() {
    if (this.state.hasEnoughPlayers(2)) {
      this.screenManager.navigateToModeSelection();
    } else {
      this.showError(this.i18n.t('errors.minPlayers', { count: 2 }));
    }
  }

  async handleModeSelected(target) {
    const mode = target.getAttribute('data-mode');
    this.state.selectMode(mode);
    const handler = MODE_HANDLERS[mode] || MODE_HANDLERS._default;
    await handler(this);
  }

  async _handleModeNoIntensity() {
    this.screenManager.navigateToGameScreen();
    await this.requestNextRound();
  }

  handleGoLobby() {
    this.screenManager.navigateToLobby();
  }

  handleGoCardGames() {
    this.screenManager.navigateToCardGames();
    this.cardGameView.renderList(CARD_GAMES, this.state.selectedLang);
  }

  async handleInstallApp() {
    if (!this._installPrompt) return;
    this._installPrompt.prompt();
    const result = await this._installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      this.view.showInstallButton(false);
    }
    this._installPrompt = null;
  }

  handleSelectCardGame(target) {
    const gameId = target.getAttribute('data-game');
    const game = CARD_GAMES.find(g => g.id === gameId);
    if (!game) return;
    const lang = this.state.selectedLang;
    const rules = game.rules[lang] || game.rules.en;
    this.screenManager.navigateToCardGameDetail();
    this.cardGameView.renderDetail(game.title, rules);
  }

  handleBackHome() {
    this.screenManager.goBack();
  }

  handleBackCardGames() {
    this.screenManager.goBack();
  }

  handleRandomConfirm() {
    const modeIds = this.view.readSelectedRandomModes();
    if (modeIds.length === 0) {
      this.showError(this.i18n.t('modeRandom.noSelection'));
      return;
    }
    this.state.setRandomModes(modeIds);
    this.screenManager.navigateToIntensitySelection();
  }

  async handleIntensitySelected(target) {
    const intensity = target.getAttribute('data-intensity');
    this.state.selectIntensity(intensity);
    this.screenManager.navigateToGameScreen();
    await this.requestNextRound();
  }

  async handleImpostorStart() {
    const playerCount = this.state.players.length;
    const impostors = this.state.impostorCount;
    const mrWhite = this.state.mrWhiteCount;
    if (playerCount < impostors + mrWhite + 2) {
      this.showError(this.i18n.t('impostorSettings.minPlayers'));
      return;
    }
    const pack = this.view.readSelectedImpostorPack();
    this.state.impostorPack = pack === 'all' ? null : pack;
    await this.startImpostorRound();
  }

  handleImpostorDecImpostors() {
    if (this.state.impostorCount > 1) {
      this.state.impostorCount--;
      this.view.updateImpostorSettings(this.state);
    }
  }

  handleImpostorIncImpostors() {
    const maxImpostor = Math.floor((this.state.players.length - this.state.mrWhiteCount) / 2);
    if (this.state.impostorCount < maxImpostor) {
      this.state.impostorCount++;
      this.view.updateImpostorSettings(this.state);
    }
  }

  handleImpostorDecWhite() {
    if (this.state.mrWhiteCount > 0) {
      this.state.mrWhiteCount--;
      this.view.updateImpostorSettings(this.state);
    }
  }

  handleImpostorIncWhite() {
    const maxWhite = this.state.players.length - this.state.impostorCount - 1;
    if (this.state.mrWhiteCount < maxWhite) {
      this.state.mrWhiteCount++;
      this.view.updateImpostorSettings(this.state);
    }
  }

  async startImpostorRound() {
    try {
      const success = await this.impostorManager.initializeRound(this.state);
      if (success) {
        this.screenManager.navigateToImpostorReveal();
        this.renderImpostorPassStep();
      }
    } catch (error) {
      this.showError(error.message);
    }
  }

  async handleNextRound() {
    this._quizLocked = false;
    await this.requestNextRound();
  }

  async requestNextRound() {
    try {
      if (this.state.selectedGameMode === GameMode.RANDOM) {
        this.state.setCurrentRoundMode(this.state.pickRandomRoundMode());
      }
      if (
        this.state.roundState.getActiveGameMode() === GameMode.TEAM_BATTLE &&
        (!this.state.teamOnePlayerIds?.length || !this.state.teamTwoPlayerIds?.length)
      ) {
        this.state.buildTeams();
      }
      const round = await this.drawQuestionUseCase.execute(this.state.buildRoundRequest());
      this.state.recordSeenQuestion(round.question);
      this.roundRenderer.renderRound(round);
      this.state.setPreviousPlayer(round.player.id);
    } catch (error) {
      this.showError(error.message);
    }
  }

  handleBackToLobby() {
    this.state.clearSeenQuestions();
    this.view.clearSevenTimer();
    this.impostorManager.finishRound();
    this.screenManager.goBack();
  }

  handleImpostorReveal() {
    this.impostorManager.revealWord();
    const result = this.impostorManager.getCurrentWord();
    this.view.renderImpostorRevealedWord({
      word: result.word,
      role: result.role,
      hasNextPlayer: this.impostorManager.hasNextPlayer(),
    });
  }

  handleImpostorNext() {
    this.impostorManager.moveToNextPlayer();
    if (!this.impostorManager.hasMorePlayers()) {
      this.handleImpostorFinish();
      return;
    }
    this.renderImpostorPassStep();
  }

  renderImpostorPassStep() {
    const currentPlayer = this.impostorManager.getCurrentPlayer(this.state.players);
    if (!currentPlayer) return;
    this.view.renderImpostorPassStep({
      playerName: currentPlayer.name,
      hint: this.i18n.t('impostor.revealWord'),
    });
  }

  handleImpostorFinish() {
    const accusationPlayers = this.impostorManager.getAccusationPlayers(this.state.players);
    this.view.renderImpostorDiscussionState();
    this.view.renderImpostorAccusationList(accusationPlayers);
  }

  async handleImpostorAccuse(target) {
    const playerId = Number(target.getAttribute('data-player-id'));
    if (!playerId) return;

    const isBad =
      this.impostorManager.isImpostorPlayer(playerId) ||
      this.impostorManager.isMrWhitePlayer(playerId);

    if (isBad) {
      this.impostorManager.removeBadPlayer(playerId);
      this.impostorManager.removeFromAccusations(playerId);
      this.view.renderImpostorAccusationList(
        this.impostorManager.getAccusationPlayers(this.state.players)
      );

      if (this.impostorManager.getRemainingBadCount() === 0) {
        this.view.renderImpostorAccusationResult(this.i18n.t('impostor.impostorFound'));
        this.impostorManager.finishRound();
      } else {
        const remaining = this.impostorManager.getRemainingBadCount();
        this.view.renderImpostorAccusationResult(
          `${this.i18n.t('impostor.impostorFound')} (${remaining} restant${remaining > 1 ? 's' : ''})`
        );
      }
      return;
    }

    this.impostorManager.removeFromAccusations(playerId);
    this.view.renderImpostorAccusationList(
      this.impostorManager.getAccusationPlayers(this.state.players)
    );
    this.view.renderImpostorAccusationResult(this.i18n.t('impostor.notImpostor'));
  }

  handleToggleAutoRead() {
    const enabled = this.textToSpeech.toggleAutoRead();
    this.state.autoRead = enabled;
    this.view.updateAutoReadButton(enabled);
    this.persistPreferences();
    if (enabled) {
      this.roundRenderer.readCurrentQuestion();
    }
  }

  handleStartSevenTimer() {
    this.view.startSevenTimer();
  }

  handleQuizAnswer(target) {
    if (this._quizLocked) return;
    this._quizLocked = true;
    document.querySelectorAll('.quiz-option').forEach(opt => {
      opt.disabled = true;
      opt.classList.remove('btn-accent');
      if (opt.getAttribute('data-correct') === 'true') {
        opt.classList.add('btn-correct');
      }
    });
    if (target.getAttribute('data-correct') !== 'true') {
      target.classList.add('btn-wrong');
    }
  }

  async handleSelectBonusGame(target) {
    const bonusId = target.getAttribute('data-bonus');
    await this.startSelectedBonusGame(bonusId);
  }

  async startSelectedBonusGame(bonusId) {
    if (!this.state.hasEnoughPlayers(2)) {
      this.showError(this.i18n.t('errors.minPlayers', { count: 2 }));
      return;
    }
    this.screenManager.navigateToBonusPlay();

    switch (bonusId) {
      case 'bomb':
        await this.startBomb();
        break;
      case 'court':
        await this.startCourt();
        break;
      case 'barometer':
        await this.startBarometer();
        break;
      case 'consensus':
        await this.startConsensus();
        break;
      case 'confessional':
        await this.startConfessional();
        break;
      case 'survival':
        await this.startSurvival();
        break;
      default:
        break;
    }
  }

  async startBomb() {
    const res = await this.bonusGamesManager.startBomb({
      players: this.state.players,
      lang: this.state.selectedLang,
      onExplode: ({ loser }) => {
        this.bonusGameView.renderBombPlay({
          activePlayer: loser,
          isExploded: true,
          loser,
        });
      },
    });
    this.bonusGameView.renderBombPlay({
      activePlayer: res.activePlayer,
      question: res.question,
      isExploded: false,
    });
  }

  async handleBonusBombPass() {
    const res = await this.bonusGamesManager.passBomb({
      players: this.state.players,
      lang: this.state.selectedLang,
    });
    if (res) {
      this.bonusGameView.renderBombPlay({
        activePlayer: res.activePlayer,
        question: res.question,
        isExploded: false,
      });
    }
  }

  async handleBonusBombRestart() {
    await this.startBomb();
  }

  async startCourt() {
    const res = await this.bonusGamesManager.startCourt({
      players: this.state.players,
      lang: this.state.selectedLang,
    });
    this.bonusGameView.renderCourtPlay({
      accused: res.accused,
      charge: res.charge,
      guiltyVotes: res.guiltyVotes,
      innocentVotes: res.innocentVotes,
      isVerdict: false,
    });
  }

  handleBonusCourtGuilty() {
    this.bonusGamesManager.addGuiltyVote();
    this.bonusGameView.renderCourtPlay({
      accused: this.bonusGamesManager.courtAccused,
      charge: this.bonusGamesManager.courtCharge,
      guiltyVotes: this.bonusGamesManager.courtGuiltyVotes,
      innocentVotes: this.bonusGamesManager.courtInnocentVotes,
      isVerdict: false,
    });
  }

  handleBonusCourtInnocent() {
    this.bonusGamesManager.addInnocentVote();
    this.bonusGameView.renderCourtPlay({
      accused: this.bonusGamesManager.courtAccused,
      charge: this.bonusGamesManager.courtCharge,
      guiltyVotes: this.bonusGamesManager.courtGuiltyVotes,
      innocentVotes: this.bonusGamesManager.courtInnocentVotes,
      isVerdict: false,
    });
  }

  handleBonusCourtVerdict() {
    const verdict = this.bonusGamesManager.renderCourtVerdict();
    this.bonusGameView.renderCourtPlay({
      isVerdict: true,
      verdictResult: verdict,
    });
  }

  async handleBonusCourtNext() {
    await this.startCourt();
  }

  async startBarometer() {
    const res = await this.bonusGamesManager.startBarometer({
      players: this.state.players,
      lang: this.state.selectedLang,
    });
    this.bonusGameView.renderBarometerPlay({
      situation: res.situation,
      currentRatingPlayer: res.currentRatingPlayer,
      isFinished: false,
    });
  }

  handleBonusBarometerSubmit() {
    const slider = document.getElementById('barometer-slider');
    const rating = slider ? slider.value : 5;
    const res = this.bonusGamesManager.submitBarometerRating({
      players: this.state.players,
      rating,
    });
    if (res.isFinished) {
      this.bonusGameView.renderBarometerPlay({
        isFinished: true,
        result: res,
      });
    } else {
      this.bonusGameView.renderBarometerPlay({
        situation: this.bonusGamesManager.barometerSituation,
        currentRatingPlayer: res.nextPlayer,
        isFinished: false,
      });
    }
  }

  async handleBonusBarometerNext() {
    await this.startBarometer();
  }

  async startConsensus() {
    const res = await this.bonusGamesManager.startConsensus({
      players: this.state.players,
      lang: this.state.selectedLang,
    });
    this.bonusGameView.renderConsensusPlay({
      choiceA: res.choiceA,
      choiceB: res.choiceB,
      currentVoter: res.currentVoter,
      isFinished: false,
    });
  }

  handleBonusConsensusVote(target) {
    const choice = target.getAttribute('data-choice');
    const res = this.bonusGamesManager.submitConsensusVote({
      players: this.state.players,
      choice,
    });
    if (res.isFinished) {
      this.bonusGameView.renderConsensusPlay({
        isFinished: true,
        result: res,
      });
    } else {
      this.bonusGameView.renderConsensusPlay({
        choiceA: this.bonusGamesManager.consensusChoiceA,
        choiceB: this.bonusGamesManager.consensusChoiceB,
        currentVoter: res.nextVoter,
        isFinished: false,
      });
    }
  }

  async handleBonusConsensusNext() {
    await this.startConsensus();
  }

  async startConfessional() {
    const res = await this.bonusGamesManager.startConfessional({
      players: this.state.players,
      lang: this.state.selectedLang,
    });
    this.bonusGameView.renderConfessionalPlay({
      prompt: res.prompt,
      currentVoter: res.currentVoter,
      isFinished: false,
    });
  }

  handleBonusConfessionalVote(target) {
    const done = target.getAttribute('data-done') === 'true';
    const res = this.bonusGamesManager.submitConfession({
      players: this.state.players,
      done,
    });
    if (res.isFinished) {
      this.bonusGameView.renderConfessionalPlay({
        isFinished: true,
        result: res,
      });
    } else {
      this.bonusGameView.renderConfessionalPlay({
        prompt: this.bonusGamesManager.confessionalPrompt,
        currentVoter: res.nextVoter,
        isFinished: false,
      });
    }
  }

  async handleBonusConfessionalNext() {
    await this.startConfessional();
  }

  async startSurvival() {
    const res = await this.bonusGamesManager.startSurvival({
      players: this.state.players,
      lang: this.state.selectedLang,
    });
    this.bonusGameView.renderSurvivalPlay({
      currentPlayer: res.currentPlayer,
      challenge: res.challenge,
      lives: res.lives,
      players: this.state.players,
      isFinished: res.isFinished,
      winner: res.winner,
    });
  }

  async handleBonusSurvivalResult(target) {
    const success = target.getAttribute('data-success') === 'true';
    const res = await this.bonusGamesManager.resolveSurvivalTurn({
      success,
      players: this.state.players,
      lang: this.state.selectedLang,
    });
    this.bonusGameView.renderSurvivalPlay({
      currentPlayer: res.currentPlayer,
      challenge: res.challenge,
      lives: res.lives,
      players: this.state.players,
      isFinished: res.isFinished,
      winner: res.winner,
    });
  }

  async handleBonusSurvivalRestart() {
    await this.startSurvival();
  }

  // ==================== SPICY HANDLERS ====================
  async handleSelectSpicyGame(target) {
    const spicyId = target.getAttribute('data-spicy');
    await this.startSelectedSpicyGame(spicyId);
  }

  async startSelectedSpicyGame(spicyId) {
    if (!this.state.hasEnoughPlayers(2)) {
      this.showError(this.i18n.t('errors.minPlayers', { count: 2 }));
      return;
    }
    this.screenManager.navigateToBonusPlay();

    switch (spicyId) {
      case 'spicy_thermostat':
        await this.startSpicyThermostat();
        break;
      case 'spicy_strip':
        await this.startSpicyStrip();
        break;
      case 'spicy_telepathy':
        await this.startSpicyTelepathy();
        break;
      case 'spicy_seven':
        await this.startSpicySeven();
        break;
      case 'spicy_confession':
        await this.startSpicyConfession();
        break;
      case 'spicy_roulette':
        this.startSpicyRoulette();
        break;
      default:
        break;
    }
  }

  async startSpicyThermostat() {
    const res = await this.bonusGamesManager.startSpicyThermostat({
      players: this.state.players,
      lang: this.state.selectedLang,
    });
    this.bonusGameView.renderSpicyThermostatPlay({
      level: res.level,
      player: res.player,
      challenge: res.challenge,
      isMaxLevel: res.isMaxLevel,
    });
  }

  async handleBonusSpicyThermoNext() {
    const res = await this.bonusGamesManager.nextThermostatTurn({
      players: this.state.players,
      lang: this.state.selectedLang,
      advanceLevel: true,
    });
    this.bonusGameView.renderSpicyThermostatPlay({
      level: res.level,
      player: res.player,
      challenge: res.challenge,
      isMaxLevel: res.isMaxLevel,
    });
  }

  async handleBonusSpicyThermoPass() {
    const res = await this.bonusGamesManager.nextThermostatTurn({
      players: this.state.players,
      lang: this.state.selectedLang,
      advanceLevel: false,
    });
    this.bonusGameView.renderSpicyThermostatPlay({
      level: res.level,
      player: res.player,
      challenge: res.challenge,
      isMaxLevel: res.isMaxLevel,
    });
  }

  async handleBonusSpicyThermoRestart() {
    await this.startSpicyThermostat();
  }

  async startSpicyStrip() {
    const res = await this.bonusGamesManager.startSpicyStrip({
      players: this.state.players,
      lang: this.state.selectedLang,
    });
    this.bonusGameView.renderSpicyStripPlay({
      currentPlayer: res.currentPlayer,
      challenge: res.challenge,
      clothes: res.clothes,
      players: this.state.players,
      isFinished: false,
      winner: null,
    });
  }

  async handleBonusSpicyStripResolve(target) {
    const strip = target.getAttribute('data-strip') === 'true';
    const res = await this.bonusGamesManager.resolveSpicyStrip({
      strip,
      players: this.state.players,
      lang: this.state.selectedLang,
    });
    this.bonusGameView.renderSpicyStripPlay({
      currentPlayer: res.currentPlayer,
      challenge: res.challenge,
      clothes: res.clothes,
      players: this.state.players,
      isFinished: res.isFinished,
      winner: res.winner,
    });
  }

  async handleBonusSpicyStripRestart() {
    await this.startSpicyStrip();
  }

  async startSpicyTelepathy() {
    const res = await this.bonusGamesManager.startSpicyTelepathy({
      players: this.state.players,
      lang: this.state.selectedLang,
    });
    this.bonusGameView.renderSpicyTelepathyPlay({
      step: res.step,
      chooser: res.chooser,
      guesser: res.guesser,
      choiceA: res.choiceA,
      choiceB: res.choiceB,
      isFinished: false,
      result: null,
    });
  }

  handleBonusSpicyTelepathyChoice(target) {
    const choice = target.getAttribute('data-choice');
    const res = this.bonusGamesManager.submitSpicyTelepathyChoice(choice);
    this.bonusGameView.renderSpicyTelepathyPlay({
      step: res.step,
      chooser: res.chooser,
      guesser: res.guesser,
      choiceA: res.choiceA,
      choiceB: res.choiceB,
      isFinished: false,
      result: null,
    });
  }

  handleBonusSpicyTelepathyGuess(target) {
    const guess = target.getAttribute('data-choice');
    const res = this.bonusGamesManager.submitSpicyTelepathyGuess(guess);
    this.bonusGameView.renderSpicyTelepathyPlay({
      step: 'result',
      chooser: res.chooser,
      guesser: res.guesser,
      choiceA: res.choiceA,
      choiceB: res.choiceB,
      isFinished: true,
      result: res,
    });
  }

  async handleBonusSpicyTelepathyNext() {
    await this.startSpicyTelepathy();
  }

  async startSpicySeven() {
    const res = await this.bonusGamesManager.startSpicySeven({
      players: this.state.players,
      lang: this.state.selectedLang,
    });
    this.bonusGameView.renderSpicySevenPlay({
      player: res.player,
      question: res.question,
    });
  }

  handleBonusSpicySevenStartTimer() {
    const timerEl = document.getElementById('spicy-seven-timer');
    const startBtn = document.getElementById('btn-spicy-start-timer');
    if (!timerEl) return;
    timerEl.classList.remove('hidden');
    if (startBtn) startBtn.classList.add('hidden');

    let remaining = 7;
    timerEl.textContent = String(remaining);
    clearInterval(this._spicyTimer);
    this._spicyTimer = setInterval(() => {
      this.view.audio.tick();
      remaining--;
      if (remaining <= 0) {
        clearInterval(this._spicyTimer);
        this._spicyTimer = null;
        timerEl.textContent = this.i18n.t('game.finished');
        this.view.audio.ring();
        if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
        return;
      }
      timerEl.textContent = String(remaining);
    }, 1000);
  }

  async handleBonusSpicySevenNext() {
    clearInterval(this._spicyTimer);
    this._spicyTimer = null;
    await this.startSpicySeven();
  }

  async startSpicyConfession() {
    const res = await this.bonusGamesManager.startSpicyConfession({
      players: this.state.players,
      lang: this.state.selectedLang,
    });
    this.bonusGameView.renderSpicyConfessionPlay({
      prompt: res.prompt,
    });
  }

  handleBonusSpicyConfessionVote(target) {
    const done = target.getAttribute('data-done') === 'true';
    const res = this.bonusGamesManager.submitSpicyConfession({
      done,
      players: this.state.players,
    });
    if (res.isFinished) {
      this.bonusGameView.renderSpicyConfessionPlay({
        prompt: res.prompt,
        currentVoter: null,
        isFinished: true,
        answers: res.answers,
      });
    } else {
      this.bonusGameView.renderSpicyConfessionPlay({
        prompt: res.prompt,
        currentVoter: res.nextVoter,
        isFinished: false,
        answers: [],
      });
    }
  }

  async handleBonusSpicyConfessionNext() {
    await this.startSpicyConfession();
  }

  startSpicyRoulette() {
    const res = this.bonusGamesManager.startSpicyRoulette({
      players: this.state.players,
      lang: this.state.selectedLang,
    });
    this.bonusGameView.renderSpicyRoulettePlay({
      giver: res.giver,
      receiver: res.receiver,
      action: res.action,
      zone: res.zone,
      timer: res.timer,
    });
  }

  handleBonusSpicyRouletteStartTimer(target) {
    const timerEl = document.getElementById('spicy-roulette-timer');
    const startBtn = document.getElementById('btn-spicy-roulette-timer');
    if (!timerEl) return;
    timerEl.classList.remove('hidden');
    if (startBtn) startBtn.classList.add('hidden');

    const duration = Number(target.getAttribute('data-timer')) || 30;
    let remaining = duration;
    timerEl.textContent = `${remaining}s`;
    clearInterval(this._spicyTimer);
    this._spicyTimer = setInterval(() => {
      this.view.audio.tick();
      remaining--;
      if (remaining <= 0) {
        clearInterval(this._spicyTimer);
        this._spicyTimer = null;
        timerEl.textContent = this.i18n.t('game.finished');
        this.view.audio.ring();
        if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
        return;
      }
      timerEl.textContent = `${remaining}s`;
    }, 1000);
  }

  handleBonusSpicyRouletteNext() {
    clearInterval(this._spicyTimer);
    this._spicyTimer = null;
    this.startSpicyRoulette();
  }

  handleBackMode() {
    this.screenManager.goBack();
  }

  handleBackBonusGames() {
    if (this._spicyTimer) {
      clearInterval(this._spicyTimer);
      this._spicyTimer = null;
    }
    this.bonusGamesManager?.clearTimers();
    this.screenManager.goBack();
  }

  persistPreferences() {
    this.preferencesManager.persist();
  }

  showError(message) {
    this.view.showError(message);
    clearTimeout(this._errorTimeout);
    this._errorTimeout = setTimeout(() => this.view.hideError(), ERROR_DISPLAY_DURATION_MS);
  }
}

const CLICK_ACTIONS = {
  'add-player': 'handleAddPlayer',
  'start-game': 'handleStartGame',
  'remove-player': 'handleRemovePlayer',
  'select-mode': 'handleModeSelected',
  'select-intensity': 'handleIntensitySelected',
  'next-round': 'handleNextRound',
  'back-lobby': 'handleBackToLobby',
  'impostor-start': 'handleImpostorStart',
  'impostor-dec-impostors': 'handleImpostorDecImpostors',
  'impostor-inc-impostors': 'handleImpostorIncImpostors',
  'impostor-dec-white': 'handleImpostorDecWhite',
  'impostor-inc-white': 'handleImpostorIncWhite',
  'impostor-reveal': 'handleImpostorReveal',
  'impostor-next': 'handleImpostorNext',
  'impostor-finish': 'handleImpostorFinish',
  'impostor-accuse': 'handleImpostorAccuse',
  'toggle-auto-read': 'handleToggleAutoRead',
  'start-seven-timer': 'handleStartSevenTimer',
  'quiz-answer': 'handleQuizAnswer',
  'random-confirm': 'handleRandomConfirm',
  'go-lobby': 'handleGoLobby',
  'go-card-games': 'handleGoCardGames',
  'select-card-game': 'handleSelectCardGame',
  'select-bonus-game': 'handleSelectBonusGame',
  'bonus-bomb-pass': 'handleBonusBombPass',
  'bonus-bomb-restart': 'handleBonusBombRestart',
  'bonus-court-guilty': 'handleBonusCourtGuilty',
  'bonus-court-innocent': 'handleBonusCourtInnocent',
  'bonus-court-verdict': 'handleBonusCourtVerdict',
  'bonus-court-next': 'handleBonusCourtNext',
  'bonus-barometer-submit': 'handleBonusBarometerSubmit',
  'bonus-barometer-next': 'handleBonusBarometerNext',
  'bonus-consensus-vote': 'handleBonusConsensusVote',
  'bonus-consensus-next': 'handleBonusConsensusNext',
  'bonus-confessional-vote': 'handleBonusConfessionalVote',
  'bonus-confessional-next': 'handleBonusConfessionalNext',
  'bonus-survival-result': 'handleBonusSurvivalResult',
  'bonus-survival-restart': 'handleBonusSurvivalRestart',
  'select-spicy-game': 'handleSelectSpicyGame',
  'bonus-spicy-thermo-next': 'handleBonusSpicyThermoNext',
  'bonus-spicy-thermo-pass': 'handleBonusSpicyThermoPass',
  'bonus-spicy-thermo-restart': 'handleBonusSpicyThermoRestart',
  'bonus-spicy-strip-resolve': 'handleBonusSpicyStripResolve',
  'bonus-spicy-strip-restart': 'handleBonusSpicyStripRestart',
  'bonus-spicy-telepathy-choice': 'handleBonusSpicyTelepathyChoice',
  'bonus-spicy-telepathy-guess': 'handleBonusSpicyTelepathyGuess',
  'bonus-spicy-telepathy-next': 'handleBonusSpicyTelepathyNext',
  'bonus-spicy-seven-start-timer': 'handleBonusSpicySevenStartTimer',
  'bonus-spicy-seven-next': 'handleBonusSpicySevenNext',
  'bonus-spicy-confession-vote': 'handleBonusSpicyConfessionVote',
  'bonus-spicy-confession-next': 'handleBonusSpicyConfessionNext',
  'bonus-spicy-roulette-start-timer': 'handleBonusSpicyRouletteStartTimer',
  'bonus-spicy-roulette-next': 'handleBonusSpicyRouletteNext',
  'back-mode': 'handleBackMode',
  'back-bonus-games': 'handleBackBonusGames',
  'back-home': 'handleBackHome',
  'back-card-games': 'handleBackCardGames',
  'install-app': 'handleInstallApp',
};

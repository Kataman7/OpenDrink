import { GameMode } from '../domain/game-mode.js';
import { RoundRenderer } from './round-renderer.js';
import { CARD_GAMES } from './card-games.js';
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
    this._quizLocked = false;
    this._errorTimeout = null;
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
    const handlerName = MODE_HANDLERS[mode] || MODE_HANDLERS._default;
    await this[handlerName]();
  }

  async _handleModeRandom() {
    this.screenManager.navigateToModeRandom();
    this.view.renderModeRandomList();
  }

  async _handleModeImpostor() {
    this.view.renderImpostorSettings({
      playerCount: this.state.players.length,
      impostorCount: this.state.impostorCount,
      mrWhiteCount: this.state.mrWhiteCount,
    });
    this.screenManager.navigateToImpostorSettings();
  }

  async _handleModeNoIntensity() {
    this.screenManager.navigateToGameScreen();
    await this.requestNextRound();
  }

  async _handleModeDefault() {
    if (this.state.selectedGameMode === GameMode.TEAM_BATTLE) {
      this.state.buildTeams();
    }
    this.screenManager.navigateToIntensitySelection();
  }

  handleGoLobby() {
    this.screenManager.navigateToLobby();
  }

  handleGoCardGames() {
    this.screenManager.navigateToCardGames();
    const lang = this.state.selectedLang;
    this.view.renderCardGamesList(CARD_GAMES, lang);
  }

  handleSelectCardGame(target) {
    const gameId = target.getAttribute('data-game');
    const game = CARD_GAMES.find(g => g.id === gameId);
    if (!game) return;
    const lang = this.state.selectedLang;
    const rules = game.rules[lang] || game.rules.en;
    this.screenManager.navigateToCardGameDetail();
    this.view.renderCardGameDetail(game.title, rules);
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
      const round = await this.drawQuestionUseCase.execute(this.state.buildRoundRequest());
      this.roundRenderer.renderRound(round);
      this.state.setPreviousPlayer(round.player.id);
    } catch (error) {
      this.showError(error.message);
    }
  }

  handleBackToLobby() {
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
      hasNextPlayer: this.impostorManager.hasMorePlayers(),
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
      this.view.renderImpostorAccusationResult(this.i18n.t('impostor.impostorFound'));
      this.impostorManager.finishRound();
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

  persistPreferences() {
    this.preferencesManager.persist();
  }

  showError(message) {
    this.view.showError(message);
    clearTimeout(this._errorTimeout);
    this._errorTimeout = setTimeout(() => this.view.hideError(), ERROR_DISPLAY_DURATION_MS);
  }
}

const MODE_HANDLERS = {
  [GameMode.RANDOM]: '_handleModeRandom',
  [GameMode.IMPOSTOR]: '_handleModeImpostor',
  [GameMode.PICOLO]: '_handleModeNoIntensity',
  [GameMode.TRUTH_DARE]: '_handleModeNoIntensity',
  _default: '_handleModeDefault',
};

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
  'back-home': 'handleBackHome',
  'back-card-games': 'handleBackCardGames',
};

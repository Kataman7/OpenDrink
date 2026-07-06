import { GameMode } from '../domain/value-objects.js';
import { QuestionTextPersonalizer } from './question-text-personalizer.js';
import { DormellesPersonalizer } from './dormelles-personalizer.js';
import { TeamBattlePersonalizer } from './team-battle-personalizer.js';
import { PicoloPersonalizer } from './picolo-personalizer.js';
import { AntoinePersonalizer } from './antoine-personalizer.js';

const CLICK_ACTIONS = {
  'add-player': 'handleAddPlayer',
  'start-game': 'handleStartGame',
  'remove-player': 'handleRemovePlayer',
  'select-mode': 'handleModeSelected',
  'select-intensity': 'handleIntensitySelected',
  'next-round': 'handleNextRound',
  'back-lobby': 'handleBackToLobby',
  'impostor-reveal': 'handleImpostorReveal',
  'impostor-next': 'handleImpostorNext',
  'impostor-finish': 'handleImpostorFinish',
  'impostor-accuse': 'handleImpostorAccuse',
  'toggle-auto-read': 'handleToggleAutoRead',
  'quiz-answer': 'handleQuizAnswer',
  'random-confirm': 'handleRandomConfirm',
};

export class GameEventHandler {
  constructor(dependencies) {
    this.view = dependencies.view;
    this.state = dependencies.state;
    this.playerManager = dependencies.playerManager;
    this.screenManager = dependencies.screenManager;
    this.impostorManager = dependencies.impostorManager;
    this.drawQuestionUseCase = dependencies.drawQuestionUseCase;
    this.i18n = dependencies.i18n;
    this.preferencesManager = dependencies.preferencesManager;
    this.roundLabelBuilder = dependencies.roundLabelBuilder;
    this.initializeDatabaseUseCase = dependencies.initializeDatabaseUseCase;
    this.addPlayerUseCase = dependencies.addPlayerUseCase;
    this.removePlayerUseCase = dependencies.removePlayerUseCase;
    this.textToSpeech = dependencies.textToSpeech;
  }

  bind() {
    document.addEventListener('click', e => this.onClick(e));
    document.addEventListener('change', e => this.onChange(e));
    document.addEventListener('keydown', e => this.onKeyDown(e));
  }

  async initialize() {
    this.preferencesManager.restore();
    await this.initializeDatabaseUseCase.execute();
    await this.restorePlayers();
    this.screenManager.renderCurrentScreen();
    this.screenManager.renderPlayers();
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

    if (mode === GameMode.RANDOM) {
      this.screenManager.navigateToModeRandom();
      this.view.renderModeRandomList();
      return;
    }

    if (mode === GameMode.IMPOSTOR) {
      await this.startImpostorRound();
      return;
    }

    if (mode === GameMode.PICOLO || mode === GameMode.TRUTH_DARE) {
      this.screenManager.navigateToGameScreen();
      await this.requestNextRound();
      return;
    }

    if (mode === GameMode.TEAM_BATTLE) {
      this.state.buildTeams();
    }

    this.screenManager.navigateToIntensitySelection();
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
    await this.requestNextRound();
  }

  async requestNextRound() {
    try {
      if (this.state.selectedGameMode === GameMode.RANDOM) {
        this.state.setCurrentRoundMode(this.state.pickRandomRoundMode());
      }
      const round = await this.drawQuestionUseCase.execute(this.state.buildRoundRequest());
      this.renderRound(round);
      this.state.setPreviousPlayer(round.player.id);
    } catch (error) {
      this.showError(error.message);
    }
  }

  handleBackToLobby() {
    this.view.clearSevenTimer();
    this.state.resetRoundSelection();
    this.impostorManager.finishRound();
    this.screenManager.navigateToLobby();
  }

  handleImpostorReveal() {
    this.impostorManager.revealWord();
    this.view.renderImpostorRevealedWord({
      word: this.impostorManager.getCurrentWord(),
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

    const isImpostor = this.impostorManager.isImpostorPlayer(playerId);

    if (isImpostor) {
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

  renderRound({ player, question }) {
    const personalizer = new QuestionTextPersonalizer(this.state.players);
    const label = this.roundLabelBuilder.build(
      this.state.buildRoundLabelInput(question.promptKind)
    );
    const showPlayerName = this.state.shouldDisplayRoundPlayerName();

    if (question.promptKind === 'would_you_rather') {
      this.view.renderRound({
        player,
        label,
        showPlayerName,
        choiceA: personalizer.personalize(question.choiceA, player.name),
        choiceB: personalizer.personalize(question.choiceB, player.name),
      });
    } else if (question.promptKind === 'quiz') {
      this.view.renderRound({
        player,
        label,
        showPlayerName: false,
        sentence: question.sentence,
        options: question.options,
      });
    } else if (question.promptKind === 'dormelles') {
      const dormellesPersonalizer = new DormellesPersonalizer();
      const personalized = dormellesPersonalizer.personalize(
        question.sentence,
        player.name,
        this.state.players
      );
      this.view.renderRound({
        player,
        label,
        showPlayerName,
        sentence: personalized,
      });
    } else if (question.promptKind && question.promptKind.startsWith('picolo_')) {
      const picoloPersonalizer = new PicoloPersonalizer();
      const personalized = picoloPersonalizer.personalize(
        question.sentence,
        player,
        this.state.players
      );
      this.view.renderRound({
        player,
        label,
        showPlayerName,
        sentence: personalized,
      });
    } else if (question.promptKind && question.promptKind.startsWith('truth_dare_')) {
      const antoinePersonalizer = new AntoinePersonalizer();
      const personalized = antoinePersonalizer.personalize(
        question.sentence,
        player,
        this.state.players
      );
      this.view.renderRound({
        player,
        label,
        showPlayerName,
        sentence: personalized,
      });
    } else if (question.promptKind && question.promptKind.startsWith('team_battle_')) {
      const battlePersonalizer = new TeamBattlePersonalizer();
      const personalized = battlePersonalizer.personalize(
        question.sentence,
        player,
        this.state.players,
        this.state.teamOnePlayerIds,
        this.state.teamTwoPlayerIds
      );
      this.view.renderRound({
        player,
        label,
        showPlayerName,
        sentence: personalized,
      });
    } else {
      const sentence = personalizer.personalize(question.sentence, player.name);
      const mode = this.state.currentRoundMode || this.state.selectedGameMode;
      if (mode === 'seven_seconds') {
        this.view.renderSevenSeconds({ player, label, sentence });
      } else {
        this.view.renderRound({ player, label, showPlayerName, sentence });
      }
    }

    if (this.textToSpeech.isAutoReadEnabled()) {
      this.handleReadQuestion();
    }
  }

  handleReadQuestion() {
    const text = this.view.getQuestionText();
    if (!text) return;
    const gameMode = this.state.selectedGameMode;
    const lang = this.state.selectedLang;
    this.textToSpeech.speak(text, gameMode, lang, this.i18n);
  }

  handleToggleAutoRead() {
    const enabled = this.textToSpeech.toggleAutoRead();
    this.view.updateAutoReadButton(enabled);
    if (enabled) {
      this.handleReadQuestion();
    }
  }

  handleQuizAnswer(target) {
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
    this.preferencesManager.persist(this.state);
  }

  showError(message) {
    this.view.showError(message);
    clearTimeout(this._errorTimeout);
    this._errorTimeout = setTimeout(() => this.view.hideError(), 3000);
  }
}

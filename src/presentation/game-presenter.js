import { InitializeDatabaseUseCase } from '../application/usecases/initialize-database.js';
import { AddPlayerUseCase } from '../application/usecases/add-player.js';
import { DrawQuestionUseCase } from '../application/usecases/draw-question.js';
import { RemovePlayerUseCase } from '../application/usecases/remove-player.js';
import { GetImpostorWordUseCase } from '../application/usecases/get-impostor-word.js';
import { GameMode } from '../domain/value-objects.js';
import {
  SqlJsDatabaseAdapter,
  SqlJsQuestionRepositoryAdapter,
  SqlJsPlayerRepositoryAdapter,
  QuestionsDatabaseAdapter,
  PlayersDatabaseAdapter,
} from '../infrastructure/sqlite-adapter.js';
import { SUPPORTED_LANGUAGES } from '../domain/value-objects.js';
import { PreferencesStore } from './preferences-store.js';
import { QuestionTextPersonalizer } from './question-text-personalizer.js';
import { I18n } from './i18n.js';
import { GameView } from './game-view.js';
import { RoundLabelBuilder } from './round-label-builder.js';
import { ErrorMessageResolver } from './error-message-resolver.js';
import { GameState } from './game-state.js';

const SCREENS = {
  lobby: 'lobby',
  mode: 'mode',
  intensity: 'intensity',
  game: 'game',
  impostorReveal: 'impostor_reveal',
};

const MIN_PLAYERS_COUNT = 2;
const ERROR_TOAST_DELAY_MS = 3000;

const CLICK_ACTIONS = {
  'add-player': 'onAddPlayerRequested',
  'start-game': 'onStartGameRequested',
  'remove-player': 'onRemovePlayerRequested',
  'select-mode': 'onModeSelected',
  'select-intensity': 'onIntensitySelected',
  'next-round': 'onNextRoundRequested',
  'back-lobby': 'onBackToLobbyRequested',
  'impostor-reveal': 'onImpostorRevealRequested',
  'impostor-next': 'onImpostorNextPlayerRequested',
  'impostor-finish': 'onImpostorFinishRequested',
  'impostor-accuse': 'onImpostorAccuseRequested',
};

export class GamePresenter {
  constructor() {
    this.state = new GameState({ screens: SCREENS });
    this.i18n = new I18n();
    this.preferencesStore = new PreferencesStore();
    this.errorMessageResolver = new ErrorMessageResolver(this.i18n);
    this.roundLabelBuilder = new RoundLabelBuilder(this.i18n);
    this.view = new GameView({ i18n: this.i18n });

    this.setupDependencies();
    this.bindEvents();
  }

  setupDependencies() {
    const questionsDb = new QuestionsDatabaseAdapter();
    const playersDb = new PlayersDatabaseAdapter();
    const databasePort = new SqlJsDatabaseAdapter(questionsDb, playersDb);
    const questionRepositoryPort = new SqlJsQuestionRepositoryAdapter(questionsDb);
    const playerRepositoryPort = new SqlJsPlayerRepositoryAdapter(playersDb);

    this.initializeDatabaseUseCase = new InitializeDatabaseUseCase({ databasePort });
    this.addPlayerUseCase = new AddPlayerUseCase({ playerRepositoryPort });
    this.removePlayerUseCase = new RemovePlayerUseCase({ playerRepositoryPort });
    this.drawQuestionUseCase = new DrawQuestionUseCase({ playerRepositoryPort, questionRepositoryPort });
    this.getImpostorWordUseCase = new GetImpostorWordUseCase({ questionRepositoryPort });
  }

  bindEvents() {
    document.addEventListener('click', (event) => {
      this.onClick(event);
    });
    document.addEventListener('change', (event) => {
      this.onChange(event);
    });
    document.addEventListener('keydown', (event) => {
      this.onKeyDown(event);
    });
  }

  async initialize() {
    this.restorePreferences();
    this.view.renderLanguageSelector({
      languages: SUPPORTED_LANGUAGES,
      selectedLang: this.state.selectedLang,
    });
    this.view.applyStaticTranslations(this.state.selectedLang);
    await this.runSafely(() => this.initializeDatabaseUseCase.execute());
    await this.restorePlayers();
    this.renderCurrentScreen();
    this.renderPlayers();
  }

  restorePreferences() {
    const preferences = this.preferencesStore.load();
    this.state.applyPreferences(preferences);
    this.i18n.setLanguage(this.state.selectedLang);
  }

  async restorePlayers() {
    for (const playerName of this.state.consumeRestoredPlayerNames()) {
      await this.addPlayerByName(playerName);
    }
    this.persistPreferences();
  }

  persistPreferences() {
    this.preferencesStore.save(this.state.toPreferencesPayload());
  }

  async onClick(event) {
    const target = this.view.findActionTarget(event.target);
    if (!target) return;
    const action = target.getAttribute('data-action');
    await this.dispatchClickAction(action, target);
  }

  async dispatchClickAction(action, target) {
    const methodName = CLICK_ACTIONS[action];
    if (!methodName) return;
    await this[methodName](target);
  }

  onChange(event) {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    if (target.id !== 'lang-select') return;

    this.state.updateLanguage(this.view.readSelectedLanguage());
    this.i18n.setLanguage(this.state.selectedLang);
    this.view.applyStaticTranslations(this.state.selectedLang);
    this.renderPlayers();
    this.persistPreferences();
  }

  async onKeyDown(event) {
    if (event.key !== 'Enter') return;
    if (!this.state.isLobbyScreen()) return;
    await this.onAddPlayerRequested();
  }

  async onAddPlayerRequested() {
    const playerName = this.view.readPlayerInput();
    if (!playerName) return;

    await this.runSafely(async () => {
      await this.addPlayerByName(playerName);
      this.view.clearPlayerInput();
      this.renderPlayers();
      this.persistPreferences();
    });
  }

  async addPlayerByName(playerName) {
    const player = await this.addPlayerUseCase.execute({ name: playerName });
    this.state.addPlayer(player);
  }

  async onStartGameRequested() {
    if (this.state.hasEnoughPlayers(MIN_PLAYERS_COUNT)) {
      this.switchScreen(SCREENS.mode);
      return;
    }
    this.showTranslatedError('errors.minPlayers', { count: MIN_PLAYERS_COUNT });
  }

  async onRemovePlayerRequested(target) {
    const playerId = Number(target.getAttribute('data-player-id'));
    if (!playerId) return;

    await this.runSafely(async () => {
      await this.removePlayerUseCase.execute({ playerId });
      this.state.removePlayerById(playerId);
      this.renderPlayers();
      this.persistPreferences();
    });
  }

  async onModeSelected(target) {
    this.state.selectMode(target.getAttribute('data-mode'));
    if (this.state.selectedGameMode === GameMode.IMPOSTOR) {
      await this.startImpostorRound();
      return;
    }
    this.switchScreen(SCREENS.intensity);
  }

  async startImpostorRound() {
    const starterId = this.state.pickRandomStarterId();
    if (!starterId) return;

    await this.runSafely(async () => {
      const { normalWord, impostorWord } = await this.getImpostorWordUseCase.execute({
        lang: this.state.selectedLang,
      });

      this.state.initializeImpostorRound({
        starterId,
        orderedPlayerIds: this.state.buildImpostorOrder(starterId),
        impostorPlayerId: this.state.pickRandomImpostorId(),
        normalWord,
        impostorWord,
      });

      this.switchScreen(SCREENS.impostorReveal);
      this.renderImpostorPassStep();
    });
  }

  async onIntensitySelected(target) {
    this.state.selectIntensity(target.getAttribute('data-intensity'));
    this.switchScreen(SCREENS.game);
    await this.onNextRoundRequested();
  }

  async onNextRoundRequested() {
    await this.runSafely(async () => {
      const round = await this.drawQuestionUseCase.execute(this.state.buildRoundRequest());
      this.renderRound(round);
      this.state.setPreviousPlayer(round.player.id);
    });
  }

  async onBackToLobbyRequested() {
    this.state.resetRoundSelection();
    this.switchScreen(SCREENS.lobby);
  }

  async onImpostorRevealRequested() {
    this.state.setImpostorWordRevealed(true);
    this.view.renderImpostorRevealedWord({
      word: this.state.getCurrentImpostorWord(),
      hasNextPlayer: this.state.hasMoreImpostorPlayers(),
    });
  }

  async onImpostorNextPlayerRequested() {
    this.state.moveToNextImpostorPlayer();
    this.renderImpostorPassStep();
  }

  async onImpostorFinishRequested() {
    this.state.finishImpostorRound();
    this.view.renderImpostorDiscussionState();
    this.view.renderImpostorAccusationList(this.state.getAccusationPlayers());
  }

  async onImpostorAccuseRequested(target) {
    const playerId = Number(target.getAttribute('data-player-id'));
    if (!playerId) return;

    if (this.state.isImpostorPlayer(playerId)) {
      this.view.renderImpostorAccusationResult(this.i18n.t('impostor.impostorFound'));
      this.state.finishImpostorRound();
      return;
    }

    this.state.removeAccusationPlayer(playerId);
    this.view.renderImpostorAccusationList(this.state.getAccusationPlayers());
    this.view.renderImpostorAccusationResult(this.i18n.t('impostor.notImpostor'));
  }

  renderImpostorPassStep() {
    const currentPlayer = this.state.getCurrentImpostorPlayer();
    if (!currentPlayer) return;
    this.view.renderImpostorPassStep({
      playerName: currentPlayer.name,
      hint: this.i18n.t('impostor.revealWord'),
    });
  }

  renderRound({ player, question }) {
    const personalizer = new QuestionTextPersonalizer(this.state.players);
    const label = this.roundLabelBuilder.build(this.state.buildRoundLabelInput(question.promptKind));
    const showPlayerName = this.state.shouldDisplayRoundPlayerName();

    if (question.promptKind === 'would_you_rather') {
      this.view.renderRound({
        player,
        label,
        showPlayerName,
        choiceA: personalizer.personalize(question.choiceA, player.name),
        choiceB: personalizer.personalize(question.choiceB, player.name),
      });
      return;
    }

    this.view.renderRound({
      player,
      label,
      showPlayerName,
      sentence: personalizer.personalize(question.sentence, player.name),
    });
  }

  renderPlayers() {
    this.view.renderPlayerList(this.state.players);
  }

  switchScreen(screen) {
    this.state.screen = screen;
    this.view.hideError();
    this.renderCurrentScreen();
    if (screen === SCREENS.lobby) this.renderPlayers();
  }

  renderCurrentScreen() {
    this.view.renderScreen(this.state.screen);
  }

  showTranslatedError(key, params = {}) {
    this.showError(this.i18n.t(key, params));
  }

  showError(message) {
    this.view.showError(message);
    setTimeout(() => this.view.hideError(), ERROR_TOAST_DELAY_MS);
  }

  async runSafely(work) {
    try {
      await work();
    } catch (error) {
      this.showError(this.errorMessageResolver.resolve(error));
    }
  }
}

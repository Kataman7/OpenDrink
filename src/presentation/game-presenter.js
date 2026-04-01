import { InitializeDatabaseUseCase } from '../application/usecases/initialize-database.js';
import { AddPlayerUseCase } from '../application/usecases/add-player.js';
import { DrawQuestionUseCase } from '../application/usecases/draw-question.js';
import { RemovePlayerUseCase } from '../application/usecases/remove-player.js';
import {
  SqlJsDatabaseAdapter,
  SqlJsQuestionRepositoryAdapter,
  SqlJsPlayerRepositoryAdapter,
  QuestionsDatabaseAdapter,
  PlayersDatabaseAdapter,
} from '../infrastructure/sqlite-adapter.js';
import { SUPPORTED_LANGUAGES, QuestionIntensity } from '../domain/value-objects.js';
import { PreferencesStore } from './preferences-store.js';
import { QuestionTextPersonalizer } from './question-text-personalizer.js';

const SCREEN_LOBBY = 'lobby';
const SCREEN_MODE = 'mode';
const SCREEN_INTENSITY = 'intensity';
const SCREEN_GAME = 'game';
const MIN_PLAYERS_COUNT = 2;
const ERROR_TOAST_DELAY_MS = 3000;

const MODE_LABELS = {
  never_have_i_ever: 'Never Have I Ever',
  action_truth: 'Truth or Dare',
};

const INTENSITY_LABELS = {
  [QuestionIntensity.SOFT]: 'Soft',
  [QuestionIntensity.HOT]: 'Hot',
  [QuestionIntensity.MIXED]: 'Mixed',
};

export class GamePresenter {
  constructor() {
    this.currentScreen = SCREEN_LOBBY;
    this.selectedGameMode = null;
    this.selectedIntensity = null;
    this.selectedLang = 'en';
    this.players = [];
    this.previousPlayerId = null;
    this.restoredPlayerNames = [];
    this.preferencesStore = new PreferencesStore();

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
  }

  async initialize() {
    this.restorePreferences();
    this.renderLanguageSelector();
    await this.initializeDatabaseUseCase.execute();
    await this.restorePlayers();
    this.render();
  }

  restorePreferences() {
    const preferences = this.preferencesStore.load();
    this.selectedLang = preferences.lang;
    this.restoredPlayerNames = preferences.players;
  }

  persistPreferences() {
    this.preferencesStore.save({
      lang: this.selectedLang,
      players: this.players.map((player) => player.name),
    });
  }

  async restorePlayers() {
    for (const playerName of this.restoredPlayerNames) {
      await this.addPlayerByName(playerName);
    }
    this.persistPreferences();
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

  async onClick(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.id === 'btn-add-player') return this.onAddPlayerClick();
    if (target.id === 'btn-start-game') return this.onStartGameClick();
    if (target.classList.contains('btn-remove-player')) return this.onRemovePlayerClick(target);
    if (target.classList.contains('btn-mode')) return this.onModeClick(target);
    if (target.classList.contains('btn-intensity')) return this.onIntensityClick(target);
    if (target.id === 'btn-next') return this.onNextClick();
    if (target.id === 'btn-back-lobby') return this.onBackToLobbyClick();
  }

  onChange(event) {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    if (target.id !== 'lang-select') return;
    this.selectedLang = target.value;
    this.persistPreferences();
  }

  async onKeyDown(event) {
    if (event.key !== 'Enter') return;
    if (this.currentScreen !== SCREEN_LOBBY) return;
    await this.onAddPlayerClick();
  }

  renderLanguageSelector() {
    const languageSelect = document.getElementById('lang-select');
    languageSelect.innerHTML = SUPPORTED_LANGUAGES
      .map((language) => this.renderLanguageOption(language))
      .join('');
  }

  renderLanguageOption(language) {
    const selectedAttribute = language.code === this.selectedLang ? 'selected' : '';
    return `<option value="${language.code}" ${selectedAttribute}>${language.label}</option>`;
  }

  async onAddPlayerClick() {
    const playerInput = document.getElementById('player-name-input');
    const playerName = playerInput.value.trim();
    if (!playerName) return;

    try {
      await this.addPlayerByName(playerName);
      playerInput.value = '';
      this.renderPlayerList();
      this.persistPreferences();
    } catch (error) {
      this.showError(error.message);
    }
  }

  async addPlayerByName(playerName) {
    const player = await this.addPlayerUseCase.execute({ name: playerName });
    this.players.push(player);
  }

  async onStartGameClick() {
    if (!this.hasEnoughPlayers()) {
      this.showError('Add at least 2 players');
      return;
    }
    this.switchScreen(SCREEN_MODE);
  }

  async onRemovePlayerClick(target) {
    const playerId = Number(target.dataset.playerId);
    if (!playerId) return;

    await this.removePlayerUseCase.execute({ playerId });
    this.players = this.players.filter((player) => player.id !== playerId);

    if (this.previousPlayerId === playerId) {
      this.previousPlayerId = null;
    }

    this.renderPlayerList();
    this.persistPreferences();
  }

  hasEnoughPlayers() {
    return this.players.length >= MIN_PLAYERS_COUNT;
  }

  onModeClick(target) {
    this.selectedGameMode = target.dataset.mode;
    this.switchScreen(SCREEN_INTENSITY);
  }

  async onIntensityClick(target) {
    this.selectedIntensity = target.dataset.intensity;
    this.switchScreen(SCREEN_GAME);
    await this.onNextClick();
  }

  async onNextClick() {
    try {
      const round = await this.drawQuestionUseCase.execute({
        gameMode: this.selectedGameMode,
        intensity: this.selectedIntensity,
        lang: this.selectedLang,
        previousPlayerId: this.previousPlayerId,
      });
      this.renderRound(round);
      this.previousPlayerId = round.player.id;
    } catch (error) {
      this.showError(error.message);
    }
  }

  async onBackToLobbyClick() {
    this.selectedGameMode = null;
    this.selectedIntensity = null;
    this.previousPlayerId = null;
    this.switchScreen(SCREEN_LOBBY);
  }

  switchScreen(screenName) {
    this.currentScreen = screenName;
    this.hideError();
    this.render();
  }

  renderRound({ player, question }) {
    const playerNameElement = document.getElementById('player-name');
    const questionTypeElement = document.getElementById('question-type');
    const questionTextElement = document.getElementById('question-text');

    playerNameElement.textContent = player.name;
    questionTypeElement.textContent = this.buildRoundLabel(question);
    questionTextElement.textContent = this.buildPersonalizedQuestionText(question.sentence, player.name);
  }

  buildRoundLabel(question) {
    const modeLabel = MODE_LABELS[this.selectedGameMode];
    const intensityLabel = INTENSITY_LABELS[this.selectedIntensity];
    if (question.promptKind === 'truth') return `${modeLabel} (Truth) - ${intensityLabel}`;
    if (question.promptKind === 'dare') return `${modeLabel} (Dare) - ${intensityLabel}`;
    return `${modeLabel} - ${intensityLabel}`;
  }

  buildPersonalizedQuestionText(sentence, currentPlayerName) {
    const personalizer = new QuestionTextPersonalizer(this.players);
    return personalizer.personalize(sentence, currentPlayerName);
  }

  renderPlayerList() {
    const playerList = document.getElementById('player-list');
    const playerCount = document.getElementById('player-count');
    playerList.innerHTML = this.players.map((player) => this.renderPlayerTag(player)).join('');
    playerCount.textContent = `${this.players.length} player${this.players.length > 1 ? 's' : ''}`;
  }

  renderPlayerTag(player) {
    return `
      <li class="player-tag" data-player-id="${player.id}">
        <span>${player.name}</span>
        <button class="btn-remove-player" data-player-id="${player.id}" aria-label="Remove ${player.name}">×</button>
      </li>
    `;
  }

  render() {
    this.hideAllScreens();
    this.showCurrentScreen();
    if (this.currentScreen === SCREEN_LOBBY) this.renderPlayerList();
  }

  hideAllScreens() {
    document.querySelectorAll('.screen').forEach((screen) => {
      screen.classList.add('hidden');
    });
  }

  showCurrentScreen() {
    const activeScreen = document.getElementById(`screen-${this.currentScreen}`);
    if (activeScreen) activeScreen.classList.remove('hidden');
  }

  showError(message) {
    const toast = document.getElementById('error-toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), ERROR_TOAST_DELAY_MS);
  }

  hideError() {
    const toast = document.getElementById('error-toast');
    toast.classList.add('hidden');
  }
}

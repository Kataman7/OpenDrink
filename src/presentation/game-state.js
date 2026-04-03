const DEFAULT_LANG = 'en';

// Game modes where the player's name should be hidden during the round
const MODES_WITH_HIDDEN_ROUND_PLAYER = new Set(['would_you_rather', 'who_could', "never_have_i_ever"]);

function createDefaultImpostorState() {
  return {
    starterId: null,
    orderedPlayerIds: [],
    currentIndex: 0,
    impostorPlayerId: null,
    normalWord: '',
    impostorWord: '',
    isWordRevealed: false,
    isFinished: false,
    accusationIds: [],
  };
}

export class GameState {
  constructor({ screens }) {
    this.screens = screens;
    this.screen = screens.lobby;
    this.selectedGameMode = null;
    this.selectedIntensity = null;
    this.selectedLang = DEFAULT_LANG;
    this.players = [];
    this.previousPlayerId = null;
    this.restoredPlayerNames = [];
    this.impostor = createDefaultImpostorState();
  }

  applyPreferences(preferences) {
    this.selectedLang = preferences.lang || DEFAULT_LANG;
    this.restoredPlayerNames = Array.isArray(preferences.players) ? preferences.players : [];
  }

  consumeRestoredPlayerNames() {
    const names = [...this.restoredPlayerNames];
    this.restoredPlayerNames = [];
    return names;
  }

  updateLanguage(lang) {
    this.selectedLang = lang;
  }

  addPlayer(player) {
    this.players.push(player);
  }

  removePlayerById(playerId) {
    this.players = this.players.filter((player) => player.id !== playerId);
    if (this.previousPlayerId === playerId) this.previousPlayerId = null;
  }

  hasEnoughPlayers(minPlayers) {
    return this.players.length >= minPlayers;
  }

  selectMode(mode) {
    this.selectedGameMode = mode;
  }

  selectIntensity(intensity) {
    this.selectedIntensity = intensity;
  }

  setPreviousPlayer(playerId) {
    this.previousPlayerId = playerId;
  }

  switchScreen(screen) {
    this.screen = screen;
  }

  isLobbyScreen() {
    return this.screen === this.screens.lobby;
  }

  resetRoundSelection() {
    this.selectedGameMode = null;
    this.selectedIntensity = null;
    this.previousPlayerId = null;
    this.impostor = createDefaultImpostorState();
  }

  initializeImpostorRound({ starterId, orderedPlayerIds, impostorPlayerId, normalWord, impostorWord }) {
    this.impostor = {
      starterId,
      orderedPlayerIds,
      currentIndex: 0,
      impostorPlayerId,
      normalWord,
      impostorWord,
      isWordRevealed: false,
      isFinished: false,
      accusationIds: [...orderedPlayerIds],
    };
  }

  setImpostorWordRevealed(value) {
    this.impostor.isWordRevealed = value;
  }

  moveToNextImpostorPlayer() {
    this.impostor.currentIndex += 1;
    this.impostor.isWordRevealed = false;
  }

  finishImpostorRound() {
    this.impostor.isFinished = true;
    this.impostor.isWordRevealed = false;
  }

  removeAccusationPlayer(playerId) {
    this.impostor.accusationIds = this.impostor.accusationIds.filter((id) => id !== playerId);
  }

  getCurrentImpostorPlayer() {
    const playerId = this.impostor.orderedPlayerIds[this.impostor.currentIndex];
    return this.players.find((player) => player.id === playerId) || null;
  }

  getNextImpostorPlayer() {
    const nextId = this.impostor.orderedPlayerIds[this.impostor.currentIndex + 1];
    return this.players.find((player) => player.id === nextId) || null;
  }

  isCurrentPlayerImpostor() {
    const currentPlayer = this.getCurrentImpostorPlayer();
    return Boolean(currentPlayer && currentPlayer.id === this.impostor.impostorPlayerId);
  }

  getCurrentImpostorWord() {
    return this.isCurrentPlayerImpostor() ? this.impostor.impostorWord : this.impostor.normalWord;
  }

  hasMoreImpostorPlayers() {
    return this.impostor.currentIndex < this.impostor.orderedPlayerIds.length - 1;
  }

  getAccusationPlayers() {
    return this.impostor.accusationIds
      .map((id) => this.players.find((player) => player.id === id))
      .filter(Boolean);
  }

  isImpostorPlayer(playerId) {
    return playerId === this.impostor.impostorPlayerId;
  }

  buildImpostorOrder(starterId) {
    const ids = this.players.map((player) => player.id);
    const starterIndex = ids.indexOf(starterId);
    if (starterIndex < 0) return ids;
    return [...ids.slice(starterIndex), ...ids.slice(0, starterIndex)];
  }

  pickRandomImpostorId() {
    const ids = this.players.map((player) => player.id);
    const index = Math.floor(Math.random() * ids.length);
    return ids[index];
  }

  pickRandomStarterId() {
    const ids = this.players.map((player) => player.id);
    const index = Math.floor(Math.random() * ids.length);
    return ids[index];
  }

  toPreferencesPayload() {
    return {
      lang: this.selectedLang,
      players: this.players.map((player) => player.name),
    };
  }

  buildRoundRequest() {
    return {
      gameMode: this.selectedGameMode,
      intensity: this.selectedIntensity,
      lang: this.selectedLang,
      previousPlayerId: this.previousPlayerId,
    };
  }

  buildRoundLabelInput(promptKind) {
    return {
      gameMode: this.selectedGameMode,
      intensity: this.selectedIntensity,
      promptKind,
    };
  }

  shouldDisplayRoundPlayerName() {
    return !MODES_WITH_HIDDEN_ROUND_PLAYER.has(this.selectedGameMode);
  }
}

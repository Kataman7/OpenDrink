const DEFAULT_LANG = 'en';

const MODES_WITH_HIDDEN_ROUND_PLAYER = new Set([
  'would_you_rather',
  'who_could',
  'never_have_i_ever',
]);

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
    this.players = this.players.filter(player => player.id !== playerId);
    if (this.previousPlayerId === playerId) {
      this.previousPlayerId = null;
    }
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

  isLobbyScreen() {
    return this.screen === this.screens.lobby;
  }

  resetRoundSelection() {
    this.selectedGameMode = null;
    this.selectedIntensity = null;
    this.previousPlayerId = null;
  }

  toPreferencesPayload() {
    return {
      lang: this.selectedLang,
      players: this.players.map(player => player.name),
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

  getPlayerIds() {
    return this.players.map(player => player.id);
  }

  pickRandomPlayerId() {
    const ids = this.getPlayerIds();
    if (ids.length === 0) return null;
    const index = Math.floor(Math.random() * ids.length);
    return ids[index];
  }

  shouldDisplayRoundPlayerName() {
    return !MODES_WITH_HIDDEN_ROUND_PLAYER.has(this.selectedGameMode);
  }
}

const DEFAULT_LANG = 'en';

export const RANDOM_COMPATIBLE_MODES = [
  { id: 'never_have_i_ever', icon: '🍻', labelKey: 'mode.neverHaveIEver' },
  { id: 'action_truth', icon: '🎭', labelKey: 'mode.truthOrDare' },
  { id: 'would_you_rather', icon: '⚡', labelKey: 'mode.wouldYouRather' },
  { id: 'who_could', icon: '🕵️', labelKey: 'mode.whoCould' },
  { id: 'seven_seconds', icon: '⏱️', labelKey: 'mode.sevenSeconds' },
  { id: 'its_a_10', icon: '💯', labelKey: 'mode.itsA10' },
  { id: 'quiz', icon: '🧠', labelKey: 'mode.quiz' },
  { id: 'dormelles', icon: '🃏', labelKey: 'mode.dormelles' },
  { id: 'picolo', icon: '🍻', labelKey: 'mode.picolo' },
  { id: 'truth_dare', icon: '🎴', labelKey: 'mode.truthDare' },
];

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
    this.teamOnePlayerIds = [];
    this.teamTwoPlayerIds = [];
    this.randomModeIds = [];
    this.currentRoundMode = null;
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

  buildTeams() {
    const shuffled = [...this.players].sort(() => Math.random() - 0.5);
    const mid = Math.ceil(shuffled.length / 2);
    this.teamOnePlayerIds = shuffled.slice(0, mid).map(p => p.id);
    this.teamTwoPlayerIds = shuffled.slice(mid).map(p => p.id);
  }

  getTeamOnePlayers() {
    return this.players.filter(p => this.teamOnePlayerIds.includes(p.id));
  }

  getTeamTwoPlayers() {
    return this.players.filter(p => this.teamTwoPlayerIds.includes(p.id));
  }

  pickRandomTeamOnePlayer(excludeId = null) {
    const candidates = this.teamOnePlayerIds.filter(id => id !== excludeId);
    if (candidates.length === 0) return this.teamOnePlayerIds[0] || null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  pickRandomTeamTwoPlayer(excludeId = null) {
    const candidates = this.teamTwoPlayerIds.filter(id => id !== excludeId);
    if (candidates.length === 0) return this.teamTwoPlayerIds[0] || null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  setRandomModes(modeIds) {
    this.randomModeIds = modeIds;
  }

  pickRandomRoundMode() {
    if (this.randomModeIds.length === 0) return this.selectedGameMode;
    return this.randomModeIds[Math.floor(Math.random() * this.randomModeIds.length)];
  }

  setCurrentRoundMode(mode) {
    this.currentRoundMode = mode;
  }

  resetRoundSelection() {
    this.selectedGameMode = null;
    this.selectedIntensity = null;
    this.previousPlayerId = null;
    this.teamOnePlayerIds = [];
    this.teamTwoPlayerIds = [];
    this.randomModeIds = [];
    this.currentRoundMode = null;
  }

  toPreferencesPayload() {
    return {
      lang: this.selectedLang,
      players: this.players.map(player => player.name),
    };
  }

  buildRoundRequest() {
    return {
      gameMode: this.currentRoundMode || this.selectedGameMode,
      intensity: this.selectedIntensity,
      lang: this.selectedLang,
      previousPlayerId: this.previousPlayerId,
    };
  }

  buildRoundLabelInput(promptKind) {
    return {
      gameMode: this.currentRoundMode || this.selectedGameMode,
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
    const mode = this.currentRoundMode || this.selectedGameMode;
    return !MODES_WITH_HIDDEN_ROUND_PLAYER.has(mode);
  }
}

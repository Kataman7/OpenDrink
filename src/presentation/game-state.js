import { DEFAULT_LANG } from '../config.js';
import { GameMode } from '../domain/game-mode.js';
import { PlayerStore } from './player-store.js';
import { TeamManager } from './team-manager.js';
import { RoundState } from './round-state.js';

const MODES_WITH_HIDDEN_ROUND_PLAYER = new Set([
  GameMode.WOULD_YOU_RATHER,
  GameMode.WHO_COULD,
  GameMode.NEVER_HAVE_I_EVER,
  GameMode.PICOLO,
  GameMode.DORMELLES,
  GameMode.TEAM_BATTLE,
]);

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

export class GameState {
  constructor({ screens }) {
    this.screens = screens;
    this.screen = screens.loading;
    this.selectedLang = DEFAULT_LANG;
    this.autoRead = false;
    this.playerStore = new PlayerStore();
    this.teamManager = new TeamManager();
    this.roundState = new RoundState();
    this.impostorCount = 1;
    this.mrWhiteCount = 0;
  }

  get players() {
    return this.playerStore.players;
  }

  get previousPlayerId() {
    return this.playerStore.previousPlayerId;
  }

  get teamOnePlayerIds() {
    return this.teamManager.teamOnePlayerIds;
  }

  get teamTwoPlayerIds() {
    return this.teamManager.teamTwoPlayerIds;
  }

  get selectedGameMode() {
    return this.roundState.selectedGameMode;
  }

  get selectedIntensity() {
    return this.roundState.selectedIntensity;
  }

  get currentRoundMode() {
    return this.roundState.currentRoundMode;
  }

  getActiveGameMode() {
    return this.roundState.getActiveGameMode();
  }

  get randomModeIds() {
    return this.roundState.randomModeIds;
  }

  applyPreferences(preferences) {
    this.selectedLang = preferences.lang || DEFAULT_LANG;
    this.autoRead = Boolean(preferences.autoRead);
    this.playerStore.applyRestoredNames(preferences);
  }

  consumeRestoredPlayerNames() {
    return this.playerStore.consumeRestoredPlayerNames();
  }

  updateLanguage(lang) {
    this.selectedLang = lang;
  }

  addPlayer(player) {
    this.playerStore.addPlayer(player);
  }

  removePlayerById(playerId) {
    this.playerStore.removePlayerById(playerId);
  }

  hasEnoughPlayers(minPlayers) {
    return this.playerStore.hasEnoughPlayers(minPlayers);
  }

  selectMode(mode) {
    this.roundState.selectMode(mode);
  }

  selectIntensity(intensity) {
    this.roundState.selectIntensity(intensity);
  }

  setPreviousPlayer(playerId) {
    this.playerStore.setPreviousPlayer(playerId);
  }

  isLobbyScreen() {
    return this.screen === this.screens.lobby;
  }

  buildTeams() {
    this.teamManager.buildTeams(this.players);
  }

  getTeamOnePlayers() {
    return this.teamManager.getPlayersForTeam(this.teamOnePlayerIds, this.players);
  }

  getTeamTwoPlayers() {
    return this.teamManager.getPlayersForTeam(this.teamTwoPlayerIds, this.players);
  }

  pickRandomTeamOnePlayer(excludeId = null) {
    return this.teamManager.pickRandomFromTeam(this.teamOnePlayerIds, this.players, excludeId);
  }

  pickRandomTeamTwoPlayer(excludeId = null) {
    return this.teamManager.pickRandomFromTeam(this.teamTwoPlayerIds, this.players, excludeId);
  }

  setRandomModes(modeIds) {
    this.roundState.setRandomModes(modeIds);
  }

  pickRandomRoundMode() {
    return this.roundState.pickRandomRoundMode();
  }

  setCurrentRoundMode(mode) {
    this.roundState.setCurrentRoundMode(mode);
  }

  resetRoundSelection() {
    this.roundState.reset();
    this.teamManager.reset();
    this.playerStore.previousPlayerId = null;
  }

  toPreferencesPayload() {
    return {
      lang: this.selectedLang,
      players: this.players.map(player => player.name),
      autoRead: this.autoRead || false,
    };
  }

  buildRoundRequest() {
    return {
      gameMode: this.roundState.getActiveGameMode(),
      intensity: this.selectedIntensity,
      lang: this.selectedLang,
      previousPlayerId: this.previousPlayerId,
      playerCount: this.players.length,
    };
  }

  buildRoundLabelInput(promptKind) {
    return {
      gameMode: this.roundState.getActiveGameMode(),
      intensity: this.selectedIntensity,
      promptKind,
    };
  }

  getPlayerIds() {
    return this.playerStore.getPlayerIds();
  }

  pickRandomPlayerId() {
    const ids = this.getPlayerIds();
    if (ids.length === 0) return null;
    return ids[Math.floor(Math.random() * ids.length)];
  }

  shouldDisplayRoundPlayerName() {
    const mode = this.roundState.getActiveGameMode();
    return !MODES_WITH_HIDDEN_ROUND_PLAYER.has(mode);
  }
}

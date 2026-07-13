export class PlayerStore {
  constructor() {
    this.players = [];
    this.previousPlayerId = null;
    this.restoredPlayerNames = [];
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

  setPreviousPlayer(playerId) {
    this.previousPlayerId = playerId;
  }

  getPlayerIds() {
    return this.players.map(player => player.id);
  }

  consumeRestoredPlayerNames() {
    const names = [...this.restoredPlayerNames];
    this.restoredPlayerNames = [];
    return names;
  }

  applyRestoredNames(preferences) {
    this.restoredPlayerNames = Array.isArray(preferences.players) ? preferences.players : [];
  }
}

export class ImpostorManager {
  constructor({ getImpostorWordUseCase }) {
    this.getImpostorWordUseCase = getImpostorWordUseCase;
    this.reset();
  }

  reset() {
    this.starterId = null;
    this.orderedPlayerIds = [];
    this.impostorPlayerId = null;
    this.normalWord = null;
    this.impostorWord = null;
    this.impostorWordRevealed = false;
    this.currentIndex = 0;
    this.accusationIds = [];
  }

  async initializeRound(gameState) {
    const playerIds = gameState.getPlayerIds();
    if (playerIds.length === 0) return false;

    this.starterId = gameState.pickRandomPlayerId();
    this.orderedPlayerIds = this.buildOrder(playerIds, this.starterId);
    this.impostorPlayerId = gameState.pickRandomPlayerId();
    this.currentIndex = 0;
    this.accusationIds = [...playerIds];
    this.impostorWordRevealed = false;

    try {
      const { normalWord, impostorWord } = await this.getImpostorWordUseCase.execute({
        lang: gameState.selectedLang,
      });
      this.normalWord = normalWord;
      this.impostorWord = impostorWord;
      return true;
    } catch (error) {
      this.reset();
      throw error;
    }
  }

  buildOrder(playerIds, starterId) {
    const starterIndex = playerIds.indexOf(starterId);
    if (starterIndex < 0) return playerIds;
    return [...playerIds.slice(starterIndex), ...playerIds.slice(0, starterIndex)];
  }

  getCurrentPlayer(players) {
    if (this.currentIndex >= this.orderedPlayerIds.length) {
      return null;
    }
    const playerId = this.orderedPlayerIds[this.currentIndex];
    return players.find(p => p.id === playerId) || null;
  }

  hasMorePlayers() {
    return this.currentIndex < this.orderedPlayerIds.length;
  }

  revealWord() {
    this.impostorWordRevealed = true;
  }

  isWordRevealed() {
    return this.impostorWordRevealed;
  }

  getCurrentWord() {
    const currentPlayer = this.orderedPlayerIds[this.currentIndex];
    return currentPlayer === this.impostorPlayerId ? this.impostorWord : this.normalWord;
  }

  isCurrentPlayerImpostor() {
    const currentPlayer = this.orderedPlayerIds[this.currentIndex];
    return currentPlayer === this.impostorPlayerId;
  }

  isImpostorPlayer(playerId) {
    return this.impostorPlayerId === playerId;
  }

  moveToNextPlayer() {
    this.currentIndex++;
    this.impostorWordRevealed = false;
  }

  removeFromAccusations(playerId) {
    this.accusationIds = this.accusationIds.filter(id => id !== playerId);
  }

  getAccusationPlayers(players) {
    return this.accusationIds.map(id => players.find(p => p.id === id)).filter(Boolean);
  }

  finishRound() {
    this.reset();
  }

  startDiscussion() {
    this.orderedPlayerIds = [];
    this.currentIndex = 0;
  }
}

import { shuffleArray } from '../shared/random.js';

export class ImpostorManager {
  constructor({ getImpostorWordUseCase }) {
    this.getImpostorWordUseCase = getImpostorWordUseCase;
    this.reset();
  }

  reset() {
    this.starterId = null;
    this.orderedPlayerIds = [];
    this.impostorPlayerIds = [];
    this.mrWhitePlayerId = null;
    this.normalWord = null;
    this.impostorWord = null;
    this.currentIndex = 0;
    this.accusationIds = [];
  }

  async initializeRound(gameState) {
    const playerIds = gameState.getPlayerIds();
    if (playerIds.length === 0) return false;

    this.starterId = gameState.pickRandomPlayerId();
    this.orderedPlayerIds = this.buildOrder(playerIds, this.starterId);
    this.accusationIds = [...playerIds];
    this.currentIndex = 0;

    this.assignRoles(playerIds, gameState.impostorCount, gameState.mrWhiteCount);

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

  assignRoles(playerIds, impostorCount, mrWhiteCount) {
    const shuffled = shuffleArray(playerIds);
    const totalRoles = impostorCount + mrWhiteCount;
    this.impostorPlayerIds = shuffled.slice(0, Math.min(impostorCount, shuffled.length));
    this.mrWhitePlayerId =
      mrWhiteCount > 0 && impostorCount < shuffled.length ? shuffled[impostorCount] : null;
  }

  buildOrder(playerIds, starterId) {
    const starterIndex = playerIds.indexOf(starterId);
    if (starterIndex < 0) return playerIds;
    return [...playerIds.slice(starterIndex), ...playerIds.slice(0, starterIndex)];
  }

  getCurrentPlayer(players) {
    if (this.currentIndex >= this.orderedPlayerIds.length) return null;
    const playerId = this.orderedPlayerIds[this.currentIndex];
    return players.find(p => p.id === playerId) || null;
  }

  hasMorePlayers() {
    return this.currentIndex < this.orderedPlayerIds.length;
  }

  revealWord() {
    this.currentWordRevealed = true;
  }

  getCurrentWord() {
    const currentId = this.orderedPlayerIds[this.currentIndex];
    if (currentId === this.mrWhitePlayerId) return { word: null, role: 'mr_white' };
    if (this.impostorPlayerIds.includes(currentId))
      return { word: this.impostorWord, role: 'impostor' };
    return { word: this.normalWord, role: 'normal' };
  }

  moveToNextPlayer() {
    this.currentIndex++;
    this.currentWordRevealed = false;
  }

  isImpostorPlayer(playerId) {
    return this.impostorPlayerIds.includes(playerId);
  }

  isMrWhitePlayer(playerId) {
    return this.mrWhitePlayerId === playerId;
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
}

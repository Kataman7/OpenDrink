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
    this.mrWhitePlayerIds = [];
    this.normalWord = null;
    this.impostorWord = null;
    this.currentIndex = 0;
    this.accusationIds = [];
    this.currentWordRevealed = false;
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
    const safeImpostorCount = Math.min(impostorCount, shuffled.length);
    this.impostorPlayerIds = shuffled.slice(0, safeImpostorCount);
    const safeWhiteCount = Math.min(mrWhiteCount, Math.max(0, shuffled.length - safeImpostorCount));
    this.mrWhitePlayerIds = shuffled.slice(safeImpostorCount, safeImpostorCount + safeWhiteCount);
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

  hasNextPlayer() {
    return this.currentIndex < this.orderedPlayerIds.length - 1;
  }

  revealWord() {
    this.currentWordRevealed = true;
  }

  getCurrentWord() {
    const currentId = this.orderedPlayerIds[this.currentIndex];
    if (this.mrWhitePlayerIds.includes(currentId)) return { word: null, role: 'mr_white' };
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
    return this.mrWhitePlayerIds.includes(playerId);
  }

  removeBadPlayer(playerId) {
    this.impostorPlayerIds = this.impostorPlayerIds.filter(id => id !== playerId);
    this.mrWhitePlayerIds = this.mrWhitePlayerIds.filter(id => id !== playerId);
  }

  getRemainingBadCount() {
    return this.impostorPlayerIds.length + this.mrWhitePlayerIds.length;
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

export class PlayerManager {
  constructor({ addPlayerUseCase, removePlayerUseCase }) {
    this.addPlayerUseCase = addPlayerUseCase;
    this.removePlayerUseCase = removePlayerUseCase;
  }

  async addPlayer(playerName) {
    if (!playerName) return null;
    return await this.addPlayerUseCase.execute({ name: playerName });
  }

  async removePlayer(playerId) {
    if (!playerId) return;
    await this.removePlayerUseCase.execute({ playerId });
  }
}

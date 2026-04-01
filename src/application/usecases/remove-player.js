export class RemovePlayerUseCase {
  constructor({ playerRepositoryPort }) {
    this.playerRepositoryPort = playerRepositoryPort;
  }

  async execute({ playerId }) {
    await this.playerRepositoryPort.removePlayerById(playerId);
  }
}

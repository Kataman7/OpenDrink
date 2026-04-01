import { Player } from '../../domain/entities.js';

export class AddPlayerUseCase {
  constructor({ playerRepositoryPort }) {
    this.playerRepositoryPort = playerRepositoryPort;
  }

  async execute({ name }) {
    const player = new Player({ name });
    const playerId = await this.playerRepositoryPort.savePlayer(player.name);
    return new Player({ id: playerId, name: player.name });
  }
}

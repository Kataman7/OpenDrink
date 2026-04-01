export class QuestionRepositoryPort {
  async getRandomQuestion({ gameMode, intensity, lang }) {
    throw new Error('QuestionRepositoryPort.getRandomQuestion must be implemented');
  }
}

export class PlayerRepositoryPort {
  async savePlayer(name) {
    throw new Error('PlayerRepositoryPort.savePlayer must be implemented');
  }

  async getAllPlayers() {
    throw new Error('PlayerRepositoryPort.getAllPlayers must be implemented');
  }

  async removePlayerById(playerId) {
    throw new Error('PlayerRepositoryPort.removePlayerById must be implemented');
  }

  async clearPlayers() {
    throw new Error('PlayerRepositoryPort.clearPlayers must be implemented');
  }
}

export class DatabasePort {
  async initialize() {
    throw new Error('DatabasePort.initialize must be implemented');
  }

  async close() {
    throw new Error('DatabasePort.close must be implemented');
  }
}

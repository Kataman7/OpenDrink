export class QuestionRepositoryPort {
  async getRandomQuestion({ gameMode: _gameMode, intensity: _intensity, lang: _lang }) {
    throw new Error('QuestionRepositoryPort.getRandomQuestion must be implemented');
  }
}

export class PlayerRepositoryPort {
  async savePlayer(_name) {
    throw new Error('PlayerRepositoryPort.savePlayer must be implemented');
  }

  async getAllPlayers() {
    throw new Error('PlayerRepositoryPort.getAllPlayers must be implemented');
  }

  async removePlayerById(_playerId) {
    throw new Error('PlayerRepositoryPort.removePlayerById must be implemented');
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

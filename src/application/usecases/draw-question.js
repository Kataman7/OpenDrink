import { NoPlayersError, NoQuestionsAvailableError } from '../../domain/errors.js';

export class DrawQuestionUseCase {
  constructor({ playerRepositoryPort, questionRepositoryPort }) {
    this.playerRepositoryPort = playerRepositoryPort;
    this.questionRepositoryPort = questionRepositoryPort;
  }

  async execute({ gameMode, intensity, lang, previousPlayerId = null }) {
    const players = await this.playerRepositoryPort.getAllPlayers();
    if (!players || players.length === 0) {
      throw new NoPlayersError();
    }

    const question = await this.questionRepositoryPort.getRandomQuestion({
      gameMode,
      intensity,
      lang,
    });
    if (!question) {
      throw new NoQuestionsAvailableError(gameMode);
    }

    const selectedPlayer = this.pickPlayer(players, previousPlayerId);

    return { player: selectedPlayer, question };
  }

  pickPlayer(players, previousPlayerId) {
    if (players.length === 1) return players[0];

    const candidates = players.filter((player) => player.id !== previousPlayerId);
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }
}

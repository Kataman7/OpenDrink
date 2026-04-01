import { NoPlayersError, NoQuestionsAvailableError } from '../../domain/errors.js';

export class DrawQuestionUseCase {
  constructor({ playerRepositoryPort, questionRepositoryPort }) {
    this.playerRepositoryPort = playerRepositoryPort;
    this.questionRepositoryPort = questionRepositoryPort;
  }

  async execute({ gameMode, intensity, lang }) {
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

    const playerIndex = Math.floor(Math.random() * players.length);
    const selectedPlayer = players[playerIndex];

    return { player: selectedPlayer, question };
  }
}

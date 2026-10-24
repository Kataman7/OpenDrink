import { NoPlayersError, NoQuestionsAvailableError } from '../../domain/errors.js';

export class DrawQuestionUseCase {
  constructor({ playerRepositoryPort, questionRepositoryPort }) {
    this.playerRepositoryPort = playerRepositoryPort;
    this.questionRepositoryPort = questionRepositoryPort;
  }

  async execute({
    gameMode,
    intensity,
    lang,
    previousPlayerId = null,
    playerCount = null,
    excludeSentences = [],
  }) {
    const players = await this.playerRepositoryPort.getAllPlayers();
    if (!players || players.length === 0) {
      throw new NoPlayersError();
    }

    const questionRequest = {
      gameMode,
      intensity,
      lang,
      playerCount: playerCount || players.length,
    };
    if (excludeSentences && excludeSentences.length > 0) {
      questionRequest.excludeSentences = excludeSentences;
    }

    const question = await this.questionRepositoryPort.getRandomQuestion(questionRequest);
    if (!question) {
      throw new NoQuestionsAvailableError(gameMode);
    }

    const selectedPlayer = this.pickPlayer(players, previousPlayerId);

    return { player: selectedPlayer, question };
  }

  pickPlayer(players, previousPlayerId) {
    if (players.length === 1) return players[0];

    const candidates = players.filter(player => player.id !== previousPlayerId);
    if (candidates.length === 0) return players[0];
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }
}

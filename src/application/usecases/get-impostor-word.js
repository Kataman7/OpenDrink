import { NoQuestionsAvailableError } from '../../domain/errors.js';
import { GameMode } from '../../domain/game-mode.js';

export class GetImpostorWordUseCase {
  constructor({ questionRepositoryPort }) {
    this.questionRepositoryPort = questionRepositoryPort;
  }

  async execute({ lang, packId = null, excludeWords = [] }) {
    const request = {
      gameMode: GameMode.IMPOSTOR,
      intensity: null,
      lang,
      packId,
    };
    if (excludeWords && excludeWords.length > 0) {
      request.excludeSentences = excludeWords;
    }
    const question = await this.questionRepositoryPort.getRandomQuestion(request);

    if (!question) {
      throw new NoQuestionsAvailableError(GameMode.IMPOSTOR);
    }

    return {
      normalWord: question.sentence,
      impostorWord: question.impostorHintWord,
    };
  }
}

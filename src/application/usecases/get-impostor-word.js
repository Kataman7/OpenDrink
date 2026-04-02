import { NoQuestionsAvailableError } from '../../domain/errors.js';
import { GameMode } from '../../domain/value-objects.js';

export class GetImpostorWordUseCase {
  constructor({ questionRepositoryPort }) {
    this.questionRepositoryPort = questionRepositoryPort;
  }

  async execute({ lang }) {
    const question = await this.questionRepositoryPort.getRandomQuestion({
      gameMode: GameMode.IMPOSTOR,
      intensity: null,
      lang,
    });

    if (!question) {
      throw new NoQuestionsAvailableError(GameMode.IMPOSTOR);
    }

    return {
      normalWord: question.sentence,
      impostorWord: question.impostorHintWord,
    };
  }
}

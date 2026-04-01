import { PlayerNameEmptyError, QuestionTextEmptyError } from './errors.js';

export class Player {
  constructor({ id = null, name }) {
    if (!name || name.trim().length === 0) {
      throw new PlayerNameEmptyError();
    }
    this.id = id;
    this.name = name.trim();
  }
}

export class Question {
  constructor({ sentence, promptKind = null }) {
    if (!sentence || sentence.trim().length === 0) {
      throw new QuestionTextEmptyError();
    }
    this.sentence = sentence.trim();
    this.promptKind = promptKind;
  }
}

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
  constructor({
    sentence = '',
    promptKind = null,
    choiceA = null,
    choiceB = null,
    impostorHintWord = null,
    options = null,
  }) {
    const hasSentence = Boolean(sentence && sentence.trim().length > 0);
    const hasChoices = Boolean(choiceA && choiceB);
    const hasOptions = Boolean(options && Array.isArray(options) && options.length > 0);
    if (!hasSentence && !hasChoices && !hasOptions) {
      throw new QuestionTextEmptyError();
    }
    this.sentence = hasSentence ? sentence.trim() : '';
    this.promptKind = promptKind;
    this.choiceA = choiceA;
    this.choiceB = choiceB;
    this.impostorHintWord = impostorHintWord;
    this.options = hasOptions ? options : null;
  }
}

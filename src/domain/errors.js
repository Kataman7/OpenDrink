export class PlayerNameEmptyError extends Error {
  constructor() {
    super('Le nom du joueur ne peut pas être vide');
    this.name = 'PlayerNameEmptyError';
  }
}

export class QuestionTextEmptyError extends Error {
  constructor() {
    super('Le texte de la question ne peut pas être vide');
    this.name = 'QuestionTextEmptyError';
  }
}

export class InvalidQuestionTypeError extends Error {
  constructor(type) {
    super(`Type de question invalide : ${type}`);
    this.name = 'InvalidQuestionTypeError';
  }
}

export class DatabaseInitError extends Error {
  constructor(cause) {
    super("Échec de l'initialisation de la base de données");
    this.name = 'DatabaseInitError';
    this.cause = cause;
  }
}

export class NoPlayersError extends Error {
  constructor() {
    super('Aucun joueur ajouté pour cette partie');
    this.name = 'NoPlayersError';
  }
}

export class NoQuestionsAvailableError extends Error {
  constructor(mode) {
    super(`Aucune question disponible pour le mode : ${mode}`);
    this.name = 'NoQuestionsAvailableError';
  }
}

export class UnsupportedGameModeError extends Error {
  constructor(mode) {
    super(`Unsupported game mode: ${mode}`);
    this.name = 'UnsupportedGameModeError';
  }
}

export class UnsupportedIntensityError extends Error {
  constructor(intensity) {
    super(`Unsupported intensity: ${intensity}`);
    this.name = 'UnsupportedIntensityError';
  }
}

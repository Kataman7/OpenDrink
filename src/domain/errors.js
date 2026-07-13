export class PlayerNameEmptyError extends Error {
  constructor() {
    super('Player name cannot be empty');
    this.name = 'PlayerNameEmptyError';
  }
}

export class QuestionTextEmptyError extends Error {
  constructor() {
    super('Question text cannot be empty');
    this.name = 'QuestionTextEmptyError';
  }
}

export class DatabaseInitError extends Error {
  constructor(cause) {
    super('Failed to initialize the database');
    this.name = 'DatabaseInitError';
    this.cause = cause;
  }
}

export class NoPlayersError extends Error {
  constructor() {
    super('No players added for this game');
    this.name = 'NoPlayersError';
  }
}

export class NoQuestionsAvailableError extends Error {
  constructor(mode) {
    super(`No question available for mode: ${mode}`);
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

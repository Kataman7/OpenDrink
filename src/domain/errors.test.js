import { describe, it, expect } from 'vitest';
import {
  PlayerNameEmptyError,
  QuestionTextEmptyError,
  InvalidQuestionTypeError,
  DatabaseInitError,
  NoPlayersError,
  NoQuestionsAvailableError,
  UnsupportedGameModeError,
  UnsupportedIntensityError,
} from './errors.js';

describe('PlayerNameEmptyError', () => {
  it('should have correct name', () => {
    const error = new PlayerNameEmptyError();
    expect(error.name).toBe('PlayerNameEmptyError');
  });

  it('should have correct message', () => {
    const error = new PlayerNameEmptyError();
    expect(error.message).toBe('Le nom du joueur ne peut pas être vide');
  });

  it('should be an instance of Error', () => {
    const error = new PlayerNameEmptyError();
    expect(error instanceof Error).toBe(true);
  });
});

describe('QuestionTextEmptyError', () => {
  it('should have correct name', () => {
    const error = new QuestionTextEmptyError();
    expect(error.name).toBe('QuestionTextEmptyError');
  });

  it('should have correct message', () => {
    const error = new QuestionTextEmptyError();
    expect(error.message).toBe('Le texte de la question ne peut pas être vide');
  });

  it('should be an instance of Error', () => {
    const error = new QuestionTextEmptyError();
    expect(error instanceof Error).toBe(true);
  });
});

describe('InvalidQuestionTypeError', () => {
  it('should have correct name', () => {
    const error = new InvalidQuestionTypeError('custom');
    expect(error.name).toBe('InvalidQuestionTypeError');
  });

  it('should include type in message', () => {
    const error = new InvalidQuestionTypeError('custom');
    expect(error.message).toBe('Type de question invalide : custom');
  });

  it('should be an instance of Error', () => {
    const error = new InvalidQuestionTypeError('custom');
    expect(error instanceof Error).toBe(true);
  });
});

describe('DatabaseInitError', () => {
  it('should have correct name', () => {
    const cause = new Error('connection failed');
    const error = new DatabaseInitError(cause);
    expect(error.name).toBe('DatabaseInitError');
  });

  it('should have correct message', () => {
    const cause = new Error('connection failed');
    const error = new DatabaseInitError(cause);
    expect(error.message).toBe("Échec de l'initialisation de la base de données");
  });

  it('should store cause', () => {
    const cause = new Error('connection failed');
    const error = new DatabaseInitError(cause);
    expect(error.cause).toBe(cause);
  });

  it('should be an instance of Error', () => {
    const error = new DatabaseInitError(new Error());
    expect(error instanceof Error).toBe(true);
  });
});

describe('NoPlayersError', () => {
  it('should have correct name', () => {
    const error = new NoPlayersError();
    expect(error.name).toBe('NoPlayersError');
  });

  it('should have correct message', () => {
    const error = new NoPlayersError();
    expect(error.message).toBe('Aucun joueur ajouté pour cette partie');
  });

  it('should be an instance of Error', () => {
    const error = new NoPlayersError();
    expect(error instanceof Error).toBe(true);
  });
});

describe('NoQuestionsAvailableError', () => {
  it('should have correct name', () => {
    const error = new NoQuestionsAvailableError('jnj');
    expect(error.name).toBe('NoQuestionsAvailableError');
  });

  it('should include mode in message', () => {
    const error = new NoQuestionsAvailableError('jnj');
    expect(error.message).toBe('Aucune question disponible pour le mode : jnj');
  });

  it('should be an instance of Error', () => {
    const error = new NoQuestionsAvailableError('jnj');
    expect(error instanceof Error).toBe(true);
  });
});

describe('UnsupportedGameModeError', () => {
  it('should have correct name', () => {
    const error = new UnsupportedGameModeError('invalid');
    expect(error.name).toBe('UnsupportedGameModeError');
  });

  it('should include mode in message', () => {
    const error = new UnsupportedGameModeError('invalid');
    expect(error.message).toBe('Unsupported game mode: invalid');
  });

  it('should be an instance of Error', () => {
    const error = new UnsupportedGameModeError('invalid');
    expect(error instanceof Error).toBe(true);
  });
});

describe('UnsupportedIntensityError', () => {
  it('should have correct name', () => {
    const error = new UnsupportedIntensityError('unknown');
    expect(error.name).toBe('UnsupportedIntensityError');
  });

  it('should include intensity in message', () => {
    const error = new UnsupportedIntensityError('unknown');
    expect(error.message).toBe('Unsupported intensity: unknown');
  });

  it('should be an instance of Error', () => {
    const error = new UnsupportedIntensityError('unknown');
    expect(error instanceof Error).toBe(true);
  });
});

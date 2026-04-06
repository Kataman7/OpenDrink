import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import initSqlJs from 'sql.js';
import {
  QuestionsDatabaseAdapter,
  PlayersDatabaseAdapter,
  SqlJsQuestionRepositoryAdapter,
  SqlJsPlayerRepositoryAdapter,
  SqlJsDatabaseAdapter,
} from './sqlite-adapter.js';
import { GameMode, QuestionIntensity } from '../domain/value-objects.js';
import { Question } from '../domain/entities.js';

/**
 * Helper to create an in-memory SQLite database with test data
 */
async function createTestQuestionsDb() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  // Create questions table
  db.run(`
    CREATE TABLE questions (
      id INTEGER PRIMARY KEY,
      game_key TEXT NOT NULL,
      category_id INTEGER,
      lang TEXT NOT NULL,
      sentence TEXT NOT NULL
    )
  `);

  // Create tpf_questions table (Would You Rather)
  db.run(`
    CREATE TABLE tpf_questions (
      id INTEGER PRIMARY KEY,
      category_id INTEGER,
      lang TEXT NOT NULL,
      choice1 TEXT NOT NULL,
      choice2 TEXT NOT NULL
    )
  `);

  // Create imposter_words table
  db.run(`
    CREATE TABLE imposter_words (
      id INTEGER PRIMARY KEY,
      lang TEXT NOT NULL,
      word TEXT NOT NULL,
      imposter_hint_word TEXT NOT NULL
    )
  `);

  // Insert test data for Never Have I Ever (jnj)
  db.run(
    "INSERT INTO questions (game_key, category_id, lang, sentence) VALUES ('jnj', 0, 'en', 'Never have I ever danced on a table')"
  );
  db.run(
    "INSERT INTO questions (game_key, category_id, lang, sentence) VALUES ('jnj', 1, 'en', 'Never have I ever kissed a stranger')"
  );
  db.run(
    "INSERT INTO questions (game_key, category_id, lang, sentence) VALUES ('jnj', 0, 'fr', 'Je n''ai jamais danse sur une table')"
  );

  // Insert test data for Truth or Dare (tod)
  db.run(
    "INSERT INTO questions (game_key, category_id, lang, sentence) VALUES ('tod', 0, 'en', 'Tell your most embarrassing secret')"
  );
  db.run(
    "INSERT INTO questions (game_key, category_id, lang, sentence) VALUES ('tod', 1, 'en', 'Tell your wildest fantasy')"
  );

  // Insert test data for Dare (dare_chooser)
  db.run(
    "INSERT INTO questions (game_key, category_id, lang, sentence) VALUES ('dare_chooser', 0, 'en', 'Do 10 pushups')"
  );
  db.run(
    "INSERT INTO questions (game_key, category_id, lang, sentence) VALUES ('dare_chooser', 1, 'en', 'Kiss someone in the room')"
  );

  // Insert test data for Who Could (qpr)
  db.run(
    "INSERT INTO questions (game_key, category_id, lang, sentence) VALUES ('qpr', 0, 'en', 'Who could be the best actor?')"
  );
  db.run(
    "INSERT INTO questions (game_key, category_id, lang, sentence) VALUES ('qpr', 1, 'en', 'Who could be the best kisser?')"
  );

  // Insert test data for Would You Rather (tpf_questions)
  db.run(
    "INSERT INTO tpf_questions (category_id, lang, choice1, choice2) VALUES (0, 'en', 'Be invisible', 'Be able to fly')"
  );
  db.run(
    "INSERT INTO tpf_questions (category_id, lang, choice1, choice2) VALUES (1, 'en', 'Kiss a frog', 'Hug a snake')"
  );

  // Insert test data for Impostor words
  db.run(
    "INSERT INTO imposter_words (lang, word, imposter_hint_word) VALUES ('en', 'Apple', 'Fruit')"
  );
  db.run(
    "INSERT INTO imposter_words (lang, word, imposter_hint_word) VALUES ('en', 'Banana', 'Yellow')"
  );

  return db;
}

describe('QuestionsDatabaseAdapter', () => {
  let adapter;
  let db;

  beforeEach(async () => {
    db = await createTestQuestionsDb();
    adapter = new QuestionsDatabaseAdapter();
    adapter.db = db;
  });

  afterEach(() => {
    if (db) {
      db.close();
    }
  });

  describe('getRandomQuestion', () => {
    it('should return a question for NEVER_HAVE_I_EVER mode', () => {
      const question = adapter.getRandomQuestion({
        gameMode: GameMode.NEVER_HAVE_I_EVER,
        intensity: QuestionIntensity.SOFT,
        lang: 'en',
      });

      expect(question).toBeInstanceOf(Question);
      expect(question.sentence).toBeTruthy();
      expect(question.promptKind).toBeNull();
    });

    it('should return a question for ACTION_TRUTH mode (truth)', () => {
      // Mock pickGameKey to return 'tod'
      const originalPick = adapter.pickGameKey;
      adapter.pickGameKey = () => 'tod';

      const question = adapter.getRandomQuestion({
        gameMode: GameMode.ACTION_TRUTH,
        intensity: QuestionIntensity.SOFT,
        lang: 'en',
      });

      expect(question).toBeInstanceOf(Question);
      expect(question.sentence).toBeTruthy();
      expect(question.promptKind).toBe('truth');

      adapter.pickGameKey = originalPick;
    });

    it('should return a question for ACTION_TRUTH mode (dare)', () => {
      // Mock pickGameKey to return 'dare_chooser'
      const originalPick = adapter.pickGameKey;
      adapter.pickGameKey = () => 'dare_chooser';

      const question = adapter.getRandomQuestion({
        gameMode: GameMode.ACTION_TRUTH,
        intensity: QuestionIntensity.SOFT,
        lang: 'en',
      });

      expect(question).toBeInstanceOf(Question);
      expect(question.sentence).toBeTruthy();
      expect(question.promptKind).toBe('dare');

      adapter.pickGameKey = originalPick;
    });

    it('should return a question for WHO_COULD mode', () => {
      const question = adapter.getRandomQuestion({
        gameMode: GameMode.WHO_COULD,
        intensity: QuestionIntensity.SOFT,
        lang: 'en',
      });

      expect(question).toBeInstanceOf(Question);
      expect(question.sentence).toBeTruthy();
      expect(question.promptKind).toBe('who_could');
    });

    it('should return a question for WOULD_YOU_RATHER mode', () => {
      const question = adapter.getRandomQuestion({
        gameMode: GameMode.WOULD_YOU_RATHER,
        intensity: QuestionIntensity.SOFT,
        lang: 'en',
      });

      expect(question).toBeInstanceOf(Question);
      expect(question.choiceA).toBeTruthy();
      expect(question.choiceB).toBeTruthy();
      expect(question.promptKind).toBe('would_you_rather');
    });

    it('should return a question for IMPOSTOR mode', () => {
      const question = adapter.getRandomQuestion({
        gameMode: GameMode.IMPOSTOR,
        intensity: null,
        lang: 'en',
      });

      expect(question).toBeInstanceOf(Question);
      expect(question.sentence).toBeTruthy();
      expect(question.impostorHintWord).toBeTruthy();
      expect(question.promptKind).toBe('impostor');
    });

    it('should return null when no questions found', () => {
      const question = adapter.getRandomQuestion({
        gameMode: GameMode.NEVER_HAVE_I_EVER,
        intensity: QuestionIntensity.SOFT,
        lang: 'unknown',
      });

      expect(question).toBeNull();
    });

    it('should filter by intensity SOFT (category_id = 0)', () => {
      const originalPick = adapter.pickGameKey;
      adapter.pickGameKey = () => 'jnj';

      const question = adapter.getRandomQuestion({
        gameMode: GameMode.NEVER_HAVE_I_EVER,
        intensity: QuestionIntensity.SOFT,
        lang: 'en',
      });

      expect(question).toBeInstanceOf(Question);
      // Should be one of the soft questions (category_id = 0)
      expect([
        'Never have I ever danced on a table',
        "Je n'ai jamais danse sur une table",
      ]).toContain(question.sentence);

      adapter.pickGameKey = originalPick;
    });

    it('should filter by intensity HOT (category_id = 1)', () => {
      const originalPick = adapter.pickGameKey;
      adapter.pickGameKey = () => 'jnj';

      const question = adapter.getRandomQuestion({
        gameMode: GameMode.NEVER_HAVE_I_EVER,
        intensity: QuestionIntensity.HOT,
        lang: 'en',
      });

      expect(question).toBeInstanceOf(Question);
      expect(question.sentence).toBe('Never have I ever kissed a stranger');

      adapter.pickGameKey = originalPick;
    });

    it('should return any question for MIXED intensity', () => {
      const originalPick = adapter.pickGameKey;
      adapter.pickGameKey = () => 'jnj';

      const question = adapter.getRandomQuestion({
        gameMode: GameMode.NEVER_HAVE_I_EVER,
        intensity: QuestionIntensity.MIXED,
        lang: 'en',
      });

      expect(question).toBeInstanceOf(Question);
      expect(question.sentence).toBeTruthy();

      adapter.pickGameKey = originalPick;
    });
  });

  describe('getRandomImpostorWord', () => {
    it('should return an impostor word with hint', () => {
      const question = adapter.getRandomImpostorWord({ lang: 'en' });

      expect(question).toBeInstanceOf(Question);
      expect(['Apple', 'Banana']).toContain(question.sentence);
      expect(['Fruit', 'Yellow']).toContain(question.impostorHintWord);
      expect(question.promptKind).toBe('impostor');
    });

    it('should return null when no impostor words found for language', () => {
      const question = adapter.getRandomImpostorWord({ lang: 'unknown' });

      expect(question).toBeNull();
    });
  });

  describe('getRandomWouldYouRatherQuestion', () => {
    it('should return a would you rather question', () => {
      const question = adapter.getRandomWouldYouRatherQuestion({
        intensity: QuestionIntensity.SOFT,
        lang: 'en',
      });

      expect(question).toBeInstanceOf(Question);
      expect(question.choiceA).toBe('Be invisible');
      expect(question.choiceB).toBe('Be able to fly');
      expect(question.promptKind).toBe('would_you_rather');
    });

    it('should return null when no would you rather questions found', () => {
      const question = adapter.getRandomWouldYouRatherQuestion({
        intensity: QuestionIntensity.SOFT,
        lang: 'unknown',
      });

      expect(question).toBeNull();
    });

    it('should filter by HOT intensity', () => {
      const question = adapter.getRandomWouldYouRatherQuestion({
        intensity: QuestionIntensity.HOT,
        lang: 'en',
      });

      expect(question).toBeInstanceOf(Question);
      expect(question.choiceA).toBe('Kiss a frog');
      expect(question.choiceB).toBe('Hug a snake');
    });
  });

  describe('pickGameKey', () => {
    it('should return jnj for NEVER_HAVE_I_EVER', () => {
      const key = adapter.pickGameKey(GameMode.NEVER_HAVE_I_EVER);
      expect(key).toBe('jnj');
    });

    it('should return tod or dare_chooser for ACTION_TRUTH', () => {
      const keys = new Set();
      // Run multiple times to check randomness
      for (let i = 0; i < 100; i++) {
        keys.add(adapter.pickGameKey(GameMode.ACTION_TRUTH));
      }
      expect(keys.has('tod') || keys.has('dare_chooser')).toBe(true);
    });

    it('should return qpr for WHO_COULD', () => {
      const key = adapter.pickGameKey(GameMode.WHO_COULD);
      expect(key).toBe('qpr');
    });

    it('should throw for unsupported game mode', () => {
      expect(() => adapter.pickGameKey('unknown')).toThrow();
    });
  });

  describe('getPromptKind', () => {
    it('should return truth for tod', () => {
      expect(adapter.getPromptKind('tod')).toBe('truth');
    });

    it('should return dare for dare_chooser', () => {
      expect(adapter.getPromptKind('dare_chooser')).toBe('dare');
    });

    it('should return who_could for qpr', () => {
      expect(adapter.getPromptKind('qpr')).toBe('who_could');
    });

    it('should return null for other game keys', () => {
      expect(adapter.getPromptKind('jnj')).toBeNull();
      expect(adapter.getPromptKind('unknown')).toBeNull();
    });
  });
});

describe('PlayersDatabaseAdapter', () => {
  let adapter;

  beforeEach(async () => {
    adapter = new PlayersDatabaseAdapter();
    await adapter.initialize();
  });

  afterEach(() => {
    if (adapter.db) {
      adapter.db.close();
    }
  });

  describe('initialize', () => {
    it('should create players table', async () => {
      const result = adapter.db.exec(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='players'"
      );
      expect(result.length).toBe(1);
      expect(result[0].values[0][0]).toBe('players');
    });
  });

  describe('savePlayer', () => {
    it('should save a player and return the id', () => {
      const id = adapter.savePlayer('Alice');
      expect(id).toBe(1);
    });

    it('should save multiple players with incrementing ids', () => {
      const id1 = adapter.savePlayer('Alice');
      const id2 = adapter.savePlayer('Bob');
      const id3 = adapter.savePlayer('Charlie');

      expect(id1).toBe(1);
      expect(id2).toBe(2);
      expect(id3).toBe(3);
    });

    it('should throw error when database not initialized', () => {
      const uninitializedAdapter = new PlayersDatabaseAdapter();
      expect(() => uninitializedAdapter.savePlayer('Alice')).toThrow('Database not initialized!');
    });
  });

  describe('getAllPlayers', () => {
    it('should return empty array when no players', () => {
      const players = adapter.getAllPlayers();
      expect(players).toEqual([]);
    });

    it('should return all players', () => {
      adapter.savePlayer('Alice');
      adapter.savePlayer('Bob');

      const players = adapter.getAllPlayers();

      expect(players).toHaveLength(2);
      expect(players[0]).toEqual({ id: 1, name: 'Alice' });
      expect(players[1]).toEqual({ id: 2, name: 'Bob' });
    });
  });

  describe('removePlayerById', () => {
    it('should remove a player by id', () => {
      adapter.savePlayer('Alice');
      adapter.savePlayer('Bob');

      adapter.removePlayerById(1);

      const players = adapter.getAllPlayers();
      expect(players).toHaveLength(1);
      expect(players[0]).toEqual({ id: 2, name: 'Bob' });
    });

    it('should not throw when removing non-existent player', () => {
      expect(() => adapter.removePlayerById(999)).not.toThrow();
    });
  });
});

describe('SqlJsQuestionRepositoryAdapter', () => {
  let questionsDb;
  let repository;

  beforeEach(async () => {
    questionsDb = new QuestionsDatabaseAdapter();
    questionsDb.db = await createTestQuestionsDb();
    repository = new SqlJsQuestionRepositoryAdapter(questionsDb);
  });

  afterEach(() => {
    if (questionsDb.db) {
      questionsDb.db.close();
    }
  });

  it('should delegate getRandomQuestion to questionsDb', async () => {
    const question = await repository.getRandomQuestion({
      gameMode: GameMode.NEVER_HAVE_I_EVER,
      intensity: QuestionIntensity.SOFT,
      lang: 'en',
    });

    expect(question).toBeInstanceOf(Question);
    expect(question.sentence).toBeTruthy();
  });

  it('should return impostor question for IMPOSTOR mode', async () => {
    const question = await repository.getRandomQuestion({
      gameMode: GameMode.IMPOSTOR,
      intensity: null,
      lang: 'en',
    });

    expect(question).toBeInstanceOf(Question);
    expect(question.promptKind).toBe('impostor');
  });
});

describe('SqlJsPlayerRepositoryAdapter', () => {
  let playersDb;
  let repository;

  beforeEach(async () => {
    playersDb = new PlayersDatabaseAdapter();
    await playersDb.initialize();
    repository = new SqlJsPlayerRepositoryAdapter(playersDb);
  });

  afterEach(() => {
    if (playersDb.db) {
      playersDb.db.close();
    }
  });

  it('should delegate savePlayer to playersDb', async () => {
    const id = await repository.savePlayer('Alice');
    expect(id).toBe(1);
  });

  it('should delegate getAllPlayers to playersDb', async () => {
    await repository.savePlayer('Alice');
    await repository.savePlayer('Bob');

    const players = await repository.getAllPlayers();

    expect(players).toHaveLength(2);
    expect(players[0].name).toBe('Alice');
    expect(players[1].name).toBe('Bob');
  });

  it('should delegate removePlayerById to playersDb', async () => {
    await repository.savePlayer('Alice');
    await repository.savePlayer('Bob');

    await repository.removePlayerById(1);

    const players = await repository.getAllPlayers();
    expect(players).toHaveLength(1);
    expect(players[0].name).toBe('Bob');
  });
});

describe('SqlJsDatabaseAdapter', () => {
  let questionsDb;
  let playersDb;
  let databaseAdapter;

  beforeEach(async () => {
    questionsDb = new QuestionsDatabaseAdapter();
    questionsDb.db = await createTestQuestionsDb();

    playersDb = new PlayersDatabaseAdapter();
    await playersDb.initialize();

    databaseAdapter = new SqlJsDatabaseAdapter(questionsDb, playersDb);
  });

  afterEach(() => {
    if (questionsDb.db) {
      questionsDb.db.close();
    }
    if (playersDb.db) {
      playersDb.db.close();
    }
  });

  describe('initialize', () => {
    it('should initialize both databases', async () => {
      // Create fresh adapters for this test
      const freshQuestionsDb = new QuestionsDatabaseAdapter();
      const freshPlayersDb = new PlayersDatabaseAdapter();

      // Mock the load method for questionsDb
      freshQuestionsDb.load = async () => {
        freshQuestionsDb.db = await createTestQuestionsDb();
      };

      const adapter = new SqlJsDatabaseAdapter(freshQuestionsDb, freshPlayersDb);

      await adapter.initialize();

      expect(freshQuestionsDb.db).not.toBeNull();
      expect(freshPlayersDb.db).not.toBeNull();

      // Cleanup
      if (freshQuestionsDb.db) freshQuestionsDb.db.close();
      if (freshPlayersDb.db) freshPlayersDb.db.close();
    });
  });

  describe('close', () => {
    it('should close both databases', async () => {
      // Spy on close methods
      const questionsCloseSpy = vi.spyOn(questionsDb.db, 'close');
      const playersCloseSpy = vi.spyOn(playersDb.db, 'close');

      await databaseAdapter.close();

      expect(questionsCloseSpy).toHaveBeenCalledOnce();
      expect(playersCloseSpy).toHaveBeenCalledOnce();
    });

    it('should not throw when databases are null', async () => {
      const adapter = new SqlJsDatabaseAdapter(
        { db: null, load: async () => {} },
        { db: null, initialize: async () => {} }
      );

      await expect(adapter.close()).resolves.not.toThrow();
    });
  });
});

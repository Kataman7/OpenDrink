import initSqlJs from 'sql.js/dist/sql-asm.js';
import { Question } from '../domain/entities.js';
import {
  GameMode,
  buildQuestionQuery,
  buildWouldYouRatherQuery,
  buildImpostorWordQuery,
} from '../domain/value-objects.js';
import {
  QuestionRepositoryPort,
  PlayerRepositoryPort,
  DatabasePort,
} from '../application/ports/repository-ports.js';

export class QuestionsDatabaseAdapter {
  constructor() {
    this.db = null;
  }

  async load() {
    const SQL = await initSqlJs();
    const response = await fetch('/questions.sqlite');
    const buffer = await response.arrayBuffer();
    this.db = new SQL.Database(new Uint8Array(buffer));
  }

  getRandomQuestion({ gameMode, intensity, lang }) {
    if (gameMode === GameMode.IMPOSTOR) {
      return this.getRandomImpostorWord({ lang });
    }

    if (gameMode === GameMode.WOULD_YOU_RATHER) {
      return this.getRandomWouldYouRatherQuestion({ intensity, lang });
    }

    const gameKey = this.pickGameKey(gameMode);
    const query = buildQuestionQuery(gameKey, intensity);
    const result = this.db.exec(query.sql, query.params(lang));
    if (!result.length || !result[0].values.length) return null;
    const promptKind = this.getPromptKind(gameKey);
    return new Question({ sentence: result[0].values[0][0], promptKind });
  }

  getRandomImpostorWord({ lang }) {
    const query = buildImpostorWordQuery();
    const result = this.db.exec(query.sql, query.params(lang));
    if (!result.length || !result[0].values.length) return null;

    const [word, impostorHintWord] = result[0].values[0];
    return new Question({ sentence: word, impostorHintWord, promptKind: 'impostor' });
  }

  getRandomWouldYouRatherQuestion({ intensity, lang }) {
    const query = buildWouldYouRatherQuery(intensity);
    const result = this.db.exec(query.sql, query.params(lang));
    if (!result.length || !result[0].values.length) return null;

    const [choiceA, choiceB] = result[0].values[0];
    return new Question({ choiceA, choiceB, promptKind: 'would_you_rather' });
  }

  pickGameKey(gameMode) {
    const candidates = GameMode.getCandidateGameKeys(gameMode);
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }

  getPromptKind(gameKey) {
    if (gameKey === 'tod') return 'truth';
    if (gameKey === 'dare_chooser') return 'dare';
    if (gameKey === 'qpr') return 'who_could';
    return null;
  }
}

export class PlayersDatabaseAdapter {
  constructor() {
    this.db = null;
  }

  async initialize() {
    const SQL = await initSqlJs();
    this.db = new SQL.Database();
    this.db.run('CREATE TABLE players (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)');
  }

  savePlayer(name) {
    if (!this.db) {
      throw new Error('Database not initialized! Call initialize() first.');
    }
    this.db.run('INSERT INTO players (name) VALUES (?)', [name]);
    const insertResult = this.db.exec('SELECT last_insert_rowid()');
    if (!insertResult.length || !insertResult[0].values.length) return null;
    return insertResult[0].values[0][0];
  }

  getAllPlayers() {
    const result = this.db.exec('SELECT id, name FROM players');
    if (!result.length) return [];
    return result[0].values.map(([id, name]) => ({ id, name }));
  }

  removePlayerById(playerId) {
    this.db.run('DELETE FROM players WHERE id = ?', [playerId]);
  }
}

export class SqlJsQuestionRepositoryAdapter extends QuestionRepositoryPort {
  constructor(questionsDb) {
    super();
    this.questionsDb = questionsDb;
  }

  async getRandomQuestion({ gameMode, intensity, lang }) {
    return this.questionsDb.getRandomQuestion({ gameMode, intensity, lang });
  }
}

export class SqlJsPlayerRepositoryAdapter extends PlayerRepositoryPort {
  constructor(playersDb) {
    super();
    this.playersDb = playersDb;
  }

  async savePlayer(name) {
    return this.playersDb.savePlayer(name);
  }

  async getAllPlayers() {
    return this.playersDb.getAllPlayers();
  }

  async removePlayerById(playerId) {
    this.playersDb.removePlayerById(playerId);
  }
}

export class SqlJsDatabaseAdapter extends DatabasePort {
  constructor(questionsDb, playersDb) {
    super();
    this.questionsDb = questionsDb;
    this.playersDb = playersDb;
  }

  async initialize() {
    await this.questionsDb.load();
    await this.playersDb.initialize();
  }

  async close() {
    if (this.questionsDb.db) this.questionsDb.db.close();
    if (this.playersDb.db) this.playersDb.db.close();
  }
}

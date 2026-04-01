import initSqlJs from 'sql.js/dist/sql-asm.js';
import { Question } from '../domain/entities.js';
import { GameMode, buildQuestionQuery } from '../domain/value-objects.js';
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
    const gameKey = this.pickGameKey(gameMode);
    const query = buildQuestionQuery(gameKey, intensity);
    const result = this.db.exec(query.sql, query.params(lang));
    if (!result.length || !result[0].values.length) return null;
    const promptKind = this.getPromptKind(gameKey);
    return new Question({ sentence: result[0].values[0][0], promptKind });
  }

  pickGameKey(gameMode) {
    const candidates = GameMode.getCandidateGameKeys(gameMode);
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }

  getPromptKind(gameKey) {
    if (gameKey === 'tod') return 'truth';
    if (gameKey === 'dare_chooser') return 'dare';
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
    this.db.run('INSERT INTO players (name) VALUES (?)', [name]);
  }

  getAllPlayers() {
    const result = this.db.exec('SELECT id, name FROM players');
    if (!result.length) return [];
    return result[0].values.map(([id, name]) => ({ id, name }));
  }

  clearPlayers() {
    this.db.run('DELETE FROM players');
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
    this.playersDb.savePlayer(name);
  }

  async getAllPlayers() {
    return this.playersDb.getAllPlayers();
  }

  async clearPlayers() {
    this.playersDb.clearPlayers();
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

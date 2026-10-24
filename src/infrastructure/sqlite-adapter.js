import initSqlJs from 'sql.js/dist/sql-asm.js';
import { Question } from '../domain/entities.js';
import { GameMode } from '../domain/game-mode.js';
import { PROMPT_KIND_MAP } from '../domain/prompt-kind.js';
import {
  buildQuestionQuery,
  buildWouldYouRatherQuery,
  buildImpostorWordQuery,
  buildQuizQuery,
  buildTeamBattleQuery,
  buildDormellesQuery,
  buildPicoloQuery,
  buildTruthDareQuery,
} from './query-builders.js';
import {
  QuestionRepositoryPort,
  PlayerRepositoryPort,
  DatabasePort,
} from '../application/ports/repository-ports.js';

const QUESTIONS_DB_PATH = `${import.meta.env.BASE_URL}questions.sqlite`;

const CREATE_PLAYERS_TABLE_SQL =
  'CREATE TABLE players (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)';

export class QuestionsDatabaseAdapter {
  constructor() {
    this.db = null;
  }

  async load() {
    const SQL = await initSqlJs();
    const response = await fetch(QUESTIONS_DB_PATH);
    const buffer = await response.arrayBuffer();
    this.db = new SQL.Database(new Uint8Array(buffer));
  }

  getRandomQuestion({ gameMode, intensity, lang, playerCount, packId, excludeSentences = [] }) {
    switch (gameMode) {
      case GameMode.IMPOSTOR:
        return this.getImpostorQuestion({ lang, packId, excludeSentences });
      case GameMode.ACTION_TRUTH:
        return this.getActionTruthQuestion({ intensity, lang, playerCount, excludeSentences });
      case GameMode.WOULD_YOU_RATHER:
        return this.getWouldYouRatherQuestion({ intensity, lang, excludeSentences });
      case GameMode.QUIZ:
        return this.getQuizQuestion({ intensity, lang, excludeSentences });
      case GameMode.TEAM_BATTLE:
        return this.getTeamBattleQuestion({ intensity, lang, excludeSentences });
      case GameMode.DORMELLES:
        return this.getDormellesQuestion({ intensity, lang, excludeSentences });
      case GameMode.PICOLO:
        return this.getPicoloQuestion({ lang, playerCount, intensity, excludeSentences });
      case GameMode.TRUTH_DARE:
        return this.getTruthDareQuestion({ lang, playerCount, intensity, excludeSentences });
      default:
        return this.getGenericQuestion({ gameMode, intensity, lang, excludeSentences });
    }
  }

  getActionTruthQuestion({ intensity, lang, playerCount, excludeSentences = [] }) {
    const key = this.selectRandomGameKey(GameMode.ACTION_TRUTH);
    if (key === 'antoine_dares') {
      return this.getTruthDareQuestion({ lang, playerCount, intensity, excludeSentences });
    }
    return this.getGenericQuestion({
      gameMode: GameMode.ACTION_TRUTH,
      intensity,
      lang,
      specificKey: key,
      excludeSentences,
    });
  }

  getGenericQuestion({ gameMode, intensity, lang, specificKey = null, excludeSentences = [] }) {
    const gameKey = specificKey || this.selectRandomGameKey(gameMode);
    const query = buildQuestionQuery(gameKey, intensity);
    const row = this.executeCandidateQuery(query, lang, excludeSentences, r => r[0]);
    if (!row) return null;
    const promptKind = PROMPT_KIND_MAP[gameKey] || null;
    return new Question({ sentence: row[0], promptKind });
  }

  getImpostorQuestion({ lang, packId = null, excludeSentences = [] }) {
    const query = buildImpostorWordQuery(packId);
    let row = this.executeCandidateQuery(query, lang, excludeSentences, r => r[0]);
    if (!row && packId) {
      row = this.executeCandidateQuery(
        buildImpostorWordQuery(null),
        lang,
        excludeSentences,
        r => r[0]
      );
    }
    if (!row) return null;
    return new Question({ sentence: row[0], impostorHintWord: row[1], promptKind: 'impostor' });
  }

  getWouldYouRatherQuestion({ intensity, lang, excludeSentences = [] }) {
    const query = buildWouldYouRatherQuery(intensity);
    const row = this.executeCandidateQuery(query, lang, excludeSentences, r => `${r[0]}::${r[1]}`);
    if (!row) return null;
    return new Question({ choiceA: row[0], choiceB: row[1], promptKind: 'would_you_rather' });
  }

  getQuizQuestion({ intensity, lang, excludeSentences = [] }) {
    const query = buildQuizQuery(intensity);
    const row = this.executeCandidateQuery(query, lang, excludeSentences, r => r[0]);
    if (!row) return null;
    let options = null;
    try {
      options = JSON.parse(row[1]);
    } catch {
      options = null;
    }
    return new Question({ sentence: row[0], options, promptKind: 'quiz' });
  }

  getTeamBattleQuestion({ intensity, lang, excludeSentences = [] }) {
    const query = buildTeamBattleQuery(intensity);
    const row = this.executeCandidateQuery(query, lang, excludeSentences, r => r[1]);
    if (!row) return null;
    return new Question({ sentence: row[1], promptKind: `team_battle_${row[0]}` });
  }

  getDormellesQuestion({ intensity, lang, excludeSentences = [] }) {
    const query = buildDormellesQuery(intensity);
    const row = this.executeCandidateQuery(query, lang, excludeSentences, r => r[1]);
    if (!row) return null;
    return new Question({ sentence: row[1], promptKind: 'dormelles', cardId: row[0] });
  }

  getPicoloQuestion({ lang, playerCount, intensity = null, excludeSentences = [] }) {
    const query = buildPicoloQuery(playerCount, intensity);
    const row = this.executeCandidateQuery(query, lang, excludeSentences, r => r[1]);
    if (!row) return null;
    return new Question({ sentence: row[1], promptKind: `picolo_${row[0]}`, packName: row[2] });
  }

  getTruthDareQuestion({
    lang,
    playerCount,
    intensity = null,
    isAction = null,
    excludeSentences = [],
  }) {
    const query = buildTruthDareQuery(playerCount, intensity, isAction);
    const row = this.executeCandidateQuery(query, lang, excludeSentences, r => r[0]);
    if (!row) return null;
    return new Question({
      sentence: row[0],
      promptKind: `truth_dare_${row[1]}`,
      partyType: row[2],
      difficulty: row[3],
      timer: row[4],
    });
  }

  executeCandidateQuery(query, lang, excludeSentences = [], getSentenceKey = r => r[0]) {
    if (!this.db) throw new Error('Database not loaded');
    const result = this.db.exec(query.sql, query.params(lang));
    if (!result.length || !result[0].values.length) return null;
    const rows = result[0].values;
    if (!excludeSentences || excludeSentences.length === 0) {
      return rows[0];
    }
    const excludeSet = new Set(excludeSentences);
    const candidate = rows.find(row => !excludeSet.has(getSentenceKey(row)));
    return candidate || rows[0];
  }

  executeSingleQuery(query, lang) {
    return this.executeCandidateQuery(query, lang);
  }

  selectRandomGameKey(gameMode) {
    const candidates = GameMode.getCandidateGameKeys(gameMode);
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
}

export class PlayersDatabaseAdapter {
  constructor() {
    this.db = null;
  }

  async initialize() {
    const SQL = await initSqlJs();
    this.db = new SQL.Database();
    this.db.run(CREATE_PLAYERS_TABLE_SQL);
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
    if (!this.db) throw new Error('Database not initialized');
    const result = this.db.exec('SELECT id, name FROM players');
    if (!result.length) return [];
    return result[0].values.map(([id, name]) => ({ id, name }));
  }

  removePlayerById(playerId) {
    if (!this.db) throw new Error('Database not initialized');
    this.db.run('DELETE FROM players WHERE id = ?', [playerId]);
  }
}

export class SqlJsQuestionRepositoryAdapter extends QuestionRepositoryPort {
  constructor(questionsDb) {
    super();
    this.questionsDb = questionsDb;
  }

  async getRandomQuestion({ gameMode, intensity, lang, playerCount }) {
    return this.questionsDb.getRandomQuestion({ gameMode, intensity, lang, playerCount });
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

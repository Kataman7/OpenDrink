import { describe, it, expect } from 'vitest';
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

describe('buildQuestionQuery', () => {
  it('should return query with category_id for specific intensity', () => {
    const query = buildQuestionQuery('jnj', 'hot');
    expect(query.sql).toContain('WHERE game_key = ? AND category_id = ? AND lang = ?');
  });

  it('should return query without category_id for mixed intensity', () => {
    const query = buildQuestionQuery('jnj', 'mixed');
    expect(query.sql).toContain('WHERE game_key = ? AND lang = ?');
  });

  it('should include category_id 2 for dare_chooser with mixed intensity', () => {
    const query = buildQuestionQuery('dare_chooser', 'mixed');
    expect(query.sql).toContain('category_id IN (0, 1, 2)');
  });
});

describe('buildWouldYouRatherQuery', () => {
  it('should query tpf_questions with choice1 and choice2', () => {
    const query = buildWouldYouRatherQuery('soft');
    expect(query.sql).toContain('SELECT choice1, choice2 FROM tpf_questions');
    expect(query.sql).toContain('category_id = ?');
  });
});

describe('buildImpostorWordQuery', () => {
  it('should query imposter_words', () => {
    const query = buildImpostorWordQuery();
    expect(query.sql).toContain('SELECT word, imposter_hint_word FROM imposter_words');
  });
});

describe('buildQuizQuery', () => {
  it('should query quiz_questions with sentence and options_json', () => {
    const query = buildQuizQuery('soft');
    expect(query.sql).toContain('SELECT sentence, options_json FROM quiz_questions');
  });
});

describe('buildTeamBattleQuery', () => {
  it('should query team_battle_questions with mode and sentence', () => {
    const query = buildTeamBattleQuery('soft');
    expect(query.sql).toContain('SELECT mode, sentence FROM team_battle_questions');
  });
});

describe('buildDormellesQuery', () => {
  it('should query dormelles_questions with card_id and sentence', () => {
    const query = buildDormellesQuery('soft');
    expect(query.sql).toContain('SELECT card_id, sentence FROM dormelles_questions');
  });
});

describe('buildPicoloQuery', () => {
  it('should query picolo_rules with language', () => {
    const query = buildPicoloQuery();
    expect(query.sql).toContain(
      'SELECT type, text, pack_name FROM picolo_rules WHERE language = ?'
    );
  });
});

describe('buildTruthDareQuery', () => {
  it('should query antoine_dares with party_type and difficulty', () => {
    const query = buildTruthDareQuery(5);
    expect(query.sql).toContain(
      'SELECT sentence, is_action, party_type, difficulty FROM antoine_dares'
    );
    expect(query.sql).toContain("party_type = 'Group Only' OR party_type = 'All'");
    expect(query.params('fr')).toEqual(['fr']);
    expect(query.params('en')).toEqual(['en']);
    expect(query.params('de')).toEqual(['de']);
    expect(query.params('unknown')).toEqual(['en']);
  });

  it('should filter Couple Only for 2 or fewer players', () => {
    const query = buildTruthDareQuery(2);
    expect(query.sql).toContain("party_type = 'Couple Only' OR party_type = 'All'");
  });

  it('should filter Group Only for 3+ players', () => {
    const query = buildTruthDareQuery(3);
    expect(query.sql).toContain("party_type = 'Group Only' OR party_type = 'All'");
  });
});

import { QuestionIntensity } from './question-intensity.js';

function buildCategoryAwareQuery(table, columns, intensity) {
  const categoryId = QuestionIntensity.toCategoryId(intensity);
  const columnList = columns.join(', ');

  if (categoryId !== null) {
    return {
      sql: `SELECT ${columnList} FROM ${table} WHERE category_id = ? AND lang = ? ORDER BY RANDOM() LIMIT 1`,
      params: lang => [categoryId, lang],
    };
  }
  return {
    sql: `SELECT ${columnList} FROM ${table} WHERE category_id IN (0, 1) AND lang = ? ORDER BY RANDOM() LIMIT 1`,
    params: lang => [lang],
  };
}

export function buildQuestionQuery(gameKey, intensity) {
  const categoryId = QuestionIntensity.toCategoryId(intensity);

  if (gameKey === 'dare_chooser' && categoryId === null) {
    return {
      sql: 'SELECT sentence FROM questions WHERE game_key = ? AND category_id IN (0, 1, 2) AND lang = ? ORDER BY RANDOM() LIMIT 1',
      params: lang => [gameKey, lang],
    };
  }

  if (categoryId !== null) {
    return {
      sql: 'SELECT sentence FROM questions WHERE game_key = ? AND category_id = ? AND lang = ? ORDER BY RANDOM() LIMIT 1',
      params: lang => [gameKey, categoryId, lang],
    };
  }
  return {
    sql: 'SELECT sentence FROM questions WHERE game_key = ? AND lang = ? ORDER BY RANDOM() LIMIT 1',
    params: lang => [gameKey, lang],
  };
}

export const buildWouldYouRatherQuery = intensity =>
  buildCategoryAwareQuery('tpf_questions', ['choice1', 'choice2'], intensity);

export const buildQuizQuery = intensity =>
  buildCategoryAwareQuery('quiz_questions', ['sentence', 'options_json'], intensity);

export const buildTeamBattleQuery = intensity =>
  buildCategoryAwareQuery('team_battle_questions', ['mode', 'sentence'], intensity);

export const buildDormellesQuery = intensity =>
  buildCategoryAwareQuery('dormelles_questions', ['card_id', 'sentence'], intensity);

export function buildImpostorWordQuery() {
  return {
    sql: 'SELECT word, imposter_hint_word FROM imposter_words WHERE lang = ? ORDER BY RANDOM() LIMIT 1',
    params: lang => [lang],
  };
}

export function buildPicoloQuery() {
  return {
    sql: 'SELECT type, text, pack_name FROM picolo_rules WHERE language = ? ORDER BY RANDOM() LIMIT 1',
    params: lang => [lang],
  };
}

const ANTOINE_LANG_MAP = {
  fr: 'fr',
  en: 'en',
  de: 'de',
  ja: 'ja',
  ko: 'ko',
  es: 'es',
  pt: 'pt',
  it: 'it',
  'zh-Hans': 'zh',
  'zh-Hant': 'zhHA',
  ru: 'ru',
  nl: 'nl',
  sv: 'sv',
  el: 'el',
};

export function buildTruthDareQuery() {
  return {
    sql: 'SELECT sentence, is_action FROM antoine_dares WHERE lang = ? ORDER BY RANDOM() LIMIT 1',
    params: lang => [ANTOINE_LANG_MAP[lang] || 'en'],
  };
}

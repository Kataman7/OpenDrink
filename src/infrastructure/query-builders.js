import { QuestionIntensity } from '../domain/question-intensity.js';

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
      sql: 'SELECT sentence FROM questions WHERE game_key = ? AND category_id IN (0, 1, 2) AND lang = ? AND sentence IS NOT NULL AND trim(sentence) != "" ORDER BY RANDOM() LIMIT 1',
      params: lang => [gameKey, lang],
    };
  }

  if (categoryId !== null) {
    return {
      sql: 'SELECT sentence FROM questions WHERE game_key = ? AND category_id = ? AND lang = ? AND sentence IS NOT NULL AND trim(sentence) != "" ORDER BY RANDOM() LIMIT 1',
      params: lang => [gameKey, categoryId, lang],
    };
  }
  return {
    sql: 'SELECT sentence FROM questions WHERE game_key = ? AND lang = ? AND sentence IS NOT NULL AND trim(sentence) != "" ORDER BY RANDOM() LIMIT 1',
    params: lang => [gameKey, lang],
  };
}

export const buildWouldYouRatherQuery = intensity =>
  buildCategoryAwareQuery('tpf_questions', ['choice1', 'choice2'], intensity);

export function buildQuizQuery(intensity) {
  const categoryId = QuestionIntensity.toCategoryId(intensity);
  if (categoryId !== null) {
    return {
      sql: 'SELECT sentence, options_json FROM quiz_questions WHERE category_id = ? AND lang = ? AND sentence IS NOT NULL AND trim(sentence) != "" ORDER BY RANDOM() LIMIT 1',
      params: lang => [categoryId, lang],
    };
  }
  return {
    sql: 'SELECT sentence, options_json FROM quiz_questions WHERE category_id IN (0, 1, 2, 3) AND lang = ? AND sentence IS NOT NULL AND trim(sentence) != "" ORDER BY RANDOM() LIMIT 1',
    params: lang => [lang],
  };
}

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

const PICOLO_LANGS = new Set([
  'da',
  'de',
  'en',
  'es',
  'fi',
  'fr',
  'it',
  'ja',
  'ko',
  'nb',
  'nl',
  'pl',
  'pt',
  'sv',
]);

export function buildPicoloQuery(playerCount = null) {
  const playerFilter = playerCount !== null ? 'AND (nb_players IS NULL OR nb_players <= ?)' : '';
  return {
    sql: `SELECT type, text, pack_name FROM picolo_rules WHERE language = ? AND (parent_key IS NULL OR parent_key = '') ${playerFilter} ORDER BY RANDOM() LIMIT 1`,
    params: lang => {
      const resolvedLang = PICOLO_LANGS.has(lang) ? lang : 'en';
      return playerCount !== null ? [resolvedLang, playerCount] : [resolvedLang];
    },
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

export function buildTruthDareQuery(playerCount) {
  let partyFilter = '';
  if (playerCount <= 2) {
    partyFilter = "AND (party_type = 'Couple Only' OR party_type = 'All')";
  } else {
    partyFilter = "AND (party_type = 'Group Only' OR party_type = 'All')";
  }
  return {
    sql: `SELECT sentence, is_action, party_type, difficulty, timer FROM antoine_dares WHERE lang = ? ${partyFilter} ORDER BY RANDOM() LIMIT 1`,
    params: lang => [ANTOINE_LANG_MAP[lang] || 'en'],
  };
}

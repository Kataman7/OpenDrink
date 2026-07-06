import { UnsupportedGameModeError, UnsupportedIntensityError } from './errors.js';

export class GameMode {
  static NEVER_HAVE_I_EVER = 'never_have_i_ever';
  static ACTION_TRUTH = 'action_truth';
  static WOULD_YOU_RATHER = 'would_you_rather';
  static WHO_COULD = 'who_could';
  static IMPOSTOR = 'impostor';
  static SEVEN_SECONDS = 'seven_seconds';
  static ITS_A_10 = 'its_a_10';
  static QUIZ = 'quiz';
  static TEAM_BATTLE = 'team_battle';
  static DORMELLES = 'dormelles';
  static PICOLO = 'picolo';
  static TRUTH_DARE = 'truth_dare';
  static RANDOM = 'random';

  static getCandidateGameKeys(gameMode) {
    if (gameMode === GameMode.NEVER_HAVE_I_EVER) return ['jnj'];
    if (gameMode === GameMode.ACTION_TRUTH) return ['tod', 'dare_chooser'];
    if (gameMode === GameMode.WHO_COULD) return ['qpr'];
    if (gameMode === GameMode.SEVEN_SECONDS) return ['7seconds'];
    if (gameMode === GameMode.ITS_A_10) return ['a_10'];
    throw new UnsupportedGameModeError(gameMode);
  }

  static needsIntensity(gameMode) {
    if (gameMode === GameMode.RANDOM) return true;
    return (
      gameMode !== GameMode.IMPOSTOR &&
      gameMode !== GameMode.PICOLO &&
      gameMode !== GameMode.TRUTH_DARE
    );
  }
}

export class QuestionIntensity {
  static SOFT = 'soft';
  static HOT = 'hot';
  static MIXED = 'mixed';

  static toCategoryId(intensity) {
    if (intensity === QuestionIntensity.SOFT) return 0;
    if (intensity === QuestionIntensity.HOT) return 1;
    if (intensity === QuestionIntensity.MIXED) return null;
    throw new UnsupportedIntensityError(intensity);
  }
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

export function buildWouldYouRatherQuery(intensity) {
  const categoryId = QuestionIntensity.toCategoryId(intensity);
  if (categoryId !== null) {
    return {
      sql: 'SELECT choice1, choice2 FROM tpf_questions WHERE category_id = ? AND lang = ? ORDER BY RANDOM() LIMIT 1',
      params: lang => [categoryId, lang],
    };
  }

  return {
    sql: 'SELECT choice1, choice2 FROM tpf_questions WHERE category_id IN (0, 1) AND lang = ? ORDER BY RANDOM() LIMIT 1',
    params: lang => [lang],
  };
}

export function buildImpostorWordQuery() {
  return {
    sql: 'SELECT word, imposter_hint_word FROM imposter_words WHERE lang = ? ORDER BY RANDOM() LIMIT 1',
    params: lang => [lang],
  };
}

export function buildQuizQuery(intensity) {
  const categoryId = QuestionIntensity.toCategoryId(intensity);
  if (categoryId !== null) {
    return {
      sql: 'SELECT sentence, options_json FROM quiz_questions WHERE category_id = ? AND lang = ? ORDER BY RANDOM() LIMIT 1',
      params: lang => [categoryId, lang],
    };
  }
  return {
    sql: 'SELECT sentence, options_json FROM quiz_questions WHERE category_id IN (0, 1) AND lang = ? ORDER BY RANDOM() LIMIT 1',
    params: lang => [lang],
  };
}

export function buildTeamBattleQuery(intensity) {
  const categoryId = QuestionIntensity.toCategoryId(intensity);
  if (categoryId !== null) {
    return {
      sql: 'SELECT mode, sentence FROM team_battle_questions WHERE category_id = ? AND lang = ? ORDER BY RANDOM() LIMIT 1',
      params: lang => [categoryId, lang],
    };
  }
  return {
    sql: 'SELECT mode, sentence FROM team_battle_questions WHERE category_id IN (0, 1) AND lang = ? ORDER BY RANDOM() LIMIT 1',
    params: lang => [lang],
  };
}

export function buildDormellesQuery(intensity) {
  const categoryId = QuestionIntensity.toCategoryId(intensity);
  if (categoryId !== null) {
    return {
      sql: 'SELECT card_id, sentence FROM dormelles_questions WHERE category_id = ? AND lang = ? ORDER BY RANDOM() LIMIT 1',
      params: lang => [categoryId, lang],
    };
  }
  return {
    sql: 'SELECT card_id, sentence FROM dormelles_questions WHERE category_id IN (0, 1) AND lang = ? ORDER BY RANDOM() LIMIT 1',
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

export const SUPPORTED_LANGUAGES = [
  { code: 'bg', label: 'Български' },
  { code: 'cs', label: 'Čeština' },
  { code: 'da', label: 'Dansk' },
  { code: 'de', label: 'Deutsch' },
  { code: 'el', label: 'Ελληνικά' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fi', label: 'Suomi' },
  { code: 'fil', label: 'Filipino' },
  { code: 'fr', label: 'Français' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'hr', label: 'Hrvatski' },
  { code: 'hu', label: 'Magyar' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'it', label: 'Italiano' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'nb', label: 'Norsk' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'pl', label: 'Polski' },
  { code: 'pt', label: 'Português' },
  { code: 'ro', label: 'Română' },
  { code: 'ru', label: 'Русский' },
  { code: 'sv', label: 'Svenska' },
  { code: 'th', label: 'ไทย' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'uk', label: 'Українська' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'zh-Hans', label: '简体中文' },
  { code: 'zh-Hant', label: '繁體中文' },
];

import { UnsupportedGameModeError, UnsupportedIntensityError } from './errors.js';

export class GameMode {
  static NEVER_HAVE_I_EVER = 'never_have_i_ever';
  static ACTION_TRUTH = 'action_truth';

  static getCandidateGameKeys(gameMode) {
    if (gameMode === GameMode.NEVER_HAVE_I_EVER) return ['jnj'];
    if (gameMode === GameMode.ACTION_TRUTH) return ['tod', 'dare_chooser'];
    throw new UnsupportedGameModeError(gameMode);
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
      sql: 'SELECT sentence FROM questions WHERE game_key = ? AND category_id IN (0, 1) AND lang = ? ORDER BY RANDOM() LIMIT 1',
      params: (lang) => [gameKey, lang],
    };
  }

  if (categoryId !== null) {
    return {
      sql: 'SELECT sentence FROM questions WHERE game_key = ? AND category_id = ? AND lang = ? ORDER BY RANDOM() LIMIT 1',
      params: (lang) => [gameKey, categoryId, lang],
    };
  }
  return {
    sql: 'SELECT sentence FROM questions WHERE game_key = ? AND lang = ? ORDER BY RANDOM() LIMIT 1',
    params: (lang) => [gameKey, lang],
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

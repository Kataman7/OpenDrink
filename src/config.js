const BROWSER_LANG_CODES = [
  'bg',
  'cs',
  'da',
  'de',
  'el',
  'en',
  'es',
  'fi',
  'fil',
  'fr',
  'hi',
  'hr',
  'hu',
  'id',
  'it',
  'ja',
  'ko',
  'nb',
  'nl',
  'pl',
  'pt',
  'ro',
  'ru',
  'sv',
  'th',
  'tr',
  'uk',
  'vi',
  'zh',
];

const DEFAULT_LANG_FALLBACK = 'en';

export function detectBrowserLanguage() {
  if (typeof navigator === 'undefined') return DEFAULT_LANG_FALLBACK;
  const raw = navigator.language || navigator.userLanguage || '';
  const code = raw.split('-')[0].toLowerCase();
  return BROWSER_LANG_CODES.includes(code) ? code : DEFAULT_LANG_FALLBACK;
}

export const DEFAULT_LANG = detectBrowserLanguage();

export const SEVEN_SECONDS_DURATION = 7;

export const ERROR_DISPLAY_DURATION_MS = 3000;

export const DEFAULT_SPEECH_RATE = 0.8;

export const TOZ_MIN = 2;
export const TOZ_MAX = 5;

export const PICOL0_MIN = 1;
export const PICOL0_MAX = 5;

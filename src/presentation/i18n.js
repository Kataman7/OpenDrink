import translations from './translations.json';

const DEFAULT_LANG = 'en';

function getNestedValue(object, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), object);
}

function replaceParams(text, params) {
  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replaceAll(`{${key}}`, String(value));
  }, text);
}

export class I18n {
  constructor() {
    this.currentLang = DEFAULT_LANG;
  }

  setLanguage(lang) {
    this.currentLang = lang || DEFAULT_LANG;
  }

  t(key, params = {}) {
    const langPack = translations[this.currentLang] || translations[DEFAULT_LANG];
    const fallbackPack = translations[DEFAULT_LANG];
    const raw = getNestedValue(langPack, key) ?? getNestedValue(fallbackPack, key) ?? key;
    if (typeof raw !== 'string') return key;
    return replaceParams(raw, params);
  }
}

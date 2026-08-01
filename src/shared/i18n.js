export const FALLBACK_LANG = 'en';

export class I18n {
  constructor({ translations = {}, defaultLang = FALLBACK_LANG } = {}) {
    this.translations = translations;
    this.defaultLang = defaultLang;
    this.currentLang = defaultLang;
  }

  setLanguage(lang) {
    this.currentLang = lang || this.defaultLang;
  }
  t(key, params = {}) {
    const langPack = this.translations[this.currentLang] || this.translations[FALLBACK_LANG];
    const fallbackPack = this.translations[FALLBACK_LANG];
    const raw = this.getNestedValue(langPack, key) ?? this.getNestedValue(fallbackPack, key) ?? key;
    if (typeof raw !== 'string') return key;
    return this.replaceParams(raw, params);
  }

  getNestedValue(object, path) {
    if (!path || typeof path !== 'string') return null;
    return path
      .split('.')
      .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), object);
  }

  replaceParams(text, params) {
    return Object.entries(params).reduce((acc, [key, value]) => {
      return acc.replaceAll(`{${key}}`, String(value));
    }, text);
  }
}

import { DEFAULT_LANG } from '../config.js';

export class I18n {
  constructor({ translations = {} } = {}) {
    this.translations = translations;
    this.defaultLang = DEFAULT_LANG;
    this.currentLang = DEFAULT_LANG;
  }

  setLanguage(lang) {
    this.currentLang = lang || this.defaultLang;
  }

  t(key, params = {}) {
    const langPack = this.translations[this.currentLang] || this.translations[this.defaultLang];
    const fallbackPack = this.translations[this.defaultLang];
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

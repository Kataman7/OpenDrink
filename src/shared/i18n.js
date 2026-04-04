export class I18n {
  constructor({ translations = {}, defaultLang = 'en' } = {}) {
    this.translations = translations;
    this.defaultLang = defaultLang;
    this.currentLang = defaultLang;
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

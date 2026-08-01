import { I18n } from '../shared/i18n.js';
import { DEFAULT_LANG } from '../config.js';
import translations from './translations.json';

export function createI18n() {
  return new I18n({ translations, defaultLang: DEFAULT_LANG });
}

import { I18n } from '../shared/i18n.js';
import translations from './translations.json';

const DEFAULT_LANG = 'en';

export function createI18n() {
  return new I18n({
    translations,
    defaultLang: DEFAULT_LANG,
  });
}

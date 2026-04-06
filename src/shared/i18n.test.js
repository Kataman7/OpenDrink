import { describe, it, expect, beforeEach } from 'vitest';
import { I18n } from './i18n.js';

describe('I18n', () => {
  let translations;

  beforeEach(() => {
    translations = {
      en: {
        greeting: 'Hello {name}!',
        welcome: 'Welcome to OpenDrink',
        nested: {
          message: 'This is a nested message',
        },
        drinks: 'You have {count} drinks left',
      },
      fr: {
        greeting: 'Bonjour {name}!',
      },
      es: {
        greeting: '¡Hola {name}!',
        welcome: 'Bienvenido a OpenDrink',
      },
    };
  });

  describe('constructor', () => {
    it('uses default values when no options provided', () => {
      const i18n = new I18n();
      expect(i18n.translations).toEqual({});
      expect(i18n.defaultLang).toBe('en');
      expect(i18n.currentLang).toBe('en');
    });

    it('initializes with provided translations and defaultLang', () => {
      const i18n = new I18n({ translations, defaultLang: 'fr' });
      expect(i18n.translations).toEqual(translations);
      expect(i18n.defaultLang).toBe('fr');
      expect(i18n.currentLang).toBe('fr');
    });

    it('starts with currentLang equal to defaultLang', () => {
      const i18n = new I18n({ translations, defaultLang: 'en' });
      expect(i18n.currentLang).toBe(i18n.defaultLang);
    });
  });

  describe('setLanguage', () => {
    it('changes the current language', () => {
      const i18n = new I18n({ translations, defaultLang: 'en' });
      i18n.setLanguage('fr');
      expect(i18n.currentLang).toBe('fr');
    });

    it('falls back to defaultLang when given null', () => {
      const i18n = new I18n({ translations, defaultLang: 'en' });
      i18n.setLanguage('fr');
      i18n.setLanguage(null);
      expect(i18n.currentLang).toBe('en');
    });

    it('falls back to defaultLang when given undefined', () => {
      const i18n = new I18n({ translations, defaultLang: 'en' });
      i18n.setLanguage('fr');
      i18n.setLanguage(undefined);
      expect(i18n.currentLang).toBe('en');
    });

    it('falls back to defaultLang when given empty string', () => {
      const i18n = new I18n({ translations, defaultLang: 'en' });
      i18n.setLanguage('fr');
      i18n.setLanguage('');
      expect(i18n.currentLang).toBe('en');
    });

    it('can switch between multiple languages', () => {
      const i18n = new I18n({ translations, defaultLang: 'en' });
      i18n.setLanguage('fr');
      expect(i18n.currentLang).toBe('fr');
      i18n.setLanguage('es');
      expect(i18n.currentLang).toBe('es');
      i18n.setLanguage('en');
      expect(i18n.currentLang).toBe('en');
    });
  });

  describe('t (translate)', () => {
    describe('basic translation', () => {
      it('returns translation for existing key', () => {
        const i18n = new I18n({ translations, defaultLang: 'en' });
        expect(i18n.t('greeting')).toBe('Hello {name}!');
      });

      it('returns translation in current language', () => {
        const i18n = new I18n({ translations, defaultLang: 'en' });
        i18n.setLanguage('fr');
        expect(i18n.t('greeting')).toBe('Bonjour {name}!');
      });

      it('returns translation in Spanish', () => {
        const i18n = new I18n({ translations, defaultLang: 'en' });
        i18n.setLanguage('es');
        expect(i18n.t('greeting')).toBe('¡Hola {name}!');
      });
    });

    describe('fallback to default language', () => {
      it('returns key when translation does not exist in current language', () => {
        const i18n = new I18n({ translations, defaultLang: 'en' });
        i18n.setLanguage('fr');
        expect(i18n.t('welcome')).toBe('Welcome to OpenDrink');
      });

      it('returns key when current language does not exist', () => {
        const i18n = new I18n({ translations, defaultLang: 'en' });
        i18n.setLanguage('de');
        expect(i18n.t('welcome')).toBe('Welcome to OpenDrink');
      });

      it('falls back to defaultLang even when currentLang is set', () => {
        const i18n = new I18n({ translations, defaultLang: 'en' });
        i18n.setLanguage('fr');
        expect(i18n.t('nested.message')).toBe('This is a nested message');
      });

      it('returns key when key does not exist in any language', () => {
        const i18n = new I18n({ translations, defaultLang: 'en' });
        expect(i18n.t('nonexistent.key')).toBe('nonexistent.key');
      });
    });

    describe('nested keys', () => {
      it('returns nested translation using dot notation', () => {
        const i18n = new I18n({ translations, defaultLang: 'en' });
        expect(i18n.t('nested.message')).toBe('This is a nested message');
      });

      it('returns key for non-existent nested path', () => {
        const i18n = new I18n({ translations, defaultLang: 'en' });
        expect(i18n.t('nested.nonexistent')).toBe('nested.nonexistent');
      });
    });
  });

  describe('parameter interpolation', () => {
    it('replaces single parameter in translation', () => {
      const i18n = new I18n({ translations, defaultLang: 'en' });
      expect(i18n.t('greeting', { name: 'Alice' })).toBe('Hello Alice!');
    });

    it('replaces parameter with different values', () => {
      const i18n = new I18n({ translations, defaultLang: 'en' });
      expect(i18n.t('greeting', { name: 'Bob' })).toBe('Hello Bob!');
    });

    it('replaces multiple parameters', () => {
      const translationsWithMultiple = {
        en: {
          message: 'Hello {name}, you have {count} messages',
        },
      };
      const i18n = new I18n({ translations: translationsWithMultiple, defaultLang: 'en' });
      expect(i18n.t('message', { name: 'Alice', count: 5 })).toBe(
        'Hello Alice, you have 5 messages'
      );
    });

    it('replaces parameter with number', () => {
      const i18n = new I18n({ translations, defaultLang: 'en' });
      expect(i18n.t('drinks', { count: 10 })).toBe('You have 10 drinks left');
    });

    it('replaces same parameter multiple times', () => {
      const translationsSameParam = {
        en: {
          repeated: '{name} said {name} said {name}',
        },
      };
      const i18n = new I18n({ translations: translationsSameParam, defaultLang: 'en' });
      expect(i18n.t('repeated', { name: 'Bob' })).toBe('Bob said Bob said Bob');
    });

    it('works with empty params object', () => {
      const i18n = new I18n({ translations, defaultLang: 'en' });
      expect(i18n.t('greeting', {})).toBe('Hello {name}!');
    });

    it('leaves unreplaced placeholders when param not provided', () => {
      const i18n = new I18n({ translations, defaultLang: 'en' });
      expect(i18n.t('greeting')).toBe('Hello {name}!');
    });

    it('interpolates with language-specific translation', () => {
      const i18n = new I18n({ translations, defaultLang: 'en' });
      i18n.setLanguage('fr');
      expect(i18n.t('greeting', { name: 'Marie' })).toBe('Bonjour Marie!');
    });
  });

  describe('non-string translation values', () => {
    it('returns key when translation value is an object', () => {
      const translationsWithObject = {
        en: {
          greeting: { text: 'Hello' },
        },
      };
      const i18n = new I18n({ translations: translationsWithObject, defaultLang: 'en' });
      expect(i18n.t('greeting')).toBe('greeting');
    });

    it('returns key when translation value is an array', () => {
      const translationsWithArray = {
        en: {
          items: ['one', 'two', 'three'],
        },
      };
      const i18n = new I18n({ translations: translationsWithArray, defaultLang: 'en' });
      expect(i18n.t('items')).toBe('items');
    });
  });

  describe('language switching', () => {
    it('correctly retrieves translations after switching languages', () => {
      const i18n = new I18n({ translations, defaultLang: 'en' });

      expect(i18n.t('greeting')).toBe('Hello {name}!');

      i18n.setLanguage('fr');
      expect(i18n.t('greeting')).toBe('Bonjour {name}!');

      i18n.setLanguage('es');
      expect(i18n.t('greeting')).toBe('¡Hola {name}!');
    });

    it('maintains correct fallback after language switch', () => {
      const i18n = new I18n({ translations, defaultLang: 'en' });

      i18n.setLanguage('fr');
      expect(i18n.t('drinks', { count: 5 })).toBe('You have 5 drinks left');
    });
  });
});

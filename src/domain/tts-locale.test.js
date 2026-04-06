import { describe, it, expect } from 'vitest';
import { toTtsLocale, TTS_LOCALE_MAP } from './tts-locale.js';

describe('tts-locale', () => {
  describe('toTtsLocale', () => {
    describe('when language is supported', () => {
      it('should return correct TTS locale for bg (Bulgarian)', () => {
        expect(toTtsLocale('bg')).toBe('bg-BG');
      });

      it('should return correct TTS locale for cs (Czech)', () => {
        expect(toTtsLocale('cs')).toBe('cs-CZ');
      });

      it('should return correct TTS locale for da (Danish)', () => {
        expect(toTtsLocale('da')).toBe('da-DK');
      });

      it('should return correct TTS locale for de (German)', () => {
        expect(toTtsLocale('de')).toBe('de-DE');
      });

      it('should return correct TTS locale for el (Greek)', () => {
        expect(toTtsLocale('el')).toBe('el-GR');
      });

      it('should return correct TTS locale for en (English)', () => {
        expect(toTtsLocale('en')).toBe('en-US');
      });

      it('should return correct TTS locale for es (Spanish)', () => {
        expect(toTtsLocale('es')).toBe('es-ES');
      });

      it('should return correct TTS locale for fi (Finnish)', () => {
        expect(toTtsLocale('fi')).toBe('fi-FI');
      });

      it('should return correct TTS locale for fil (Filipino)', () => {
        expect(toTtsLocale('fil')).toBe('fil-PH');
      });

      it('should return correct TTS locale for fr (French)', () => {
        expect(toTtsLocale('fr')).toBe('fr-FR');
      });

      it('should return correct TTS locale for hi (Hindi)', () => {
        expect(toTtsLocale('hi')).toBe('hi-IN');
      });

      it('should return correct TTS locale for hr (Croatian)', () => {
        expect(toTtsLocale('hr')).toBe('hr-HR');
      });

      it('should return correct TTS locale for hu (Hungarian)', () => {
        expect(toTtsLocale('hu')).toBe('hu-HU');
      });

      it('should return correct TTS locale for id (Indonesian)', () => {
        expect(toTtsLocale('id')).toBe('id-ID');
      });

      it('should return correct TTS locale for it (Italian)', () => {
        expect(toTtsLocale('it')).toBe('it-IT');
      });

      it('should return correct TTS locale for ja (Japanese)', () => {
        expect(toTtsLocale('ja')).toBe('ja-JP');
      });

      it('should return correct TTS locale for ko (Korean)', () => {
        expect(toTtsLocale('ko')).toBe('ko-KR');
      });

      it('should return correct TTS locale for nb (Norwegian Bokmal)', () => {
        expect(toTtsLocale('nb')).toBe('nb-NO');
      });

      it('should return correct TTS locale for nl (Dutch)', () => {
        expect(toTtsLocale('nl')).toBe('nl-NL');
      });

      it('should return correct TTS locale for pl (Polish)', () => {
        expect(toTtsLocale('pl')).toBe('pl-PL');
      });

      it('should return correct TTS locale for pt (Portuguese)', () => {
        expect(toTtsLocale('pt')).toBe('pt-BR');
      });

      it('should return correct TTS locale for ro (Romanian)', () => {
        expect(toTtsLocale('ro')).toBe('ro-RO');
      });

      it('should return correct TTS locale for ru (Russian)', () => {
        expect(toTtsLocale('ru')).toBe('ru-RU');
      });

      it('should return correct TTS locale for sv (Swedish)', () => {
        expect(toTtsLocale('sv')).toBe('sv-SE');
      });

      it('should return correct TTS locale for th (Thai)', () => {
        expect(toTtsLocale('th')).toBe('th-TH');
      });

      it('should return correct TTS locale for tr (Turkish)', () => {
        expect(toTtsLocale('tr')).toBe('tr-TR');
      });

      it('should return correct TTS locale for uk (Ukrainian)', () => {
        expect(toTtsLocale('uk')).toBe('uk-UA');
      });

      it('should return correct TTS locale for vi (Vietnamese)', () => {
        expect(toTtsLocale('vi')).toBe('vi-VN');
      });

      it('should return correct TTS locale for zh-Hans (Simplified Chinese)', () => {
        expect(toTtsLocale('zh-Hans')).toBe('zh-CN');
      });

      it('should return correct TTS locale for zh-Hant (Traditional Chinese)', () => {
        expect(toTtsLocale('zh-Hant')).toBe('zh-TW');
      });
    });

    describe('when language is unknown', () => {
      it('should return en-US as fallback for unknown language', () => {
        expect(toTtsLocale('unknown')).toBe('en-US');
      });

      it('should return en-US as fallback for empty string', () => {
        expect(toTtsLocale('')).toBe('en-US');
      });

      it('should return en-US as fallback for null', () => {
        expect(toTtsLocale(null)).toBe('en-US');
      });

      it('should return en-US as fallback for undefined', () => {
        expect(toTtsLocale(undefined)).toBe('en-US');
      });
    });
  });

  describe('TTS_LOCALE_MAP', () => {
    it('should have 30 supported languages', () => {
      expect(Object.keys(TTS_LOCALE_MAP)).toHaveLength(30);
    });

    it('should have valid locale format for all entries', () => {
      Object.values(TTS_LOCALE_MAP).forEach(locale => {
        expect(locale).toMatch(/^[a-z]{2,3}-[A-Z]{2}$/);
      });
    });

    it('should have zh-CN for zh-Hans', () => {
      expect(TTS_LOCALE_MAP['zh-Hans']).toBe('zh-CN');
    });

    it('should have zh-TW for zh-Hant', () => {
      expect(TTS_LOCALE_MAP['zh-Hant']).toBe('zh-TW');
    });
  });
});

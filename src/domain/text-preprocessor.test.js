import { describe, it, expect } from 'vitest';
import { preprocessForTts } from './text-preprocessor.js';

describe('preprocessForTts', () => {
  const createMockI18n = (translations = {}) => ({
    t: key => translations[key] || key,
  });

  describe('when text is falsy', () => {
    it('should return empty string for null', () => {
      expect(preprocessForTts(null, 'jnj', createMockI18n())).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(preprocessForTts(undefined, 'jnj', createMockI18n())).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(preprocessForTts('', 'jnj', createMockI18n())).toBe('');
    });
  });

  describe('basic text processing', () => {
    it('should remove dots from text', () => {
      const text = 'Hello. World.';
      const i18n = createMockI18n();
      expect(preprocessForTts(text, 'jnj', i18n)).toBe('Hello World');
    });

    it('should normalize whitespace', () => {
      const text = 'Hello    World';
      const i18n = createMockI18n();
      expect(preprocessForTts(text, 'jnj', i18n)).toBe('Hello World');
    });

    it('should trim leading and trailing whitespace', () => {
      const text = '  Hello World  ';
      const i18n = createMockI18n();
      expect(preprocessForTts(text, 'jnj', i18n)).toBe('Hello World');
    });

    it('should process text with multiple whitespace and dots', () => {
      const text = '  Hello . World .  ';
      const i18n = createMockI18n();
      expect(preprocessForTts(text, 'jnj', i18n)).toBe('Hello World');
    });
  });

  describe('i18n replacements', () => {
    const translations = {
      'round.ttsReplaceAnd': ' und ',
      'round.ttsReplaceOr': ' oder ',
    };

    it('should replace & with i18n translation', () => {
      const i18n = createMockI18n(translations);
      expect(preprocessForTts('rock & roll', 'jnj', i18n)).toBe('rock und roll');
    });

    it('should replace / with i18n translation', () => {
      const i18n = createMockI18n(translations);
      expect(preprocessForTts('yes/no', 'jnj', i18n)).toBe('yes oder no');
    });

    it('should replace both & and / with i18n translations', () => {
      const i18n = createMockI18n(translations);
      expect(preprocessForTts('rock & roll / nothing else', 'jnj', i18n)).toBe(
        'rock und roll oder nothing else'
      );
    });

    it('should use key as fallback when translation is not found', () => {
      const i18n = createMockI18n({});
      expect(preprocessForTts('rock & roll / nothing else', 'jnj', i18n)).toBe(
        'rock roundttsReplaceAnd roll roundttsReplaceOr nothing else'
      );
    });

    it('should not replace when i18n is not provided', () => {
      expect(preprocessForTts('rock & roll / nothing else', 'jnj', null)).toBe(
        'rock & roll / nothing else'
      );
    });

    it('should use key as fallback when translation is not found', () => {
      const i18n = createMockI18n({});
      expect(preprocessForTts('rock & roll / nothing else', 'jnj', i18n)).toBe(
        'rock roundttsReplaceAnd roll roundttsReplaceOr nothing else'
      );
    });
  });

  describe('game mode prefixes', () => {
    const translations = {
      'round.ttsPrefixWouldYouRather': 'Would you rather ',
      'round.ttsPrefixNeverHaveIEver': 'I have never ',
      'round.ttsPrefixWhoCould': 'Who could ',
    };

    it('should add prefix for would_you_rather mode', () => {
      const i18n = createMockI18n(translations);
      expect(preprocessForTts('kiss or hug?', 'would_you_rather', i18n)).toBe(
        'Would you rather kiss or hug?'
      );
    });

    it('should add prefix for never_have_i_ever mode', () => {
      const i18n = createMockI18n(translations);
      expect(preprocessForTts('been to Paris', 'never_have_i_ever', i18n)).toBe(
        'I have never been to Paris'
      );
    });

    it('should add prefix for who_could mode', () => {
      const i18n = createMockI18n(translations);
      expect(preprocessForTts('drink the most?', 'who_could', i18n)).toBe(
        'Who could drink the most?'
      );
    });

    it('should not add prefix when game mode has no prefix key', () => {
      const i18n = createMockI18n(translations);
      expect(preprocessForTts('some text', 'impostor', i18n)).toBe('some text');
    });

    it('should not add prefix when i18n is not provided', () => {
      expect(preprocessForTts('drink the most?', 'who_could', null)).toBe('drink the most?');
    });

    it('should not add prefix when prefix key is not in i18n', () => {
      const i18n = createMockI18n({});
      expect(preprocessForTts('drink the most?', 'who_could', i18n)).toBe('drink the most?');
    });

    it('should not add prefix when prefix key returns itself (fallback)', () => {
      const i18n = createMockI18n({});
      expect(preprocessForTts('drink the most?', 'who_could', i18n)).toBe('drink the most?');
    });
  });

  describe('complete workflows', () => {
    const translations = {
      'round.ttsReplaceAnd': ' and ',
      'round.ttsReplaceOr': ' or ',
      'round.ttsPrefixWouldYouRather': 'Would you rather ',
    };

    it('should process complex text with all transformations', () => {
      const i18n = createMockI18n(translations);
      expect(preprocessForTts('  Kiss & hug / slap . ', 'would_you_rather', i18n)).toBe(
        'Would you rather Kiss and hug or slap'
      );
    });

    it('should process text with no tokens or special chars', () => {
      const i18n = createMockI18n(translations);
      expect(preprocessForTts('Hello World', 'jnj', i18n)).toBe('Hello World');
    });

    it('should handle multiple consecutive special characters', () => {
      const i18n = createMockI18n(translations);
      expect(preprocessForTts('a & b & c', 'jnj', i18n)).toBe('a and b and c');
    });
  });

  describe('edge cases', () => {
    const i18n = createMockI18n({});

    it('should handle text with only dots', () => {
      expect(preprocessForTts('...', 'jnj', i18n)).toBe('');
    });

    it('should handle text with only whitespace', () => {
      expect(preprocessForTts('   ', 'jnj', i18n)).toBe('');
    });

    it('should handle single character', () => {
      expect(preprocessForTts('a', 'jnj', i18n)).toBe('a');
    });

    it('should handle text with newlines and tabs', () => {
      expect(preprocessForTts('Hello\n\tWorld', 'jnj', i18n)).toBe('Hello World');
    });
  });
});

import { describe, it, expect } from 'vitest';
import { preprocessForTts } from './text-preprocessor.js';

describe('preprocessForTts', () => {
  const createMockI18n = (translations = {}) => ({
    t: key => translations[key] || key,
  });

  describe('when text is falsy', () => {
    it('should return empty string for null', () => {
      expect(preprocessForTts(null, 'jnj', 'en', {})).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(preprocessForTts(undefined, 'jnj', 'en', {})).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(preprocessForTts('', 'jnj', 'en', {})).toBe('');
    });
  });

  describe('basic text processing', () => {
    it('should remove dots from text', () => {
      const text = 'Hello. World.';
      const i18n = createMockI18n();
      expect(preprocessForTts(text, 'jnj', 'en', i18n)).toBe('Hello World');
    });

    it('should normalize whitespace', () => {
      const text = 'Hello    World';
      const i18n = createMockI18n();
      expect(preprocessForTts(text, 'jnj', 'en', i18n)).toBe('Hello World');
    });

    it('should trim leading and trailing whitespace', () => {
      const text = '  Hello World  ';
      const i18n = createMockI18n();
      expect(preprocessForTts(text, 'jnj', 'en', i18n)).toBe('Hello World');
    });

    it('should process text with multiple whitespace and dots', () => {
      const text = '  Hello . World .  ';
      const i18n = createMockI18n();
      expect(preprocessForTts(text, 'jnj', 'en', i18n)).toBe('Hello World');
    });
  });

  describe('i18n replacements', () => {
    it('should replace & with i18n translation', () => {
      const text = 'Coffee & Tea';
      const i18n = createMockI18n({
        'round.ttsReplaceAnd': 'and',
      });
      expect(preprocessForTts(text, 'jnj', 'en', i18n)).toBe('Coffee and Tea');
    });

    it('should replace / with i18n translation', () => {
      const text = 'Coffee / Tea';
      const i18n = createMockI18n({
        'round.ttsReplaceOr': 'or',
      });
      expect(preprocessForTts(text, 'jnj', 'en', i18n)).toBe('Coffee or Tea');
    });

    it('should replace both & and / with i18n translations', () => {
      const text = 'Coffee & Tea / Water';
      const i18n = createMockI18n({
        'round.ttsReplaceAnd': 'and',
        'round.ttsReplaceOr': 'or',
      });
      expect(preprocessForTts(text, 'jnj', 'en', i18n)).toBe('Coffee and Tea or Water');
    });

    it('should not replace when i18n is not provided', () => {
      const text = 'Coffee & Tea / Water';
      expect(preprocessForTts(text, 'jnj', 'en', null)).toBe('Coffee & Tea / Water');
    });

    it('should use key as fallback when translation is not found', () => {
      const text = 'Coffee & Tea';
      const i18n = createMockI18n({});
      expect(preprocessForTts(text, 'jnj', 'en', i18n)).toBe('Coffee roundttsReplaceAnd Tea');
    });
  });

  describe('game mode prefixes', () => {
    it('should add prefix for would_you_rather mode', () => {
      const text = 'Would you rather';
      const i18n = createMockI18n({
        'round.ttsPrefixWouldYouRather': 'Question:',
      });
      expect(preprocessForTts(text, 'would_you_rather', 'en', i18n)).toBe(
        'Question:Would you rather'
      );
    });

    it('should add prefix for never_have_i_ever mode', () => {
      const text = 'Never have I ever';
      const i18n = createMockI18n({
        'round.ttsPrefixNeverHaveIEver': 'Statement:',
      });
      expect(preprocessForTts(text, 'never_have_i_ever', 'en', i18n)).toBe(
        'Statement:Never have I ever'
      );
    });

    it('should add prefix for who_could mode', () => {
      const text = 'Who could';
      const i18n = createMockI18n({
        'round.ttsPrefixWhoCould': 'Who:',
      });
      expect(preprocessForTts(text, 'who_could', 'en', i18n)).toBe('Who:Who could');
    });

    it('should not add prefix when game mode has no prefix key', () => {
      const text = 'Some question';
      const i18n = createMockI18n({
        'round.ttsPrefixWouldYouRather': 'Question:',
      });
      expect(preprocessForTts(text, 'unknown_mode', 'en', i18n)).toBe('Some question');
    });

    it('should not add prefix when i18n is not provided', () => {
      const text = 'Would you rather';
      expect(preprocessForTts(text, 'would_you_rather', 'en', null)).toBe('Would you rather');
    });

    it('should not add prefix when prefix key is not in i18n', () => {
      const text = 'Would you rather';
      const i18n = createMockI18n({});
      expect(preprocessForTts(text, 'would_you_rather', 'en', i18n)).toBe('Would you rather');
    });

    it('should not add prefix when prefix key returns itself (fallback)', () => {
      const text = 'Would you rather';
      const i18n = createMockI18n({
        'round.ttsPrefixWouldYouRather': 'round.ttsPrefixWouldYouRather',
      });
      expect(preprocessForTts(text, 'would_you_rather', 'en', i18n)).toBe('Would you rather');
    });
  });

  describe('complete workflows', () => {
    it('should process complex text with all transformations', () => {
      const text = '  Would you rather & drink beer / water?  ';
      const i18n = createMockI18n({
        'round.ttsReplaceAnd': 'and',
        'round.ttsReplaceOr': 'or',
        'round.ttsPrefixWouldYouRather': 'Question:',
      });
      expect(preprocessForTts(text, 'would_you_rather', 'en', i18n)).toBe(
        'Question:Would you rather and drink beer or water?'
      );
    });

    it('should process text with no tokens or special chars', () => {
      const text = 'Just a simple question';
      const i18n = createMockI18n();
      expect(preprocessForTts(text, 'jnj', 'en', i18n)).toBe('Just a simple question');
    });

    it('should handle multiple consecutive special characters', () => {
      const text = 'This && is /// weird';
      const i18n = createMockI18n({
        'round.ttsReplaceAnd': 'and',
        'round.ttsReplaceOr': 'or',
      });
      expect(preprocessForTts(text, 'jnj', 'en', i18n)).toBe('This andand is ororor weird');
    });
  });

  describe('edge cases', () => {
    it('should handle text with only dots', () => {
      const text = '...';
      const i18n = createMockI18n();
      expect(preprocessForTts(text, 'jnj', 'en', i18n)).toBe('');
    });

    it('should handle text with only whitespace', () => {
      const text = '   ';
      const i18n = createMockI18n();
      expect(preprocessForTts(text, 'jnj', 'en', i18n)).toBe('');
    });

    it('should handle single character', () => {
      const text = 'A';
      const i18n = createMockI18n();
      expect(preprocessForTts(text, 'jnj', 'en', i18n)).toBe('A');
    });

    it('should handle text with newlines and tabs', () => {
      const text = 'Hello\n\t\tWorld';
      const i18n = createMockI18n();
      expect(preprocessForTts(text, 'jnj', 'en', i18n)).toBe('Hello World');
    });
  });
});

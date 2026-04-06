/* global global */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TextToSpeech } from './text-to-speech.js';

describe('TextToSpeech', () => {
  let speechSynthesisMock;
  let SpeechSynthesisUtteranceMock;

  beforeEach(() => {
    SpeechSynthesisUtteranceMock = vi.fn(text => ({
      text,
      lang: '',
      rate: 1,
    }));

    speechSynthesisMock = {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: vi.fn(() => []),
    };

    global.speechSynthesis = speechSynthesisMock;
    global.SpeechSynthesisUtterance = SpeechSynthesisUtteranceMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete global.speechSynthesis;
    delete global.SpeechSynthesisUtterance;
  });

  describe('constructor', () => {
    it('sets isSupported to true when speechSynthesis is available', () => {
      const tts = new TextToSpeech();
      expect(tts.isSupported).toBe(true);
    });

    it('sets isSupported to false when speechSynthesis is not available', () => {
      delete global.speechSynthesis;
      const tts = new TextToSpeech();
      expect(tts.isSupported).toBe(false);
    });

    it('initializes autoReadEnabled to false', () => {
      const tts = new TextToSpeech();
      expect(tts.autoReadEnabled).toBe(false);
    });
  });

  describe('isSupported()', () => {
    it('returns true when speechSynthesis is defined', () => {
      const tts = new TextToSpeech();
      expect(tts.isSupported).toBe(true);
    });

    it('returns false when speechSynthesis is undefined', () => {
      delete global.speechSynthesis;
      const tts = new TextToSpeech();
      expect(tts.isSupported).toBe(false);
    });
  });

  describe('speak()', () => {
    it('does nothing when isSupported is false', () => {
      delete global.speechSynthesis;
      const tts = new TextToSpeech();
      tts.speak('test', 'never_have_i_ever', 'en', {});
      expect(speechSynthesisMock.speak).not.toHaveBeenCalled();
    });

    it('does nothing when text is empty', () => {
      const tts = new TextToSpeech();
      tts.speak('', 'never_have_i_ever', 'en', {});
      expect(speechSynthesisMock.speak).not.toHaveBeenCalled();
    });

    it('does nothing when text is null', () => {
      const tts = new TextToSpeech();
      tts.speak(null, 'never_have_i_ever', 'en', {});
      expect(speechSynthesisMock.speak).not.toHaveBeenCalled();
    });

    it('calls speechSynthesis.cancel before speaking', () => {
      const tts = new TextToSpeech();
      tts.speak('Hello world', 'never_have_i_ever', 'en', undefined);
      expect(speechSynthesisMock.cancel).toHaveBeenCalled();
    });

    it('calls speechSynthesis.speak with an utterance', () => {
      const tts = new TextToSpeech();
      tts.speak('Hello world', 'never_have_i_ever', 'en', undefined);
      expect(speechSynthesisMock.speak).toHaveBeenCalledTimes(1);
      expect(speechSynthesisMock.speak).toHaveBeenCalledWith(expect.any(Object));
    });

    it('creates SpeechSynthesisUtterance with processed text', () => {
      const tts = new TextToSpeech();
      tts.speak('Hello world', 'never_have_i_ever', 'en', undefined);
      expect(SpeechSynthesisUtteranceMock).toHaveBeenCalledWith('Hello world');
    });

    it('sets utterance.lang based on locale', () => {
      const tts = new TextToSpeech();
      tts.speak('Bonjour', 'never_have_i_ever', 'fr', undefined);
      const utterance = speechSynthesisMock.speak.mock.calls[0][0];
      expect(utterance.lang).toBe('fr-FR');
    });

    it('sets utterance.lang to en-US for unknown locale', () => {
      const tts = new TextToSpeech();
      tts.speak('Hello', 'never_have_i_ever', 'unknown', undefined);
      const utterance = speechSynthesisMock.speak.mock.calls[0][0];
      expect(utterance.lang).toBe('en-US');
    });

    it('sets utterance.rate to 0.8', () => {
      const tts = new TextToSpeech();
      tts.speak('Hello', 'never_have_i_ever', 'en', undefined);
      const utterance = speechSynthesisMock.speak.mock.calls[0][0];
      expect(utterance.rate).toBe(0.8);
    });

    it('processes text with i18n replacements', () => {
      const i18n = {
        t: vi.fn(key => {
          const replacements = {
            'round.ttsReplaceAnd': 'and',
            'round.ttsReplaceOr': 'or',
            'round.ttsPrefixNeverHaveIEver': 'Never have I ever: ',
          };
          return replacements[key] || key;
        }),
      };
      const tts = new TextToSpeech();
      tts.speak('Hello & goodbye', 'never_have_i_ever', 'en', i18n);
      const utterance = speechSynthesisMock.speak.mock.calls[0][0];
      expect(utterance.text).toContain('and');
    });

    it('does not process when i18n is not provided', () => {
      const tts = new TextToSpeech();
      tts.speak('Hello & goodbye', 'never_have_i_ever', 'en', null);
      const utterance = speechSynthesisMock.speak.mock.calls[0][0];
      expect(utterance.text).toBe('Hello & goodbye');
    });
  });

  describe('stop()', () => {
    it('calls speechSynthesis.cancel when supported', () => {
      const tts = new TextToSpeech();
      tts.stop();
      expect(speechSynthesisMock.cancel).toHaveBeenCalledTimes(1);
    });

    it('does not throw when speechSynthesis is not supported', () => {
      delete global.speechSynthesis;
      const tts = new TextToSpeech();
      expect(() => tts.stop()).not.toThrow();
    });
  });

  describe('toggleAutoRead()', () => {
    it('toggles autoReadEnabled from false to true', () => {
      const tts = new TextToSpeech();
      expect(tts.autoReadEnabled).toBe(false);
      const result = tts.toggleAutoRead();
      expect(result).toBe(true);
      expect(tts.autoReadEnabled).toBe(true);
    });

    it('toggles autoReadEnabled from true to false', () => {
      const tts = new TextToSpeech();
      tts.autoReadEnabled = true;
      const result = tts.toggleAutoRead();
      expect(result).toBe(false);
      expect(tts.autoReadEnabled).toBe(false);
    });
  });

  describe('isAutoReadEnabled()', () => {
    it('returns false when autoReadEnabled is false', () => {
      const tts = new TextToSpeech();
      expect(tts.isAutoReadEnabled()).toBe(false);
    });

    it('returns true when autoReadEnabled is true', () => {
      const tts = new TextToSpeech();
      tts.autoReadEnabled = true;
      expect(tts.isAutoReadEnabled()).toBe(true);
    });
  });
});

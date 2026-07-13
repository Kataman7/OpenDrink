import { toTtsLocale } from '../domain/tts-locale.js';
import { preprocessForTts } from '../domain/text-preprocessor.js';
import { DEFAULT_SPEECH_RATE } from '../config.js';

export class TextToSpeech {
  constructor() {
    this.isSupported = typeof speechSynthesis !== 'undefined';
    this.autoReadEnabled = false;
  }

  speak(text, gameMode, lang, i18n) {
    if (!this.isSupported || !text) return;
    speechSynthesis.cancel();
    const processedText = preprocessForTts(text, gameMode, i18n);
    if (!processedText) return;

    const utterance = new SpeechSynthesisUtterance(processedText);
    utterance.lang = toTtsLocale(lang);
    utterance.rate = DEFAULT_SPEECH_RATE;
    speechSynthesis.speak(utterance);
  }

  stop() {
    if (this.isSupported) {
      speechSynthesis.cancel();
    }
  }

  toggleAutoRead() {
    this.autoReadEnabled = !this.autoReadEnabled;
    return this.autoReadEnabled;
  }

  isAutoReadEnabled() {
    return this.autoReadEnabled;
  }
}

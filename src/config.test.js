import { describe, it, expect, vi } from 'vitest';

vi.stubGlobal('navigator', { language: 'en' });

const {
  DEFAULT_LANG,
  SEVEN_SECONDS_DURATION,
  ERROR_DISPLAY_DURATION_MS,
  DEFAULT_SPEECH_RATE,
  TOZ_MIN,
  TOZ_MAX,
  PICOL0_MIN,
  PICOL0_MAX,
} = await import('./config.js');

describe('config constants', () => {
  it('should have correct default language', () => {
    expect(DEFAULT_LANG).toBe('en');
  });

  it('should have correct durations', () => {
    expect(SEVEN_SECONDS_DURATION).toBe(7);
    expect(ERROR_DISPLAY_DURATION_MS).toBe(3000);
  });

  it('should have correct speech rate', () => {
    expect(DEFAULT_SPEECH_RATE).toBe(0.8);
  });

  it('should have correct game ranges', () => {
    expect(TOZ_MIN).toBe(2);
    expect(TOZ_MAX).toBe(5);
    expect(PICOL0_MIN).toBe(1);
    expect(PICOL0_MAX).toBe(5);
  });
});

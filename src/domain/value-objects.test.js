import { describe, it, expect } from 'vitest';
import { GameMode, QuestionIntensity } from './value-objects.js';
import { UnsupportedGameModeError, UnsupportedIntensityError } from './errors.js';

describe('GameMode', () => {
  it('should have correct game keys for NEVER_HAVE_I_EVER', () => {
    const keys = GameMode.getCandidateGameKeys(GameMode.NEVER_HAVE_I_EVER);
    expect(keys).toEqual(['jnj']);
  });

  it('should have correct game keys for ACTION_TRUTH', () => {
    const keys = GameMode.getCandidateGameKeys(GameMode.ACTION_TRUTH);
    expect(keys).toEqual(['tod', 'dare_chooser']);
  });

  it('should have correct game keys for WHO_COULD', () => {
    const keys = GameMode.getCandidateGameKeys(GameMode.WHO_COULD);
    expect(keys).toEqual(['qpr']);
  });

  it('should throw for unknown game mode', () => {
    expect(() => GameMode.getCandidateGameKeys('unknown')).toThrow(UnsupportedGameModeError);
  });

  it('should need intensity for non-impostor modes', () => {
    expect(GameMode.needsIntensity(GameMode.NEVER_HAVE_I_EVER)).toBe(true);
    expect(GameMode.needsIntensity(GameMode.ACTION_TRUTH)).toBe(true);
    expect(GameMode.needsIntensity(GameMode.WHO_COULD)).toBe(true);
  });

  it('should not need intensity for impostor mode', () => {
    expect(GameMode.needsIntensity(GameMode.IMPOSTOR)).toBe(false);
  });
});

describe('QuestionIntensity', () => {
  it('should convert SOFT to category 0', () => {
    expect(QuestionIntensity.toCategoryId(QuestionIntensity.SOFT)).toBe(0);
  });

  it('should convert HOT to category 1', () => {
    expect(QuestionIntensity.toCategoryId(QuestionIntensity.HOT)).toBe(1);
  });

  it('should convert MIXED to null', () => {
    expect(QuestionIntensity.toCategoryId(QuestionIntensity.MIXED)).toBeNull();
  });

  it('should throw for unknown intensity', () => {
    expect(() => QuestionIntensity.toCategoryId('unknown')).toThrow(UnsupportedIntensityError);
  });
});

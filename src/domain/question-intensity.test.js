import { describe, it, expect } from 'vitest';
import { QuestionIntensity } from './question-intensity.js';
import { UnsupportedIntensityError } from './errors.js';

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

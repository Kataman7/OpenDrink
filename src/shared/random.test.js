import { describe, it, expect } from 'vitest';
import { randomFromArray, randomBoolean, randomInt, shuffleArray } from './random.js';

describe('randomFromArray', () => {
  it('should return an element from the array', () => {
    const array = [1, 2, 3];
    const result = randomFromArray(array);
    expect(array).toContain(result);
  });

  it('should return undefined for empty array', () => {
    expect(randomFromArray([])).toBeUndefined();
  });
});

describe('randomBoolean', () => {
  it('should return true or false', () => {
    const result = randomBoolean();
    expect(typeof result).toBe('boolean');
  });
});

describe('randomInt', () => {
  it('should return a number within the range', () => {
    for (let i = 0; i < 100; i++) {
      const result = randomInt(2, 5);
      expect(result).toBeGreaterThanOrEqual(2);
      expect(result).toBeLessThanOrEqual(5);
    }
  });

  it('should return the min value when min equals max', () => {
    expect(randomInt(3, 3)).toBe(3);
  });
});

describe('shuffleArray', () => {
  it('should return an array of the same length', () => {
    const array = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(array);
    expect(shuffled).toHaveLength(array.length);
  });

  it('should contain all original elements', () => {
    const array = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(array);
    expect(shuffled.sort()).toEqual(array.sort());
  });

  it('should not mutate the original array', () => {
    const array = [1, 2, 3];
    const copy = [...array];
    shuffleArray(array);
    expect(array).toEqual(copy);
  });

  it('should handle empty array', () => {
    expect(shuffleArray([])).toEqual([]);
  });

  it('should handle single element array', () => {
    expect(shuffleArray([42])).toEqual([42]);
  });
});

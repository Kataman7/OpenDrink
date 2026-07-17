import { describe, it, expect } from 'vitest';
import { QuestionTextPersonalizer } from './question-text-personalizer.js';

describe('QuestionTextPersonalizer', () => {
  const players = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
    { id: 4, name: 'Diana' },
  ];

  const personalizer = new QuestionTextPersonalizer(players);

  it('replaces ${} tokens with player names', () => {
    const result = personalizer.personalize('${1} boit', 'Alice');
    expect(result).toMatch(/^(Bob|Charlie|Diana) boit$/);
  });

  it('replaces %s tokens with player names', () => {
    const result = personalizer.personalize('%s boit', 'Alice');
    expect(result).toMatch(/^(Bob|Charlie|Diana) boit$/);
  });

  it('replaces multiple %s with different players', () => {
    const result = personalizer.personalize('%s et %s', 'Alice');
    const names = result.split(' et ');
    expect(names[0]).not.toBe(names[1]);
    expect(['Bob', 'Charlie', 'Diana']).toContain(names[0]);
    expect(['Bob', 'Charlie', 'Diana']).toContain(names[1]);
  });

  it('replaces mixed %s and ${} (same slot = same player)', () => {
    const result = personalizer.personalize('%s et ${1}', 'Alice');
    const names = result.split(' et ');
    expect(names[0]).toBe(names[1]);
  });

  it('replaces $ with a number between 1 and 5', () => {
    const result = personalizer.personalize('$ pénalités', 'Alice');
    const num = parseInt(result, 10);
    expect(num).toBeGreaterThanOrEqual(1);
    expect(num).toBeLessThanOrEqual(5);
    expect(result).toMatch(/^\d+ pénalités$/);
  });

  it('does not replace $ inside ${}', () => {
    const result = personalizer.personalize('${1} boit $ fois', 'Alice');
    expect(result).toMatch(/^(Bob|Charlie|Diana) boit \d fois$/);
  });

  it('excludes current player from picks', () => {
    const solo = new QuestionTextPersonalizer([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]);
    const result = solo.personalize('%s et %s', 'Alice');
    expect(result).not.toContain('Alice');
    expect(result.split(' et ')).toEqual(['Bob', 'Bob']);
  });

  it('uses current player name when no other players available', () => {
    const solo = new QuestionTextPersonalizer([{ id: 1, name: 'Alice' }]);
    expect(solo.personalize('%s boit', 'Alice')).toBe('Alice boit');
    expect(solo.personalize('${1} boit', 'Alice')).toBe('Alice boit');
  });

  it('handles sentence with no tokens', () => {
    expect(personalizer.personalize('Water sports', 'Alice')).toBe('Water sports');
  });

  it('preserves ${} with slot reuse (same token = same player)', () => {
    const result = personalizer.personalize('${1} et ${1}', 'Alice');
    const names = result.split(' et ');
    expect(names[0]).toBe(names[1]);
  });

  it('preserves ${} with different slots (different players)', () => {
    const result = personalizer.personalize('${1} et ${2}', 'Alice');
    const names = result.split(' et ');
    expect(names[0]).not.toBe(names[1]);
  });
});

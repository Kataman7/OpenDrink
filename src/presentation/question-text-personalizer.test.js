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
    expect(['Alice', 'Bob', 'Charlie', 'Diana']).toContain(result.replace(' boit', ''));
  });

  it('replaces %s tokens with player names', () => {
    const result = personalizer.personalize('%s boit', 'Alice');
    expect(['Alice', 'Bob', 'Charlie', 'Diana']).toContain(result.replace(' boit', ''));
  });

  it('replaces multiple %s with different players', () => {
    const result = personalizer.personalize('%s et %s', 'Alice');
    const names = result.split(' et ');
    expect(names[0]).not.toBe(names[1]);
    expect(['Alice', 'Bob', 'Charlie', 'Diana']).toContain(names[0]);
    expect(['Alice', 'Bob', 'Charlie', 'Diana']).toContain(names[1]);
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
    expect(result).toMatch(/^\w+ boit \d fois$/);
  });

  it('picks from all players including current', () => {
    const p = new QuestionTextPersonalizer([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]);
    const result = p.personalize('%s et %s', 'Alice');
    const names = result.split(' et ');
    expect(names.every(n => n === 'Alice' || n === 'Bob')).toBe(true);
  });

  it('returns player name from single player pool', () => {
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

import { describe, it, expect } from 'vitest';
import { PicoloPersonalizer } from './picolo-personalizer.js';

describe('PicoloPersonalizer', () => {
  const personalizer = new PicoloPersonalizer();
  const players = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
  ];

  it('should replace %s with a random player name excluding current player', () => {
    const result = personalizer.personalize(
      '%s, take a penalty',
      { id: 1, name: 'Alice' },
      players
    );
    expect(['Bob', 'Charlie']).toContain(result.replace(', take a penalty', ''));
  });

  it('should replace $ with a number between 1 and 5', () => {
    const result = personalizer.personalize('Take $ penalties', { id: 1, name: 'Alice' }, players);
    const match = result.match(/Take (\d+) penalties/);
    expect(match).not.toBeNull();
    const num = parseInt(match[1], 10);
    expect(num).toBeGreaterThanOrEqual(1);
    expect(num).toBeLessThanOrEqual(5);
  });

  it('should replace %t with 1 or 2', () => {
    const result = personalizer.personalize('Team %t wins!', { id: 1, name: 'Alice' }, players);
    expect(['Team 1 wins!', 'Team 2 wins!']).toContain(result);
  });

  it('should handle multiple %s placeholders', () => {
    const result = personalizer.personalize(
      '%s and %s are buddies',
      { id: 1, name: 'Alice' },
      players
    );
    const names = result.replace(' and ', ',').replace(' are buddies', '').split(',');
    expect(names.length).toBe(2);
    names.forEach(n => expect(['Bob', 'Charlie']).toContain(n));
  });

  it('should return the sentence unchanged if no placeholders', () => {
    const result = personalizer.personalize('Hello world', { id: 1, name: 'Alice' }, players);
    expect(result).toBe('Hello world');
  });

  it('should handle single player gracefully', () => {
    const singlePlayer = [{ id: 1, name: 'Alice' }];
    const result = personalizer.personalize(
      '%s, do something',
      { id: 1, name: 'Alice' },
      singlePlayer
    );
    expect(result).toBe('Alice, do something');
  });
});

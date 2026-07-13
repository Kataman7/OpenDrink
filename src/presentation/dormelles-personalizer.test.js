import { describe, it, expect } from 'vitest';
import { DormellesPersonalizer } from './dormelles-personalizer.js';

describe('DormellesPersonalizer', () => {
  const personalizer = new DormellesPersonalizer();
  const players = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
  ];

  it('should replace ${toz} with a number between 2 and 5', () => {
    const result = personalizer.personalize('Take ${toz} toz', 'Alice', players);
    const match = result.match(/Take (\d+) toz/);
    expect(match).toBeTruthy();
    const number = Number.parseInt(match[1], 10);
    expect(number).toBeGreaterThanOrEqual(2);
    expect(number).toBeLessThanOrEqual(5);
  });

  it('should replace ${j1} with a different player name', () => {
    const result = personalizer.personalize('Kiss ${j1}', 'Alice', players);
    expect(['Bob', 'Charlie']).toContain(result.replace('Kiss ', ''));
  });

  it('should replace ${j2} with a different player name', () => {
    const result = personalizer.personalize('Hug ${j2}', 'Alice', players);
    expect(['Bob', 'Charlie']).toContain(result.replace('Hug ', ''));
  });

  it('should replace multiple tokens with different players', () => {
    const result = personalizer.personalize('${j1} kisses ${j2}', 'Alice', players);
    const match = result.match(/(\w+) kisses (\w+)/);
    expect(match).toBeTruthy();
    expect(match[1]).not.toBe('Alice');
    expect(match[2]).not.toBe('Alice');
    expect(match[1]).not.toBe(match[2]);
  });

  it('should reuse cycle when running out of players', () => {
    const result = personalizer.personalize('${j1} ${j2} ${j3}', 'Alice', players);
    expect(result).toMatch(/^\w+ \w+ \w+$/);
  });

  it('should replace ${j1} with current player when only one player', () => {
    const result = personalizer.personalize('Kiss ${j1}', 'Alice', [{ id: 1, name: 'Alice' }]);
    expect(result).toBe('Kiss Alice');
  });

  it('should handle sentence with no tokens', () => {
    const result = personalizer.personalize('Take 2 toz', 'Alice', players);
    expect(result).toBe('Take 2 toz');
  });
});

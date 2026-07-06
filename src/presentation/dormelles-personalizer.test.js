import { describe, it, expect } from 'vitest';
import { DormellesPersonalizer } from './dormelles-personalizer.js';

describe('DormellesPersonalizer', () => {
  const personalizer = new DormellesPersonalizer();

  it('should replace ${toz} with a number between 2 and 5', () => {
    const result = personalizer.personalize('Take ${toz} toz', 'Alice', [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]);
    const match = result.match(/Take (\d+) toz/);
    expect(match).toBeTruthy();
    const number = Number.parseInt(match[1], 10);
    expect(number).toBeGreaterThanOrEqual(2);
    expect(number).toBeLessThanOrEqual(5);
  });

  it('should replace ${j1} with a different player name', () => {
    const result = personalizer.personalize('Kiss ${j1}', 'Alice', [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]);
    expect(result).toBe('Kiss Bob');
  });

  it('should replace ${j1} with current player when only one player', () => {
    const result = personalizer.personalize('Kiss ${j1}', 'Alice', [{ id: 1, name: 'Alice' }]);
    expect(result).toBe('Kiss Alice');
  });

  it('should handle sentence with no tokens', () => {
    const result = personalizer.personalize('Take 2 toz', 'Alice', [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]);
    expect(result).toBe('Take 2 toz');
  });
});

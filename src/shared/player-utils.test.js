import { describe, it, expect } from 'vitest';
import { getOtherPlayerNames } from './player-utils.js';

const players = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
];

describe('getOtherPlayerNames', () => {
  it('should return names excluding the given one', () => {
    expect(getOtherPlayerNames(players, 'Alice')).toEqual(['Bob', 'Charlie']);
  });

  it('should return empty array when only player matches', () => {
    expect(getOtherPlayerNames([players[0]], 'Alice')).toEqual([]);
  });
});

import { describe, it, expect } from 'vitest';
import { getOtherPlayerNames, pickRandomPlayerName } from './player-utils.js';

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

describe('pickRandomPlayerName', () => {
  it('should return a random player name', () => {
    const name = pickRandomPlayerName(players);
    expect(['Alice', 'Bob', 'Charlie']).toContain(name);
  });

  it('should exclude the given id', () => {
    const name = pickRandomPlayerName(players, 1);
    expect(['Bob', 'Charlie']).toContain(name);
  });

  it('should return the only player if single player', () => {
    expect(pickRandomPlayerName([players[0]])).toBe('Alice');
  });
});

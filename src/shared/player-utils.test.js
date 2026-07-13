import { describe, it, expect } from 'vitest';
import {
  getOtherPlayerNames,
  getPlayersExcluding,
  pickRandomFromIds,
  pickRandomPlayerName,
} from './player-utils.js';

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

describe('getPlayersExcluding', () => {
  it('should return players excluding the given id', () => {
    const result = getPlayersExcluding(players, 1);
    expect(result).toHaveLength(2);
    expect(result.every(p => p.id !== 1)).toBe(true);
  });

  it('should return all players if excludeId is null', () => {
    expect(getPlayersExcluding(players, null)).toHaveLength(3);
  });
});

describe('pickRandomFromIds', () => {
  it('should return a name from the matching player', () => {
    const name = pickRandomFromIds([2], players);
    expect(name).toBe('Bob');
  });

  it('should exclude the given id', () => {
    const name = pickRandomFromIds([1, 2], players, 1);
    expect(name).toBe('Bob');
  });

  it('should return the first player if all are excluded', () => {
    const name = pickRandomFromIds([1], players, 1);
    expect(name).toBe('Alice');
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

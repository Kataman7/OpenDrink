import { describe, it, expect } from 'vitest';
import { PlayerStore } from './player-store.js';

const player1 = { id: 1, name: 'Alice' };
const player2 = { id: 2, name: 'Bob' };

describe('PlayerStore', () => {
  it('should start empty', () => {
    const store = new PlayerStore();
    expect(store.players).toEqual([]);
    expect(store.previousPlayerId).toBeNull();
  });

  it('should add players', () => {
    const store = new PlayerStore();
    store.addPlayer(player1);
    store.addPlayer(player2);
    expect(store.players).toHaveLength(2);
    expect(store.players).toContainEqual(player1);
    expect(store.players).toContainEqual(player2);
  });

  it('should remove player by id', () => {
    const store = new PlayerStore();
    store.addPlayer(player1);
    store.addPlayer(player2);
    store.removePlayerById(1);
    expect(store.players).toHaveLength(1);
    expect(store.players[0]).toEqual(player2);
  });

  it('should clear previousPlayerId when removing that player', () => {
    const store = new PlayerStore();
    store.addPlayer(player1);
    store.addPlayer(player2);
    store.setPreviousPlayer(1);
    store.removePlayerById(1);
    expect(store.previousPlayerId).toBeNull();
  });

  it('should check enough players', () => {
    const store = new PlayerStore();
    store.addPlayer(player1);
    store.addPlayer(player2);
    expect(store.hasEnoughPlayers(2)).toBe(true);
    expect(store.hasEnoughPlayers(3)).toBe(false);
  });

  it('should set and get previous player id', () => {
    const store = new PlayerStore();
    store.setPreviousPlayer(1);
    expect(store.previousPlayerId).toBe(1);
  });

  it('should return player ids', () => {
    const store = new PlayerStore();
    store.addPlayer(player1);
    store.addPlayer(player2);
    expect(store.getPlayerIds()).toEqual([1, 2]);
  });

  it('should consume restored player names', () => {
    const store = new PlayerStore();
    store.applyRestoredNames({ players: ['Alice', 'Bob'] });
    const names = store.consumeRestoredPlayerNames();
    expect(names).toEqual(['Alice', 'Bob']);
    expect(store.restoredPlayerNames).toEqual([]);
  });
});

import { describe, it, expect, vi } from 'vitest';
import { ImpostorManager } from './impostor-manager.js';

describe('ImpostorManager', () => {
  const getImpostorWordUseCase = {
    execute: vi.fn().mockResolvedValue({
      normalWord: 'Dauphin',
      impostorWord: 'Requin',
    }),
  };

  const players = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
    { id: 4, name: 'Diana' },
    { id: 5, name: 'Eve' },
  ];

  it('assigns multiple impostors and mr whites correctly', async () => {
    const manager = new ImpostorManager({ getImpostorWordUseCase });
    const gameState = {
      getPlayerIds: () => players.map(p => p.id),
      pickRandomPlayerId: () => 1,
      impostorCount: 2,
      mrWhiteCount: 2,
      selectedLang: 'fr',
    };

    const success = await manager.initializeRound(gameState);
    expect(success).toBe(true);
    expect(manager.impostorPlayerIds).toHaveLength(2);
    expect(manager.mrWhitePlayerIds).toHaveLength(2);
    expect(manager.getRemainingBadCount()).toBe(4);

    const badPlayerId = manager.impostorPlayerIds[0];
    expect(manager.isImpostorPlayer(badPlayerId)).toBe(true);

    manager.removeBadPlayer(badPlayerId);
    expect(manager.impostorPlayerIds).toHaveLength(1);
    expect(manager.getRemainingBadCount()).toBe(3);
  });

  it('detects last player with hasNextPlayer', async () => {
    const manager = new ImpostorManager({ getImpostorWordUseCase });
    const gameState = {
      getPlayerIds: () => [1, 2],
      pickRandomPlayerId: () => 1,
      impostorCount: 1,
      mrWhiteCount: 0,
      selectedLang: 'en',
    };

    await manager.initializeRound(gameState);
    expect(manager.currentIndex).toBe(0);
    expect(manager.hasNextPlayer()).toBe(true);

    manager.moveToNextPlayer();
    expect(manager.currentIndex).toBe(1);
    expect(manager.hasNextPlayer()).toBe(false);
  });

  it('reveals correct role word for mr white, impostor and normal player', async () => {
    const manager = new ImpostorManager({ getImpostorWordUseCase });
    const gameState = {
      getPlayerIds: () => [1, 2, 3],
      pickRandomPlayerId: () => 1,
      impostorCount: 1,
      mrWhiteCount: 1,
      selectedLang: 'fr',
    };

    await manager.initializeRound(gameState);
    manager.impostorPlayerIds = [1];
    manager.mrWhitePlayerIds = [2];
    manager.orderedPlayerIds = [1, 2, 3];
    manager.currentIndex = 0;

    expect(manager.getCurrentWord()).toEqual({ word: 'Requin', role: 'impostor' });
    manager.moveToNextPlayer();
    expect(manager.getCurrentWord()).toEqual({ word: null, role: 'mr_white' });
    manager.moveToNextPlayer();
    expect(manager.getCurrentWord()).toEqual({ word: 'Dauphin', role: 'normal' });
  });
});

import { describe, it, expect } from 'vitest';
import { Player } from './entities.js';
import { PlayerNameEmptyError } from './errors.js';

describe('Player', () => {
  it('should create a player with valid name', () => {
    const player = new Player({ name: 'Alice' });
    expect(player.name).toBe('Alice');
    expect(player.id).toBeNull();
  });

  it('should create a player with id', () => {
    const player = new Player({ id: 1, name: 'Bob' });
    expect(player.name).toBe('Bob');
    expect(player.id).toBe(1);
  });

  it('should trim whitespace from name', () => {
    const player = new Player({ name: '  Charlie  ' });
    expect(player.name).toBe('Charlie');
  });

  it('should throw error for empty name', () => {
    expect(() => new Player({ name: '' })).toThrow(PlayerNameEmptyError);
  });

  it('should throw error for whitespace-only name', () => {
    expect(() => new Player({ name: '   ' })).toThrow(PlayerNameEmptyError);
  });
});

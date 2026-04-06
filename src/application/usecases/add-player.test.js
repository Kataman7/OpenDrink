import { describe, it, expect, vi } from 'vitest';
import { AddPlayerUseCase } from './add-player.js';
import { PlayerNameEmptyError } from '../../domain/errors.js';

describe('AddPlayerUseCase', () => {
  it('should add a player with valid name', async () => {
    const mockSavePlayer = vi.fn().mockResolvedValue(1);
    const mockRepo = {
      savePlayer: mockSavePlayer,
    };
    const useCase = new AddPlayerUseCase({ playerRepositoryPort: mockRepo });

    const result = await useCase.execute({ name: 'Alice' });

    expect(result.name).toBe('Alice');
    expect(result.id).toBe(1);
    expect(mockSavePlayer).toHaveBeenCalledWith('Alice');
  });

  it('should throw PlayerNameEmptyError for empty name', async () => {
    const mockRepo = {
      savePlayer: async _name => 1,
    };
    const useCase = new AddPlayerUseCase({ playerRepositoryPort: mockRepo });

    await expect(useCase.execute({ name: '' })).rejects.toThrow(PlayerNameEmptyError);
  });

  it('should throw PlayerNameEmptyError for whitespace-only name', async () => {
    const mockRepo = {
      savePlayer: async _name => 1,
    };
    const useCase = new AddPlayerUseCase({ playerRepositoryPort: mockRepo });

    await expect(useCase.execute({ name: '   ' })).rejects.toThrow(PlayerNameEmptyError);
  });

  it('should throw error for duplicate name', async () => {
    const mockRepo = {
      savePlayer: async _name => {
        throw new Error('Player name already exists');
      },
    };
    const useCase = new AddPlayerUseCase({ playerRepositoryPort: mockRepo });

    await expect(useCase.execute({ name: 'Bob' })).rejects.toThrow('Player name already exists');
  });

  it('should trim whitespace from player name', async () => {
    const mockSavePlayer = vi.fn().mockResolvedValue(2);
    const mockRepo = {
      savePlayer: mockSavePlayer,
    };
    const useCase = new AddPlayerUseCase({ playerRepositoryPort: mockRepo });

    const result = await useCase.execute({ name: '  Charlie  ' });

    expect(result.name).toBe('Charlie');
    expect(mockSavePlayer).toHaveBeenCalledWith('Charlie');
  });
});

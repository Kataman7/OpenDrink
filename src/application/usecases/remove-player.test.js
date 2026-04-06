import { describe, it, expect, vi } from 'vitest';
import { RemovePlayerUseCase } from './remove-player.js';

describe('RemovePlayerUseCase', () => {
  it('should remove an existing player by ID', async () => {
    const mockRemovePlayer = vi.fn().mockResolvedValue(undefined);
    const mockRepo = {
      removePlayerById: mockRemovePlayer,
    };
    const useCase = new RemovePlayerUseCase({ playerRepositoryPort: mockRepo });

    await useCase.execute({ playerId: 1 });

    expect(mockRemovePlayer).toHaveBeenCalledWith(1);
  });

  it('should throw error when removing non-existent player', async () => {
    const mockRemovePlayer = vi.fn().mockRejectedValue(new Error('Player not found'));
    const mockRepo = {
      removePlayerById: mockRemovePlayer,
    };
    const useCase = new RemovePlayerUseCase({ playerRepositoryPort: mockRepo });

    await expect(useCase.execute({ playerId: 999 })).rejects.toThrow('Player not found');
  });

  it('should call removePlayerById with correct ID', async () => {
    const mockRemovePlayer = vi.fn().mockResolvedValue(undefined);
    const mockRepo = {
      removePlayerById: mockRemovePlayer,
    };
    const useCase = new RemovePlayerUseCase({ playerRepositoryPort: mockRepo });

    await useCase.execute({ playerId: 42 });

    expect(mockRemovePlayer).toHaveBeenCalledTimes(1);
    expect(mockRemovePlayer).toHaveBeenCalledWith(42);
  });
});

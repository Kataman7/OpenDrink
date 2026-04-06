import { describe, it, expect, vi } from 'vitest';
import { InitializeDatabaseUseCase } from './initialize-database.js';
import { DatabaseInitError } from '../../domain/errors.js';

describe('InitializeDatabaseUseCase', () => {
  it('should initialize database successfully', async () => {
    const mockInitialize = vi.fn().mockResolvedValue(undefined);
    const mockDatabasePort = {
      initialize: mockInitialize,
    };
    const useCase = new InitializeDatabaseUseCase({ databasePort: mockDatabasePort });

    await useCase.execute();

    expect(mockInitialize).toHaveBeenCalledOnce();
  });

  it('should throw DatabaseInitError when initialization fails', async () => {
    const originalError = new Error('Database file not found');
    const mockInitialize = vi.fn().mockRejectedValue(originalError);
    const mockDatabasePort = {
      initialize: mockInitialize,
    };
    const useCase = new InitializeDatabaseUseCase({ databasePort: mockDatabasePort });

    await expect(useCase.execute()).rejects.toThrow(DatabaseInitError);
  });

  it('should preserve original error as cause when initialization fails', async () => {
    const originalError = new Error('Database file not found');
    const mockInitialize = vi.fn().mockRejectedValue(originalError);
    const mockDatabasePort = {
      initialize: mockInitialize,
    };
    const useCase = new InitializeDatabaseUseCase({ databasePort: mockDatabasePort });

    await expect(useCase.execute()).rejects.toThrow(
      "Échec de l'initialisation de la base de données"
    );
    try {
      await useCase.execute();
    } catch (error) {
      expect(error.cause).toBe(originalError);
    }
  });
});

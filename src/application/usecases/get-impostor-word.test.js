import { describe, it, expect, vi } from 'vitest';
import { GetImpostorWordUseCase } from './get-impostor-word.js';
import { NoQuestionsAvailableError } from '../../domain/errors.js';
import { GameMode } from '../../domain/value-objects.js';

describe('GetImpostorWordUseCase', () => {
  it('should return impostor word when question is available', async () => {
    const mockQuestion = {
      sentence: 'normal word',
      impostorHintWord: 'impostor word',
    };
    const mockGetRandomQuestion = vi.fn().mockResolvedValue(mockQuestion);
    const mockRepo = {
      getRandomQuestion: mockGetRandomQuestion,
    };
    const useCase = new GetImpostorWordUseCase({ questionRepositoryPort: mockRepo });

    const result = await useCase.execute({ lang: 'en' });

    expect(result.normalWord).toBe('normal word');
    expect(result.impostorWord).toBe('impostor word');
    expect(mockGetRandomQuestion).toHaveBeenCalledWith({
      gameMode: GameMode.IMPOSTOR,
      intensity: null,
      lang: 'en',
    });
  });

  it('should return different words on multiple calls', async () => {
    const mockGetRandomQuestion = vi
      .fn()
      .mockResolvedValueOnce({ sentence: 'word1', impostorHintWord: 'hint1' })
      .mockResolvedValueOnce({ sentence: 'word2', impostorHintWord: 'hint2' });
    const mockRepo = {
      getRandomQuestion: mockGetRandomQuestion,
    };
    const useCase = new GetImpostorWordUseCase({ questionRepositoryPort: mockRepo });

    const result1 = await useCase.execute({ lang: 'en' });
    const result2 = await useCase.execute({ lang: 'en' });

    expect(result1.normalWord).toBe('word1');
    expect(result2.normalWord).toBe('word2');
    expect(result1.impostorWord).toBe('hint1');
    expect(result2.impostorWord).toBe('hint2');
  });

  it('should throw NoQuestionsAvailableError when no question available', async () => {
    const mockGetRandomQuestion = vi.fn().mockResolvedValue(null);
    const mockRepo = {
      getRandomQuestion: mockGetRandomQuestion,
    };
    const useCase = new GetImpostorWordUseCase({ questionRepositoryPort: mockRepo });

    await expect(useCase.execute({ lang: 'en' })).rejects.toThrow(NoQuestionsAvailableError);
  });

  it('should pass lang parameter to repository', async () => {
    const mockQuestion = {
      sentence: 'test',
      impostorHintWord: 'impostor',
    };
    const mockGetRandomQuestion = vi.fn().mockResolvedValue(mockQuestion);
    const mockRepo = {
      getRandomQuestion: mockGetRandomQuestion,
    };
    const useCase = new GetImpostorWordUseCase({ questionRepositoryPort: mockRepo });

    await useCase.execute({ lang: 'fr' });

    expect(mockGetRandomQuestion).toHaveBeenCalledWith({
      gameMode: GameMode.IMPOSTOR,
      intensity: null,
      lang: 'fr',
    });
  });
});

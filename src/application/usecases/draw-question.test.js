import { describe, it, expect, vi } from 'vitest';
import { DrawQuestionUseCase } from './draw-question.js';
import { NoPlayersError, NoQuestionsAvailableError } from '../../domain/errors.js';

describe('DrawQuestionUseCase', () => {
  const createMockPlayerRepository = (players = []) => ({
    getAllPlayers: vi.fn().mockResolvedValue(players),
  });

  const createMockQuestionRepository = () => ({
    getRandomQuestion: vi.fn(),
  });

  const createUseCase = (playerRepo, questionRepo) => {
    return new DrawQuestionUseCase({
      playerRepositoryPort: playerRepo,
      questionRepositoryPort: questionRepo,
    });
  };

  describe('execute', () => {
    describe('player validation', () => {
      it('should throw NoPlayersError when no players', async () => {
        const mockPlayerRepo = createMockPlayerRepository([]);
        const mockQuestionRepo = createMockQuestionRepository();
        const useCase = createUseCase(mockPlayerRepo, mockQuestionRepo);

        await expect(
          useCase.execute({ gameMode: 'jnj', intensity: 'soft', lang: 'en' })
        ).rejects.toThrow(NoPlayersError);
      });

      it('should throw NoPlayersError when players is null', async () => {
        const mockPlayerRepo = createMockPlayerRepository(null);
        const mockQuestionRepo = createMockQuestionRepository();
        const useCase = createUseCase(mockPlayerRepo, mockQuestionRepo);

        await expect(
          useCase.execute({ gameMode: 'jnj', intensity: 'soft', lang: 'en' })
        ).rejects.toThrow(NoPlayersError);
      });

      it('should throw NoPlayersError when players is undefined', async () => {
        const mockPlayerRepo = createMockPlayerRepository(undefined);
        const mockQuestionRepo = createMockQuestionRepository();
        const useCase = createUseCase(mockPlayerRepo, mockQuestionRepo);

        await expect(
          useCase.execute({ gameMode: 'jnj', intensity: 'soft', lang: 'en' })
        ).rejects.toThrow(NoPlayersError);
      });
    });

    describe('question retrieval with mode filtering', () => {
      const players = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];
      const mockQuestion = { id: 1, text: 'Never Have I Ever question?', mode: 'jnj' };

      it('should call getRandomQuestion with jnj mode', async () => {
        const mockPlayerRepo = createMockPlayerRepository(players);
        const mockQuestionRepo = createMockQuestionRepository();
        mockQuestionRepo.getRandomQuestion.mockResolvedValue(mockQuestion);
        const useCase = createUseCase(mockPlayerRepo, mockQuestionRepo);

        await useCase.execute({ gameMode: 'jnj', intensity: 'soft', lang: 'en' });

        expect(mockQuestionRepo.getRandomQuestion).toHaveBeenCalledWith({
          gameMode: 'jnj',
          intensity: 'soft',
          lang: 'en',
        });
      });

      it('should call getRandomQuestion with tod mode', async () => {
        const mockPlayerRepo = createMockPlayerRepository(players);
        const mockQuestionRepo = createMockQuestionRepository();
        mockQuestionRepo.getRandomQuestion.mockResolvedValue(mockQuestion);
        const useCase = createUseCase(mockPlayerRepo, mockQuestionRepo);

        await useCase.execute({ gameMode: 'tod', intensity: 'hot', lang: 'fr' });

        expect(mockQuestionRepo.getRandomQuestion).toHaveBeenCalledWith({
          gameMode: 'tod',
          intensity: 'hot',
          lang: 'fr',
        });
      });

      it('should call getRandomQuestion with tpf mode (Would You Rather)', async () => {
        const mockPlayerRepo = createMockPlayerRepository(players);
        const mockQuestionRepo = createMockQuestionRepository();
        mockQuestionRepo.getRandomQuestion.mockResolvedValue(mockQuestion);
        const useCase = createUseCase(mockPlayerRepo, mockQuestionRepo);

        await useCase.execute({ gameMode: 'tpf', intensity: 'mixed', lang: 'es' });

        expect(mockQuestionRepo.getRandomQuestion).toHaveBeenCalledWith({
          gameMode: 'tpf',
          intensity: 'mixed',
          lang: 'es',
        });
      });

      it('should call getRandomQuestion with qpr mode (Who Could)', async () => {
        const mockPlayerRepo = createMockPlayerRepository(players);
        const mockQuestionRepo = createMockQuestionRepository();
        mockQuestionRepo.getRandomQuestion.mockResolvedValue(mockQuestion);
        const useCase = createUseCase(mockPlayerRepo, mockQuestionRepo);

        await useCase.execute({ gameMode: 'qpr', intensity: 'soft', lang: 'de' });

        expect(mockQuestionRepo.getRandomQuestion).toHaveBeenCalledWith({
          gameMode: 'qpr',
          intensity: 'soft',
          lang: 'de',
        });
      });
    });

    describe('intensity filtering', () => {
      const players = [{ id: 1, name: 'Alice' }];
      const mockQuestion = { id: 1, text: 'Question?', mode: 'jnj' };

      it('should call getRandomQuestion with soft intensity', async () => {
        const mockPlayerRepo = createMockPlayerRepository(players);
        const mockQuestionRepo = createMockQuestionRepository();
        mockQuestionRepo.getRandomQuestion.mockResolvedValue(mockQuestion);
        const useCase = createUseCase(mockPlayerRepo, mockQuestionRepo);

        await useCase.execute({ gameMode: 'jnj', intensity: 'soft', lang: 'en' });

        expect(mockQuestionRepo.getRandomQuestion).toHaveBeenCalledWith({
          gameMode: 'jnj',
          intensity: 'soft',
          lang: 'en',
        });
      });

      it('should call getRandomQuestion with hot intensity', async () => {
        const mockPlayerRepo = createMockPlayerRepository(players);
        const mockQuestionRepo = createMockQuestionRepository();
        mockQuestionRepo.getRandomQuestion.mockResolvedValue(mockQuestion);
        const useCase = createUseCase(mockPlayerRepo, mockQuestionRepo);

        await useCase.execute({ gameMode: 'jnj', intensity: 'hot', lang: 'en' });

        expect(mockQuestionRepo.getRandomQuestion).toHaveBeenCalledWith({
          gameMode: 'jnj',
          intensity: 'hot',
          lang: 'en',
        });
      });

      it('should call getRandomQuestion with mixed intensity', async () => {
        const mockPlayerRepo = createMockPlayerRepository(players);
        const mockQuestionRepo = createMockQuestionRepository();
        mockQuestionRepo.getRandomQuestion.mockResolvedValue(mockQuestion);
        const useCase = createUseCase(mockPlayerRepo, mockQuestionRepo);

        await useCase.execute({ gameMode: 'jnj', intensity: 'mixed', lang: 'en' });

        expect(mockQuestionRepo.getRandomQuestion).toHaveBeenCalledWith({
          gameMode: 'jnj',
          intensity: 'mixed',
          lang: 'en',
        });
      });
    });

    describe('language filtering', () => {
      const players = [{ id: 1, name: 'Alice' }];
      const mockQuestion = { id: 1, text: 'Question?' };

      it('should call getRandomQuestion with english lang', async () => {
        const mockPlayerRepo = createMockPlayerRepository(players);
        const mockQuestionRepo = createMockQuestionRepository();
        mockQuestionRepo.getRandomQuestion.mockResolvedValue(mockQuestion);
        const useCase = createUseCase(mockPlayerRepo, mockQuestionRepo);

        await useCase.execute({ gameMode: 'jnj', intensity: 'soft', lang: 'en' });

        expect(mockQuestionRepo.getRandomQuestion).toHaveBeenCalledWith({
          gameMode: 'jnj',
          intensity: 'soft',
          lang: 'en',
        });
      });

      it('should call getRandomQuestion with french lang', async () => {
        const mockPlayerRepo = createMockPlayerRepository(players);
        const mockQuestionRepo = createMockQuestionRepository();
        mockQuestionRepo.getRandomQuestion.mockResolvedValue(mockQuestion);
        const useCase = createUseCase(mockPlayerRepo, mockQuestionRepo);

        await useCase.execute({ gameMode: 'tod', intensity: 'hot', lang: 'fr' });

        expect(mockQuestionRepo.getRandomQuestion).toHaveBeenCalledWith({
          gameMode: 'tod',
          intensity: 'hot',
          lang: 'fr',
        });
      });

      it('should call getRandomQuestion with german lang', async () => {
        const mockPlayerRepo = createMockPlayerRepository(players);
        const mockQuestionRepo = createMockQuestionRepository();
        mockQuestionRepo.getRandomQuestion.mockResolvedValue(mockQuestion);
        const useCase = createUseCase(mockPlayerRepo, mockQuestionRepo);

        await useCase.execute({ gameMode: 'tpf', intensity: 'mixed', lang: 'de' });

        expect(mockQuestionRepo.getRandomQuestion).toHaveBeenCalledWith({
          gameMode: 'tpf',
          intensity: 'mixed',
          lang: 'de',
        });
      });

      it('should call getRandomQuestion with spanish lang', async () => {
        const mockPlayerRepo = createMockPlayerRepository(players);
        const mockQuestionRepo = createMockQuestionRepository();
        mockQuestionRepo.getRandomQuestion.mockResolvedValue(mockQuestion);
        const useCase = createUseCase(mockPlayerRepo, mockQuestionRepo);

        await useCase.execute({ gameMode: 'qpr', intensity: 'soft', lang: 'es' });

        expect(mockQuestionRepo.getRandomQuestion).toHaveBeenCalledWith({
          gameMode: 'qpr',
          intensity: 'soft',
          lang: 'es',
        });
      });
    });

    describe('no questions available', () => {
      const players = [{ id: 1, name: 'Alice' }];

      it('should throw NoQuestionsAvailableError when no question returned', async () => {
        const mockPlayerRepo = createMockPlayerRepository(players);
        const mockQuestionRepo = createMockQuestionRepository();
        mockQuestionRepo.getRandomQuestion.mockResolvedValue(null);
        const useCase = createUseCase(mockPlayerRepo, mockQuestionRepo);

        await expect(
          useCase.execute({ gameMode: 'jnj', intensity: 'soft', lang: 'en' })
        ).rejects.toThrow(NoQuestionsAvailableError);
      });

      it('should throw NoQuestionsAvailableError with correct mode in message', async () => {
        const mockPlayerRepo = createMockPlayerRepository(players);
        const mockQuestionRepo = createMockQuestionRepository();
        mockQuestionRepo.getRandomQuestion.mockResolvedValue(null);
        const useCase = createUseCase(mockPlayerRepo, mockQuestionRepo);

        await expect(
          useCase.execute({ gameMode: 'tod', intensity: 'hot', lang: 'fr' })
        ).rejects.toThrow('Aucune question disponible pour le mode : tod');
      });
    });

    describe('player selection', () => {
      it('should return the only player when only one player exists', async () => {
        const players = [{ id: 1, name: 'Alice' }];
        const mockQuestion = { id: 1, text: 'Question?' };

        const mockPlayerRepo = createMockPlayerRepository(players);
        const mockQuestionRepo = createMockQuestionRepository();
        mockQuestionRepo.getRandomQuestion.mockResolvedValue(mockQuestion);
        const useCase = createUseCase(mockPlayerRepo, mockQuestionRepo);

        const result = await useCase.execute({ gameMode: 'jnj', intensity: 'soft', lang: 'en' });

        expect(result.player).toEqual({ id: 1, name: 'Alice' });
      });

      it('should return the previous player when no other players available', async () => {
        const players = [{ id: 1, name: 'Alice' }];
        const mockQuestion = { id: 1, text: 'Question?' };

        const mockPlayerRepo = createMockPlayerRepository(players);
        const mockQuestionRepo = createMockQuestionRepository();
        mockQuestionRepo.getRandomQuestion.mockResolvedValue(mockQuestion);
        const useCase = createUseCase(mockPlayerRepo, mockQuestionRepo);

        const result = await useCase.execute({
          gameMode: 'jnj',
          intensity: 'soft',
          lang: 'en',
          previousPlayerId: 1,
        });

        expect(result.player).toEqual({ id: 1, name: 'Alice' });
      });

      it('should return a different player when previousPlayerId is excluded', async () => {
        const players = [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ];
        const mockQuestion = { id: 1, text: 'Question?' };

        const mockPlayerRepo = createMockPlayerRepository(players);
        const mockQuestionRepo = createMockQuestionRepository();
        mockQuestionRepo.getRandomQuestion.mockResolvedValue(mockQuestion);
        const useCase = createUseCase(mockPlayerRepo, mockQuestionRepo);

        const result = await useCase.execute({
          gameMode: 'jnj',
          intensity: 'soft',
          lang: 'en',
          previousPlayerId: 1,
        });

        expect(result.player.id).toBe(2);
        expect(result.player.name).toBe('Bob');
      });
    });

    describe('return value', () => {
      it('should return player and question', async () => {
        const players = [{ id: 1, name: 'Alice' }];
        const mockQuestion = { id: 42, text: 'Never Have I Ever...?' };

        const mockPlayerRepo = createMockPlayerRepository(players);
        const mockQuestionRepo = createMockQuestionRepository();
        mockQuestionRepo.getRandomQuestion.mockResolvedValue(mockQuestion);
        const useCase = createUseCase(mockPlayerRepo, mockQuestionRepo);

        const result = await useCase.execute({ gameMode: 'jnj', intensity: 'soft', lang: 'en' });

        expect(result).toEqual({
          player: { id: 1, name: 'Alice' },
          question: { id: 42, text: 'Never Have I Ever...?' },
        });
      });
    });
  });

  describe('pickPlayer', () => {
    it('should return single player without filtering', () => {
      const mockPlayerRepo = createMockPlayerRepository([]);
      const mockQuestionRepo = createMockQuestionRepository();
      const useCase = createUseCase(mockPlayerRepo, mockQuestionRepo);

      const player = useCase.pickPlayer([{ id: 1, name: 'Alice' }], null);

      expect(player).toEqual({ id: 1, name: 'Alice' });
    });

    it('should filter out previous player when other players available', () => {
      const mockPlayerRepo = createMockPlayerRepository([]);
      const mockQuestionRepo = createMockQuestionRepository();
      const useCase = createUseCase(mockPlayerRepo, mockQuestionRepo);

      const player = useCase.pickPlayer(
        [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
          { id: 3, name: 'Charlie' },
        ],
        2
      );

      expect(player.id).not.toBe(2);
      expect(['Bob']).not.toContain(player.id);
    });
  });
});

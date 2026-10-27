import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BonusGamesManager } from './bonus-games-manager.js';
import { GameMode } from '../domain/game-mode.js';

describe('BonusGamesManager', () => {
  const players = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
  ];

  let drawQuestionUseCase;
  let audioService;
  let manager;

  beforeEach(() => {
    vi.useFakeTimers();
    drawQuestionUseCase = {
      execute: vi.fn().mockImplementation(({ gameMode }) => {
        if (gameMode === GameMode.SEVEN_SECONDS) {
          return Promise.resolve({
            player: players[0],
            question: { sentence: 'Cite 3 capitales' },
          });
        }
        if (gameMode === GameMode.ITS_A_10) {
          return Promise.resolve({
            player: players[0],
            question: { sentence: "C'est un 10 mais il ronfle" },
          });
        }
        if (gameMode === GameMode.WOULD_YOU_RATHER) {
          return Promise.resolve({
            player: players[0],
            question: { choiceA: 'Pouvoir voler', choiceB: 'Être invisible' },
          });
        }
        if (gameMode === GameMode.NEVER_HAVE_I_EVER) {
          return Promise.resolve({
            player: players[0],
            question: { sentence: "Je n'ai jamais menti" },
          });
        }
        if (gameMode === GameMode.WHO_COULD) {
          return Promise.resolve({
            player: players[0],
            question: { sentence: 'Qui pourrait finir en prison ?' },
          });
        }
        return Promise.resolve({
          player: players[0],
          question: { sentence: 'Question générale' },
        });
      }),
    };
    audioService = {
      tick: vi.fn(),
      ring: vi.fn(),
    };
    manager = new BonusGamesManager({ drawQuestionUseCase, audioService });
  });

  afterEach(() => {
    manager.clearTimers();
    vi.useRealTimers();
  });

  describe('La Bombe (Bomb)', () => {
    it('initializes round and ticks over time', async () => {
      const onExplode = vi.fn();
      const state = await manager.startBomb({
        players,
        lang: 'fr',
        onExplode,
        durationMs: 900,
      });

      expect(manager.activeBonusGame).toBe('bomb');
      expect(state.question).toBe('Cite 3 capitales');
      expect(players).toContain(state.activePlayer);

      // Advance by 600ms (2 ticks)
      vi.advanceTimersByTime(600);
      expect(audioService.tick).toHaveBeenCalled();
      expect(manager.bombIsExploded).toBe(false);

      // Advance past duration
      vi.advanceTimersByTime(600);
      expect(manager.bombIsExploded).toBe(true);
      expect(audioService.ring).toHaveBeenCalled();
      expect(onExplode).toHaveBeenCalledWith(expect.objectContaining({ loser: expect.anything() }));
    });

    it('passes bomb to next player and plays tick', async () => {
      await manager.startBomb({
        players,
        lang: 'fr',
        durationMs: 5000,
      });

      const initialIndex = manager.bombPlayerIndex;
      const nextState = await manager.passBomb({ players, lang: 'fr' });

      expect(manager.bombPlayerIndex).toBe((initialIndex + 1) % players.length);
      expect(nextState.activePlayer).toEqual(players[manager.bombPlayerIndex]);
      expect(audioService.tick).toHaveBeenCalled();
    });

    it('personalizes questions with %s and $ tokens', async () => {
      drawQuestionUseCase.execute.mockResolvedValueOnce({
        player: players[0],
        question: { sentence: 'Donne $ gorgées à %s et cite 3 fruits' },
      });

      const state = await manager.startBomb({
        players,
        lang: 'fr',
        durationMs: 5000,
      });

      expect(state.question).not.toContain('%s');
      expect(state.question).not.toContain('$');
    });
  });

  describe('Le Tribunal (Court)', () => {
    it('initializes round and renders verdict when guilty', async () => {
      const state = await manager.startCourt({ players, lang: 'fr' });
      expect(manager.activeBonusGame).toBe('court');
      expect(players).toContain(state.accused);
      expect(typeof state.charge).toBe('string');

      manager.addGuiltyVote();
      manager.addGuiltyVote();
      manager.addInnocentVote();

      const verdict = manager.renderCourtVerdict();
      expect(verdict.isGuilty).toBe(true);
      expect(verdict.guiltyVotes).toBe(2);
      expect(verdict.innocentVotes).toBe(1);
      expect(verdict.drinks).toBe(2);
    });

    it('renders acquittal when innocent votes >= guilty votes', async () => {
      await manager.startCourt({ players, lang: 'fr' });
      manager.addGuiltyVote();
      manager.addInnocentVote();
      manager.addInnocentVote();

      const verdict = manager.renderCourtVerdict();
      expect(verdict.isGuilty).toBe(false);
      expect(verdict.drinks).toBe(2);
    });

    it('personalizes court charge and formats as accusation', async () => {
      drawQuestionUseCase.execute.mockResolvedValueOnce({
        player: players[0],
        question: { sentence: 'bu dans le verre de %s et pris $ shots' },
      });

      const state = await manager.startCourt({ players, lang: 'fr' });
      expect(state.charge).not.toContain('%s');
      expect(state.charge).not.toContain('$');
      expect(state.charge).toContain('A déjà :');
    });
  });

  describe('Le Baromètre (Barometer)', () => {
    it('records ratings and computes average and extreme player', async () => {
      const start = await manager.startBarometer({ players, lang: 'fr' });
      expect(start.situation).toBe("C'est un 10 mais il ronfle");
      expect(start.currentRatingPlayer).toEqual(players[0]);

      // Player 1 gives 8
      let res = manager.submitBarometerRating({ players, rating: 8 });
      expect(res.isFinished).toBe(false);
      expect(res.nextPlayer).toEqual(players[1]);

      // Player 2 gives 7
      res = manager.submitBarometerRating({ players, rating: 7 });
      expect(res.isFinished).toBe(false);
      expect(res.nextPlayer).toEqual(players[2]);

      // Player 3 gives 1 (furthest from average ~5.3)
      res = manager.submitBarometerRating({ players, rating: 1 });
      expect(res.isFinished).toBe(true);
      expect(res.average).toBe(5.3);
      expect(res.extremePlayer).toEqual(players[2]);
      expect(res.extremeRating).toBe(1);
      expect(res.drinks).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Le Consensus (Consensus)', () => {
    it('determines minority voters and handles tie', async () => {
      const start = await manager.startConsensus({ players, lang: 'fr' });
      expect(start.choiceA).toBe('Pouvoir voler');
      expect(start.choiceB).toBe('Être invisible');

      // Player 1 votes A
      manager.submitConsensusVote({ players, choice: 'A' });
      // Player 2 votes B
      manager.submitConsensusVote({ players, choice: 'B' });
      // Player 3 votes B
      const result = manager.submitConsensusVote({ players, choice: 'B' });

      expect(result.isFinished).toBe(true);
      expect(result.countA).toBe(1);
      expect(result.countB).toBe(2);
      expect(result.minorityChoice).toBe('A');
      expect(result.losers).toEqual([players[0]]);
      expect(result.isTie).toBe(false);
    });

    it('detects tie correctly', async () => {
      const twoPlayers = [players[0], players[1]];
      await manager.startConsensus({ players: twoPlayers, lang: 'fr' });

      manager.submitConsensusVote({ players: twoPlayers, choice: 'A' });
      const result = manager.submitConsensusVote({ players: twoPlayers, choice: 'B' });

      expect(result.isTie).toBe(true);
      expect(result.minorityChoice).toBeNull();
    });
  });

  describe('Le Confessionnal Anonyme (Confessional)', () => {
    it('collects anonymous confessions and returns done count', async () => {
      const start = await manager.startConfessional({ players, lang: 'fr' });
      expect(start.prompt).toBe("Je n'ai jamais menti");

      manager.submitConfession({ players, done: true });
      manager.submitConfession({ players, done: false });
      const result = manager.submitConfession({ players, done: true });

      expect(result.isFinished).toBe(true);
      expect(result.doneCount).toBe(2);
      expect(result.totalPlayers).toBe(3);
    });
  });

  describe('Mode Survie (Survival Battle Royale)', () => {
    it('decrements HP on fail and eliminates players until last survivor wins', async () => {
      const twoPlayers = [players[0], players[1]];
      const start = await manager.startSurvival({ players: twoPlayers, lang: 'fr' });

      expect(start.lives[1]).toBe(3);
      expect(start.lives[2]).toBe(3);
      expect(start.isFinished).toBe(false);

      // Force current player to player 1
      manager.survivalCurrentPlayer = twoPlayers[0];

      // Fail 3 times for player 1
      await manager.resolveSurvivalTurn({ success: false, players: twoPlayers, lang: 'fr' });
      expect(manager.survivalLives[1]).toBe(2);

      manager.survivalCurrentPlayer = twoPlayers[0];
      await manager.resolveSurvivalTurn({ success: false, players: twoPlayers, lang: 'fr' });
      expect(manager.survivalLives[1]).toBe(1);

      manager.survivalCurrentPlayer = twoPlayers[0];
      const endState = await manager.resolveSurvivalTurn({
        success: false,
        players: twoPlayers,
        lang: 'fr',
      });
      expect(manager.survivalLives[1]).toBe(0);
      expect(endState.isFinished).toBe(true);
      expect(endState.winner).toEqual(twoPlayers[1]);
    });
  });
});

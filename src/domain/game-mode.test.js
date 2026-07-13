import { describe, it, expect } from 'vitest';
import { GameMode } from './game-mode.js';

describe('GameMode', () => {
  it('should have all mode constants', () => {
    expect(GameMode.NEVER_HAVE_I_EVER).toBe('never_have_i_ever');
    expect(GameMode.ACTION_TRUTH).toBe('action_truth');
    expect(GameMode.WOULD_YOU_RATHER).toBe('would_you_rather');
    expect(GameMode.WHO_COULD).toBe('who_could');
    expect(GameMode.IMPOSTOR).toBe('impostor');
    expect(GameMode.SEVEN_SECONDS).toBe('seven_seconds');
    expect(GameMode.ITS_A_10).toBe('its_a_10');
    expect(GameMode.QUIZ).toBe('quiz');
    expect(GameMode.TEAM_BATTLE).toBe('team_battle');
    expect(GameMode.DORMELLES).toBe('dormelles');
    expect(GameMode.PICOLO).toBe('picolo');
    expect(GameMode.TRUTH_DARE).toBe('truth_dare');
    expect(GameMode.RANDOM).toBe('random');
  });

  describe('getCandidateGameKeys', () => {
    it('should return correct keys for each mode', () => {
      expect(GameMode.getCandidateGameKeys(GameMode.NEVER_HAVE_I_EVER)).toEqual(['jnj']);
      expect(GameMode.getCandidateGameKeys(GameMode.ACTION_TRUTH)).toEqual(['tod', 'dare_chooser']);
      expect(GameMode.getCandidateGameKeys(GameMode.WHO_COULD)).toEqual(['qpr']);
      expect(GameMode.getCandidateGameKeys(GameMode.SEVEN_SECONDS)).toEqual(['7seconds']);
      expect(GameMode.getCandidateGameKeys(GameMode.ITS_A_10)).toEqual(['a_10']);
      expect(GameMode.getCandidateGameKeys(GameMode.IMPOSTOR)).toEqual(['imposter_words']);
      expect(GameMode.getCandidateGameKeys(GameMode.WOULD_YOU_RATHER)).toEqual(['tpf_questions']);
      expect(GameMode.getCandidateGameKeys(GameMode.QUIZ)).toEqual(['quiz_questions']);
      expect(GameMode.getCandidateGameKeys(GameMode.TEAM_BATTLE)).toEqual([
        'team_battle_questions',
      ]);
      expect(GameMode.getCandidateGameKeys(GameMode.DORMELLES)).toEqual(['dormelles_questions']);
      expect(GameMode.getCandidateGameKeys(GameMode.PICOLO)).toEqual(['picolo_rules']);
      expect(GameMode.getCandidateGameKeys(GameMode.TRUTH_DARE)).toEqual(['antoine_dares']);
    });
  });

  describe('needsIntensity', () => {
    it('should return false for modes that do not need intensity', () => {
      expect(GameMode.needsIntensity(GameMode.IMPOSTOR)).toBe(false);
      expect(GameMode.needsIntensity(GameMode.PICOLO)).toBe(false);
      expect(GameMode.needsIntensity(GameMode.TRUTH_DARE)).toBe(false);
    });

    it('should return true for modes that need intensity', () => {
      expect(GameMode.needsIntensity(GameMode.RANDOM)).toBe(true);
      expect(GameMode.needsIntensity(GameMode.NEVER_HAVE_I_EVER)).toBe(true);
      expect(GameMode.needsIntensity(GameMode.ACTION_TRUTH)).toBe(true);
      expect(GameMode.needsIntensity(GameMode.QUIZ)).toBe(true);
    });
  });
});

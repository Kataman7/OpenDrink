import { describe, it, expect } from 'vitest';
import { PromptKind, isModeOnlyLabel, GAME_KEY_MAP, PROMPT_KIND_MAP } from './prompt-kind.js';

describe('PromptKind', () => {
  it('should have all prompt kinds', () => {
    expect(PromptKind.WOULD_YOU_RATHER).toBe('would_you_rather');
    expect(PromptKind.QUIZ).toBe('quiz');
    expect(PromptKind.DORMELLES).toBe('dormelles');
    expect(PromptKind.PICOLO).toBe('picolo');
    expect(PromptKind.TRUTH_DARE).toBe('truth_dare');
    expect(PromptKind.TEAM_BATTLE).toBe('team_battle');
    expect(PromptKind.SEVEN_SECONDS).toBe('seven_seconds');
    expect(PromptKind.IMPOSTOR).toBe('impostor');
    expect(PromptKind.TRUTH).toBe('truth');
    expect(PromptKind.DARE).toBe('dare');
    expect(PromptKind.WHO_COULD).toBe('who_could');
  });
});

describe('isModeOnlyLabel', () => {
  it('should return true for exact match kinds', () => {
    expect(isModeOnlyLabel('would_you_rather')).toBe(true);
    expect(isModeOnlyLabel('who_could')).toBe(true);
    expect(isModeOnlyLabel('impostor')).toBe(true);
    expect(isModeOnlyLabel('quiz')).toBe(true);
    expect(isModeOnlyLabel('dormelles')).toBe(true);
  });

  it('should return true for prefixed kinds', () => {
    expect(isModeOnlyLabel('team_battle_1')).toBe(true);
    expect(isModeOnlyLabel('picolo_2')).toBe(true);
    expect(isModeOnlyLabel('truth_dare_0')).toBe(true);
  });

  it('should return false for other kinds', () => {
    expect(isModeOnlyLabel('truth')).toBe(false);
    expect(isModeOnlyLabel('dare')).toBe(false);
    expect(isModeOnlyLabel('would_you_rather_extra')).toBe(false);
    expect(isModeOnlyLabel(null)).toBe(false);
    expect(isModeOnlyLabel(undefined)).toBe(false);
  });
});

describe('GAME_KEY_MAP', () => {
  it('should have all mode keys', () => {
    expect(GAME_KEY_MAP.never_have_i_ever).toEqual(['jnj']);
    expect(GAME_KEY_MAP.action_truth).toEqual(['tod', 'dare_chooser']);
    expect(GAME_KEY_MAP.impostor).toEqual(['imposter_words']);
    expect(GAME_KEY_MAP.truth_dare).toEqual(['antoine_dares']);
  });
});

describe('PROMPT_KIND_MAP', () => {
  it('should map game keys to prompt kinds', () => {
    expect(PROMPT_KIND_MAP.tod).toBe('truth');
    expect(PROMPT_KIND_MAP.dare_chooser).toBe('dare');
    expect(PROMPT_KIND_MAP.qpr).toBe('who_could');
  });
});

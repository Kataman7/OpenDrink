import { describe, it, expect, beforeEach } from 'vitest';
import { GameState, RANDOM_COMPATIBLE_MODES } from './game-state.js';

describe('GameState seenQuestions history', () => {
  let state;

  beforeEach(() => {
    state = new GameState({ screens: { loading: 'loading' } });
  });

  it('should initialize with empty seenQuestions set', () => {
    expect(state.seenQuestions.size).toBe(0);
  });

  it('should record question sentence', () => {
    state.recordSeenQuestion({ sentence: 'Never have I ever danced' });
    expect(state.seenQuestions.has('Never have I ever danced')).toBe(true);
  });

  it('should record Would You Rather choices as key', () => {
    state.recordSeenQuestion({ choiceA: 'Be rich', choiceB: 'Be famous' });
    expect(state.seenQuestions.has('Be rich::Be famous')).toBe(true);
  });

  it('should record Impostor word as key', () => {
    state.recordSeenQuestion({ word: 'Croissant' });
    expect(state.seenQuestions.has('impostor:Croissant')).toBe(true);
  });

  it('should pass seen questions in buildRoundRequest', () => {
    state.recordSeenQuestion({ sentence: 'Question 1' });
    state.recordSeenQuestion({ sentence: 'Question 2' });

    const req = state.buildRoundRequest();
    expect(req.excludeSentences).toContain('Question 1');
    expect(req.excludeSentences).toContain('Question 2');
  });

  it('should clear seen questions on clearSeenQuestions', () => {
    state.recordSeenQuestion({ sentence: 'Question 1' });
    expect(state.seenQuestions.size).toBe(1);

    state.clearSeenQuestions();
    expect(state.seenQuestions.size).toBe(0);
  });

  it('should not contain truth_dare in RANDOM_COMPATIBLE_MODES', () => {
    const ids = RANDOM_COMPATIBLE_MODES.map(m => m.id);
    expect(ids).toContain('action_truth');
    expect(ids).not.toContain('truth_dare');
  });
});

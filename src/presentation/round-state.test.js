import { describe, it, expect } from 'vitest';
import { RoundState } from './round-state.js';

describe('RoundState', () => {
  it('should start with no mode selected', () => {
    const state = new RoundState();
    expect(state.selectedGameMode).toBeNull();
    expect(state.selectedIntensity).toBeNull();
    expect(state.currentRoundMode).toBeNull();
    expect(state.randomModeIds).toEqual([]);
  });

  it('should select a game mode', () => {
    const state = new RoundState();
    state.selectMode('never_have_i_ever');
    expect(state.selectedGameMode).toBe('never_have_i_ever');
  });

  it('should select intensity', () => {
    const state = new RoundState();
    state.selectIntensity('hot');
    expect(state.selectedIntensity).toBe('hot');
  });

  it('should set random mode ids', () => {
    const state = new RoundState();
    state.setRandomModes(['quiz', 'dormelles']);
    expect(state.randomModeIds).toEqual(['quiz', 'dormelles']);
  });

  it('should pick a random round mode from the list', () => {
    const state = new RoundState();
    state.selectMode('random');
    state.setRandomModes(['quiz', 'dormelles']);
    const picked = state.pickRandomRoundMode();
    expect(['quiz', 'dormelles']).toContain(picked);
  });

  it('should fall back to selectedGameMode if randomModeIds is empty', () => {
    const state = new RoundState();
    state.selectMode('quiz');
    expect(state.pickRandomRoundMode()).toBe('quiz');
  });

  it('should get active game mode (currentRoundMode priority)', () => {
    const state = new RoundState();
    state.selectMode('random');
    state.setCurrentRoundMode('quiz');
    expect(state.getActiveGameMode()).toBe('quiz');
  });

  it('should get active game mode (selectedGameMode fallback)', () => {
    const state = new RoundState();
    state.selectMode('never_have_i_ever');
    expect(state.getActiveGameMode()).toBe('never_have_i_ever');
  });

  it('should reset all state', () => {
    const state = new RoundState();
    state.selectMode('quiz');
    state.selectIntensity('hot');
    state.setRandomModes(['dormelles']);
    state.setCurrentRoundMode('dormelles');
    state.reset();
    expect(state.selectedGameMode).toBeNull();
    expect(state.selectedIntensity).toBeNull();
    expect(state.randomModeIds).toEqual([]);
    expect(state.currentRoundMode).toBeNull();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { RoundRenderer } from './round-renderer.js';

describe('RoundRenderer TTS player name prefixing', () => {
  it('should prefix player name when sentence does not start with player name', () => {
    const mockSpeak = vi.fn();
    const mockView = {
      renderRound: vi.fn(),
      getQuestionText: vi.fn().mockReturnValue('Fais 10 pompes.'),
    };
    const mockState = {
      buildRoundLabelInput: vi.fn(),
      shouldDisplayRoundPlayerName: vi.fn().mockReturnValue(true),
      players: [{ id: 1, name: 'Alice' }],
      selectedLang: 'fr',
      getActiveGameMode: vi.fn().mockReturnValue('action_truth'),
    };
    const mockLabelBuilder = {
      build: vi.fn().mockReturnValue('Action ou Vérité'),
      i18n: { t: vi.fn(k => k) },
    };
    const mockTts = {
      isAutoReadEnabled: vi.fn().mockReturnValue(true),
      speak: mockSpeak,
    };

    const renderer = new RoundRenderer({
      view: mockView,
      state: mockState,
      roundLabelBuilder: mockLabelBuilder,
      textToSpeech: mockTts,
    });

    renderer.renderRound({
      player: { id: 1, name: 'Alice' },
      question: { sentence: 'Fais 10 pompes.', promptKind: 'dare' },
    });

    expect(mockSpeak).toHaveBeenCalledWith(
      'Alice : Fais 10 pompes.',
      'action_truth',
      'fr',
      mockLabelBuilder.i18n
    );
  });

  it('should not duplicate player name when sentence already starts with player name', () => {
    const mockSpeak = vi.fn();
    const mockView = {
      renderRound: vi.fn(),
      getQuestionText: vi.fn().mockReturnValue('Alice, quelle est ta pire honte ?'),
    };
    const mockState = {
      buildRoundLabelInput: vi.fn(),
      shouldDisplayRoundPlayerName: vi.fn().mockReturnValue(true),
      players: [{ id: 1, name: 'Alice' }],
      selectedLang: 'fr',
      getActiveGameMode: vi.fn().mockReturnValue('action_truth'),
    };
    const mockLabelBuilder = {
      build: vi.fn().mockReturnValue('Action ou Vérité'),
      i18n: { t: vi.fn(k => k) },
    };
    const mockTts = {
      isAutoReadEnabled: vi.fn().mockReturnValue(true),
      speak: mockSpeak,
    };

    const renderer = new RoundRenderer({
      view: mockView,
      state: mockState,
      roundLabelBuilder: mockLabelBuilder,
      textToSpeech: mockTts,
    });

    renderer.renderRound({
      player: { id: 1, name: 'Alice' },
      question: { sentence: 'Alice, quelle est ta pire honte ?', promptKind: 'truth' },
    });

    expect(mockSpeak).toHaveBeenCalledWith(
      'Alice, quelle est ta pire honte ?',
      'action_truth',
      'fr',
      mockLabelBuilder.i18n
    );
  });

  it('should not prefix player name when showPlayerName is false', () => {
    const mockSpeak = vi.fn();
    const mockView = {
      renderRound: vi.fn(),
      getQuestionText: vi.fn().mockReturnValue('Tu préfères voler ou être invisible ?'),
    };
    const mockState = {
      buildRoundLabelInput: vi.fn(),
      shouldDisplayRoundPlayerName: vi.fn().mockReturnValue(false),
      players: [{ id: 1, name: 'Alice' }],
      selectedLang: 'fr',
      getActiveGameMode: vi.fn().mockReturnValue('would_you_rather'),
    };
    const mockLabelBuilder = {
      build: vi.fn().mockReturnValue('Tu préfères'),
      i18n: { t: vi.fn(k => k) },
    };
    const mockTts = {
      isAutoReadEnabled: vi.fn().mockReturnValue(true),
      speak: mockSpeak,
    };

    const renderer = new RoundRenderer({
      view: mockView,
      state: mockState,
      roundLabelBuilder: mockLabelBuilder,
      textToSpeech: mockTts,
    });

    renderer.renderRound({
      player: { id: 1, name: 'Alice' },
      question: {
        choiceA: 'Voler',
        choiceB: 'Être invisible',
        promptKind: 'would_you_rather',
      },
    });

    expect(mockSpeak).toHaveBeenCalledWith(
      'Tu préfères voler ou être invisible ?',
      'would_you_rather',
      'fr',
      mockLabelBuilder.i18n
    );
  });
});

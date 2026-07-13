import { describe, it, expect, beforeEach } from 'vitest';
import { RoundLabelBuilder } from './round-label-builder.js';
import { I18n } from '../shared/i18n.js';

const en = {
  mode: {
    neverHaveIEver: 'Never Have I Ever',
    truthOrDare: 'Truth or Dare',
    wouldYouRather: 'Would You Rather',
    whoCould: 'Who Could',
    impostor: 'Impostor',
    sevenSeconds: '7 Seconds',
    itsA10: "It's a 10",
    quiz: 'Quiz',
    teamBattle: 'Team Battle',
    dormelles: 'Dormelles',
    picolo: 'Picolo',
    truthDare: 'Truth or Dare (Classic)',
  },
  intensity: { soft: 'Soft', hot: 'Hot', mixed: 'Mixed' },
  round: {
    truth: 'Truth',
    dare: 'Dare',
    withIntensity: '{mode} - {intensity}',
    truthWithIntensity: '{mode} ({truth}) - {intensity}',
    dareWithIntensity: '{mode} ({dare}) - {intensity}',
  },
};

function createLabelBuilder() {
  const i18n = new I18n({ translations: { en } });
  i18n.setLanguage('en');
  return new RoundLabelBuilder(i18n);
}

describe('RoundLabelBuilder', () => {
  let builder;

  beforeEach(() => {
    builder = createLabelBuilder();
  });

  it('should return mode only for mode-only labels', () => {
    const label = builder.build({
      gameMode: 'quiz',
      intensity: 'hot',
      promptKind: 'quiz',
    });
    expect(label).toBe('Quiz');
  });

  it('should return mode with intensity for standard modes', () => {
    const label = builder.build({
      gameMode: 'never_have_i_ever',
      intensity: 'hot',
      promptKind: null,
    });
    expect(label).toBe('Never Have I Ever - Hot');
  });

  it('should build truth label', () => {
    const label = builder.build({
      gameMode: 'action_truth',
      intensity: 'hot',
      promptKind: 'truth',
    });
    expect(label).toBe('Truth or Dare (Truth) - Hot');
  });

  it('should build dare label', () => {
    const label = builder.build({
      gameMode: 'action_truth',
      intensity: 'soft',
      promptKind: 'dare',
    });
    expect(label).toBe('Truth or Dare (Dare) - Soft');
  });
});

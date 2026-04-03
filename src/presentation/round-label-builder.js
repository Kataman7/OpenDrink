const MODE_KEY_BY_VALUE = {
  never_have_i_ever: 'mode.neverHaveIEver',
  action_truth: 'mode.truthOrDare',
  would_you_rather: 'mode.wouldYouRather',
  who_could: 'mode.whoCould',
  impostor: 'mode.impostor',
}; // We should use typescript enums for this.


const INTENSITY_KEY_BY_VALUE = {
  soft: 'intensity.soft',
  hot: 'intensity.hot',
  mixed: 'intensity.mixed',
};

export class RoundLabelBuilder {
  constructor(i18n) {
    this.i18n = i18n;
  }

  build({ gameMode, intensity, promptKind }) {
    const modeLabel = this.i18n.t(MODE_KEY_BY_VALUE[gameMode]);
    if (promptKind === 'would_you_rather' || promptKind === 'who_could' || promptKind === 'impostor') {
      return modeLabel;
    }

    const intensityLabel = this.i18n.t(INTENSITY_KEY_BY_VALUE[intensity]);
    if (promptKind === 'truth') return this.buildTruthLabel(modeLabel, intensityLabel);
    if (promptKind === 'dare') return this.buildDareLabel(modeLabel, intensityLabel);
    return this.i18n.t('round.withIntensity', { mode: modeLabel, intensity: intensityLabel });
  }

  buildTruthLabel(modeLabel, intensityLabel) {
    return this.i18n.t('round.truthWithIntensity', {
      mode: modeLabel,
      truth: this.i18n.t('round.truth'),
      intensity: intensityLabel,
    });
  }

  buildDareLabel(modeLabel, intensityLabel) {
    return this.i18n.t('round.dareWithIntensity', {
      mode: modeLabel,
      dare: this.i18n.t('round.dare'),
      intensity: intensityLabel,
    });
  }
}

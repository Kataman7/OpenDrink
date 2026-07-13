export class RoundState {
  constructor() {
    this.randomModeIds = [];
    this.currentRoundMode = null;
    this.selectedGameMode = null;
    this.selectedIntensity = null;
  }

  selectMode(mode) {
    this.selectedGameMode = mode;
  }

  selectIntensity(intensity) {
    this.selectedIntensity = intensity;
  }

  setRandomModes(modeIds) {
    this.randomModeIds = modeIds;
  }

  setCurrentRoundMode(mode) {
    this.currentRoundMode = mode;
  }

  pickRandomRoundMode() {
    if (this.randomModeIds.length === 0) return this.selectedGameMode;
    return this.randomModeIds[Math.floor(Math.random() * this.randomModeIds.length)];
  }

  getActiveGameMode() {
    return this.currentRoundMode || this.selectedGameMode;
  }

  reset() {
    this.selectedGameMode = null;
    this.selectedIntensity = null;
    this.randomModeIds = [];
    this.currentRoundMode = null;
  }
}

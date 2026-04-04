import { SCREENS } from './screens.js';

export class ScreenManager {
  constructor({ state, view }) {
    this.state = state;
    this.view = view;
  }

  switchScreen(screen) {
    this.state.screen = screen;
    this.view.hideError();
    this.renderCurrentScreen();
    if (screen === SCREENS.lobby) {
      this.renderPlayers();
    }
  }

  renderCurrentScreen() {
    this.view.renderScreen(this.state.screen);
  }

  renderPlayers() {
    this.view.renderPlayerList(this.state.players);
  }

  navigateToLobby() {
    this.state.resetRoundSelection();
    this.switchScreen(SCREENS.lobby);
  }

  navigateToModeSelection() {
    this.switchScreen(SCREENS.mode);
  }

  navigateToIntensitySelection() {
    this.switchScreen(SCREENS.intensity);
  }

  navigateToGameScreen() {
    this.switchScreen(SCREENS.game);
  }

  navigateToImpostorReveal() {
    this.switchScreen(SCREENS.impostorReveal);
  }
}

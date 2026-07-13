import { SCREENS } from './screens.js';

export class ScreenManager {
  constructor({ state, view }) {
    this.state = state;
    this.view = view;
    this._setupBackButton();
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
    this._pushHistory();
    this.switchScreen(SCREENS.mode);
  }

  navigateToModeRandom() {
    this._pushHistory();
    this.switchScreen(SCREENS.modeRandom);
  }

  navigateToIntensitySelection() {
    this._pushHistory();
    this.switchScreen(SCREENS.intensity);
  }

  navigateToGameScreen() {
    this._pushHistory();
    this.switchScreen(SCREENS.game);
  }

  navigateToImpostorReveal() {
    this._pushHistory();
    this.switchScreen(SCREENS.impostorReveal);
  }

  _pushHistory() {
    history.pushState({ screen: this.state.screen }, '');
  }

  _setupBackButton() {
    window.addEventListener('popstate', () => {
      if (this.state.screen !== SCREENS.lobby) {
        this.navigateToLobby();
      }
    });
  }
}

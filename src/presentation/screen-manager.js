import { SCREENS } from './screens.js';

export class ScreenManager {
  constructor({ state, view }) {
    this.state = state;
    this.view = view;
    this._navStack = [];
    this._setupBackButton();
  }

  switchScreen(screen) {
    this.state.screen = screen;
    this.view.hideError();
    this.renderCurrentScreen();
    if (screen === SCREENS.lobby) {
      this.state.resetRoundSelection();
      this.renderPlayers();
    }
  }

  renderCurrentScreen() {
    this.view.renderScreen(this.state.screen);
  }

  renderPlayers() {
    this.view.renderPlayerList(this.state.players);
  }

  goBack() {
    if (this._navStack.length === 0) {
      this.navigateToHome();
      return;
    }
    const previousScreen = this._navStack.pop();
    this.switchScreen(previousScreen);
  }

  navigateToHome() {
    this._navStack = [];
    this.switchScreen(SCREENS.home);
  }

  navigateToLobby() {
    this._navStack = [];
    this.switchScreen(SCREENS.lobby);
  }

  navigateToCardGames() {
    this._push(SCREENS.cardGames);
  }

  navigateToCardGameDetail() {
    this._push(SCREENS.cardGameDetail);
  }

  navigateToModeSelection() {
    this._push(SCREENS.mode);
  }

  navigateToModeRandom() {
    this._push(SCREENS.modeRandom);
  }

  navigateToIntensitySelection() {
    this._push(SCREENS.intensity);
  }

  navigateToGameScreen() {
    this._push(SCREENS.game);
  }

  navigateToImpostorReveal() {
    this._push(SCREENS.impostorReveal);
  }

  navigateToImpostorSettings() {
    this._push(SCREENS.impostorSettings);
  }

  _push(screen) {
    this._navStack.push(this.state.screen);
    this._pushHistory();
    this.switchScreen(screen);
  }

  _pushHistory() {
    history.pushState({ nav: true }, '');
  }

  _setupBackButton() {
    window.addEventListener('popstate', () => {
      this.goBack();
    });
  }
}

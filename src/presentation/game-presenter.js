import { SUPPORTED_LANGUAGES } from '../domain/value-objects.js';
import { createI18n } from './i18n.js';
import { GameView } from './game-view.js';
import { RoundLabelBuilder } from './round-label-builder.js';
import { GameState } from './game-state.js';
import { ScreenManager } from './screen-manager.js';
import { PreferencesManager } from './preferences-manager.js';
import { ImpostorManager } from './impostor-manager.js';
import { SCREENS } from './screens.js';
import { GameEventHandler } from './game-event-handler.js';
import { createDependencies } from './dependency-injection.js';

export class GamePresenter {
  constructor() {
    this.state = new GameState({ screens: SCREENS });
    this.i18n = createI18n();
    this.view = new GameView({ i18n: this.i18n });
    this.roundLabelBuilder = new RoundLabelBuilder(this.i18n);
    this.screenManager = new ScreenManager({ state: this.state, view: this.view });

    const deps = createDependencies();
    this.preferencesManager = new PreferencesManager({
      preferencesStore: deps.preferencesStore,
      i18n: this.i18n,
      state: this.state,
    });
    this.impostorManager = new ImpostorManager({
      getImpostorWordUseCase: deps.getImpostorWordUseCase,
    });

    this.eventHandler = new GameEventHandler({
      view: this.view,
      state: this.state,
      playerManager: deps.playerManager,
      screenManager: this.screenManager,
      impostorManager: this.impostorManager,
      drawQuestionUseCase: deps.drawQuestionUseCase,
      i18n: this.i18n,
      preferencesManager: this.preferencesManager,
      roundLabelBuilder: this.roundLabelBuilder,
      initializeDatabaseUseCase: deps.initializeDatabaseUseCase,
      addPlayerUseCase: deps.addPlayerUseCase,
      removePlayerUseCase: deps.removePlayerUseCase,
      textToSpeech: deps.textToSpeech,
    });
  }

  async initialize() {
    this.eventHandler.bind();
    this.view.renderLanguageSelector({
      languages: SUPPORTED_LANGUAGES,
      selectedLang: this.state.selectedLang,
    });
    this.view.applyStaticTranslations(this.state.selectedLang);
    await this.eventHandler.initialize();
  }
}

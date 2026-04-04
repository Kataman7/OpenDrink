export class PreferencesManager {
  constructor({ preferencesStore, i18n, state }) {
    this.preferencesStore = preferencesStore;
    this.i18n = i18n;
    this.state = state;
  }

  restore() {
    const preferences = this.preferencesStore.load();
    this.state.applyPreferences(preferences);
    this.i18n.setLanguage(this.state.selectedLang);
  }

  async restorePlayers(addPlayerByNameFn) {
    for (const playerName of this.state.consumeRestoredPlayerNames()) {
      await addPlayerByNameFn(playerName);
    }
  }

  persist(state) {
    this.preferencesStore.save(state.toPreferencesPayload());
  }

  handleLanguageChange(selectedLang, i18n, view, renderPlayersFn) {
    i18n.setLanguage(selectedLang);
    view.applyStaticTranslations(selectedLang);
    renderPlayersFn();
  }
}

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

  persist() {
    this.preferencesStore.save(this.state.toPreferencesPayload());
  }
}

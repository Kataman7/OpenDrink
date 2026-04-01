const STORAGE_KEY = 'opendrink_prefs_v1';
const DEFAULT_LANG = 'en';

export class PreferencesStore {
  load() {
    const rawValue = localStorage.getItem(STORAGE_KEY);
    if (!rawValue) return { lang: DEFAULT_LANG, players: [] };
    try {
      const parsedValue = JSON.parse(rawValue);
      const lang = parsedValue.lang || DEFAULT_LANG;
      const players = Array.isArray(parsedValue.players) ? parsedValue.players : [];
      return { lang, players };
    } catch {
      return { lang: DEFAULT_LANG, players: [] };
    }
  }

  save({ lang, players }) {
    const payload = JSON.stringify({ lang, players });
    localStorage.setItem(STORAGE_KEY, payload);
  }
}

const STORAGE_KEY = 'opendrink_prefs_v1';

export class PreferencesStore {
  load() {
    const rawValue = localStorage.getItem(STORAGE_KEY);
    if (!rawValue) return { lang: 'fr', players: [] };
    try {
      const parsedValue = JSON.parse(rawValue);
      const lang = parsedValue.lang || 'fr';
      const players = Array.isArray(parsedValue.players) ? parsedValue.players : [];
      return { lang, players };
    } catch {
      return { lang: 'fr', players: [] };
    }
  }

  save({ lang, players }) {
    const payload = JSON.stringify({ lang, players });
    localStorage.setItem(STORAGE_KEY, payload);
  }
}

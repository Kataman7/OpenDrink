import { LocalStorage } from '../shared/local-storage.js';

const STORAGE_KEY = 'opendrink_prefs_v1';
const DEFAULT_LANG = 'en';

export class PreferencesStore extends LocalStorage {
  constructor() {
    super({ key: STORAGE_KEY });
  }

  load() {
    const data = super.load();
    if (!data) return { lang: DEFAULT_LANG, players: [] };

    const lang = data.lang || DEFAULT_LANG;
    const players = Array.isArray(data.players) ? data.players : [];

    return { lang, players };
  }
}

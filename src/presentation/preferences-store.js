import { LocalStorage } from '../shared/local-storage.js';
import { DEFAULT_LANG } from '../config.js';

const STORAGE_KEY = 'opendrink_prefs_v1';

export class PreferencesStore extends LocalStorage {
  constructor() {
    super({ key: STORAGE_KEY });
  }

  load() {
    const data = super.load();
    if (!data) return { lang: DEFAULT_LANG, players: [], autoRead: false };

    const lang = data.lang || DEFAULT_LANG;
    const players = Array.isArray(data.players) ? data.players : [];
    const autoRead = Boolean(data.autoRead);

    return { lang, players, autoRead };
  }
}

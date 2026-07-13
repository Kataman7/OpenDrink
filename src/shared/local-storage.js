export class LocalStorage {
  constructor({ key }) {
    this.storageKey = key;
  }

  load() {
    try {
      const rawValue = localStorage.getItem(this.storageKey);
      if (!rawValue) return null;
      return JSON.parse(rawValue);
    } catch {
      return null;
    }
  }

  save(data) {
    try {
      const payload = JSON.stringify(data);
      localStorage.setItem(this.storageKey, payload);
    } catch {
      // Storage full or unavailable (e.g. private browsing)
    }
  }

  clear() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // Storage unavailable
    }
  }
}

export class LocalStorage {
  constructor({ key }) {
    this.storageKey = key;
  }

  load() {
    const rawValue = localStorage.getItem(this.storageKey);
    if (!rawValue) return null;
    try {
      return JSON.parse(rawValue);
    } catch {
      return null;
    }
  }

  save(data) {
    const payload = JSON.stringify(data);
    localStorage.setItem(this.storageKey, payload);
  }

  clear() {
    localStorage.removeItem(this.storageKey);
  }
}

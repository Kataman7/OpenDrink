export class PlayerPicker {
  constructor(players) {
    this.players = players;
    this.used = new Set();
  }

  pick(excludeId = null) {
    const candidates = this.players.filter(p => p.id !== excludeId && !this.used.has(p.id));
    if (candidates.length > 0) {
      const p = candidates[Math.floor(Math.random() * candidates.length)];
      this.used.add(p.id);
      return p.name;
    }
    const fallback = this.players.filter(p => p.id !== excludeId);
    const pool = fallback.length > 0 ? fallback : this.players;
    if (pool.length === 0) return '';
    return pool[Math.floor(Math.random() * pool.length)].name;
  }

  pickFrom(ids, excludeId = null) {
    const candidates = ids.filter(id => id !== excludeId && !this.used.has(id));
    if (candidates.length > 0) {
      const id = candidates[Math.floor(Math.random() * candidates.length)];
      this.used.add(id);
      const p = this.players.find(pl => pl.id === id);
      return p ? p.name : '';
    }
    const fallbackIds = ids.filter(id => id !== excludeId);
    const poolIds = fallbackIds.length > 0 ? fallbackIds : ids;
    if (poolIds.length === 0) return '';
    const id = poolIds[Math.floor(Math.random() * poolIds.length)];
    const p = this.players.find(pl => pl.id === id);
    return p ? p.name : '';
  }
}

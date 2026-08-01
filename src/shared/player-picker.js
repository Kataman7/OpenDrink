export class PlayerPicker {
  constructor(players) {
    this.players = players;
    this.used = new Set();
  }

  pick() {
    const candidates = this.players.filter(p => !this.used.has(p.id));
    if (candidates.length === 0) return '';
    const p = candidates[Math.floor(Math.random() * candidates.length)];
    this.used.add(p.id);
    return p.name;
  }

  pickFrom(ids, excludeId = null) {
    const candidates = ids.filter(id => id !== excludeId && !this.used.has(id));
    if (candidates.length === 0) return '';
    const id = candidates[Math.floor(Math.random() * candidates.length)];
    this.used.add(id);
    const p = this.players.find(pl => pl.id === id);
    return p ? p.name : '';
  }
}

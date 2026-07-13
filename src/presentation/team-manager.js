import { shuffleArray } from '../shared/random.js';

export class TeamManager {
  constructor() {
    this.teamOnePlayerIds = [];
    this.teamTwoPlayerIds = [];
  }

  buildTeams(players) {
    const shuffled = shuffleArray(players);
    const mid = Math.ceil(shuffled.length / 2);
    this.teamOnePlayerIds = shuffled.slice(0, mid).map(p => p.id);
    this.teamTwoPlayerIds = shuffled.slice(mid).map(p => p.id);
  }

  getPlayersForTeam(teamIds, players) {
    return players.filter(p => teamIds.includes(p.id));
  }

  pickRandomFromTeam(teamIds, allPlayers, excludeId = null) {
    const candidates = teamIds.filter(id => id !== excludeId);
    if (candidates.length === 0) {
      const fallback = teamIds[0];
      if (!fallback) return '';
      const p = allPlayers.find(pl => pl.id === fallback);
      return p ? p.name : '';
    }
    const id = candidates[Math.floor(Math.random() * candidates.length)];
    const p = allPlayers.find(pl => pl.id === id);
    return p ? p.name : '';
  }

  reset() {
    this.teamOnePlayerIds = [];
    this.teamTwoPlayerIds = [];
  }
}

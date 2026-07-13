import { describe, it, expect } from 'vitest';
import { TeamManager } from './team-manager.js';

const players = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
  { id: 4, name: 'Diana' },
];

describe('TeamManager', () => {
  it('should start with empty teams', () => {
    const tm = new TeamManager();
    expect(tm.teamOnePlayerIds).toEqual([]);
    expect(tm.teamTwoPlayerIds).toEqual([]);
  });

  it('should build teams from players', () => {
    const tm = new TeamManager();
    tm.buildTeams(players);
    expect(tm.teamOnePlayerIds).toHaveLength(2);
    expect(tm.teamTwoPlayerIds).toHaveLength(2);
    const allIds = [...tm.teamOnePlayerIds, ...tm.teamTwoPlayerIds];
    expect(allIds.sort()).toEqual([1, 2, 3, 4]);
  });

  it('should build unbalanced teams for odd player count', () => {
    const tm = new TeamManager();
    tm.buildTeams(players.slice(0, 3));
    expect(tm.teamOnePlayerIds).toHaveLength(2);
    expect(tm.teamTwoPlayerIds).toHaveLength(1);
  });

  it('should get players for team', () => {
    const tm = new TeamManager();
    tm.buildTeams(players);
    const team1 = tm.getPlayersForTeam(tm.teamOnePlayerIds, players);
    expect(team1).toHaveLength(2);
    team1.forEach(p => {
      expect(tm.teamOnePlayerIds).toContain(p.id);
    });
  });

  it('should pick random player from team excluding given id', () => {
    const tm = new TeamManager();
    tm.teamOnePlayerIds = [1, 2];
    const name = tm.pickRandomFromTeam([1, 2], players, 1);
    expect(name).toBe('Bob');
  });

  it('should return the only player if all are excluded', () => {
    const tm = new TeamManager();
    tm.teamOnePlayerIds = [1];
    expect(tm.pickRandomFromTeam([1], players, 1)).toBe('Alice');
  });

  it('should reset teams', () => {
    const tm = new TeamManager();
    tm.buildTeams(players);
    tm.reset();
    expect(tm.teamOnePlayerIds).toEqual([]);
    expect(tm.teamTwoPlayerIds).toEqual([]);
  });
});

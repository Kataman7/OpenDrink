import { describe, it, expect } from 'vitest';
import { TeamBattlePersonalizer } from './team-battle-personalizer.js';

describe('TeamBattlePersonalizer', () => {
  const personalizer = new TeamBattlePersonalizer();
  const players = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
    { id: 4, name: 'Diana' },
  ];
  const teamOneIds = [1, 2];
  const teamTwoIds = [3, 4];

  function personalize(sentence, currentPlayer) {
    return personalizer.personalize(sentence, {
      currentPlayer,
      allPlayers: players,
      teamOneIds,
      teamTwoIds,
      i18n: null,
    });
  }

  it('should replace ${je1} with a team one player name', () => {
    const result = personalize('${je1} starts', players[0]);
    const replacedPart = result.replace(' starts', '');
    const teamOneNames = teamOneIds.map(id => players.find(p => p.id === id)?.name);
    expect(teamOneNames).toContain(replacedPart);
  });

  it('should replace ${jo1} with a team two player name', () => {
    const result = personalize('${jo1} goes next', players[0]);
    const replacedPart = result.replace(' goes next', '');
    const teamTwoNames = teamTwoIds.map(id => players.find(p => p.id === id)?.name);
    expect(teamTwoNames).toContain(replacedPart);
  });

  it('should replace ${ja1} with any other player name', () => {
    const result = personalize('${ja1} does the dare', players[0]);
    const replacedPart = result.replace(' does the dare', '');
    expect(['Bob', 'Charlie', 'Diana']).toContain(replacedPart);
  });

  it('should replace ${make_team_win} with text (fallback when i18n is null)', () => {
    const result = personalize('First to touch their phone ${make_team_win}', players[0]);
    expect(result).toMatch(/teamBattle\.yourTeamWins/);
  });

  it('should replace ${win_or_lose} with wins or loses (fallback keys)', () => {
    const result = personalize('The team ${win_or_lose}', players[0]);
    expect(result).toMatch(/^The team (teamBattle\.wins|teamBattle\.loses)$/);
  });

  it('should replace with i18n translations when provided', () => {
    const i18n = { t: key => ({ 'teamBattle.yourTeamWins': 'your team wins' })[key] || key };
    const result = personalizer.personalize('${make_team_win}', {
      currentPlayer: players[0],
      allPlayers: players,
      teamOneIds,
      teamTwoIds,
      i18n,
    });
    expect(result).toBe('your team wins');
  });

  it('should handle sentence with no tokens', () => {
    expect(personalize('Water sports', players[0])).toBe('Water sports');
  });

  it('should exclude current player from team picks', () => {
    const result = personalize('${je1} drinks', players[0]);
    const replacedPart = result.replace(' drinks', '');
    expect(replacedPart).toBe('Bob');
  });
});

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

  it('should replace ${je1} with a team one player name', () => {
    const result = personalizer.personalize(
      '${je1} starts',
      players[0],
      players,
      teamOneIds,
      teamTwoIds
    );
    const replacedPart = result.replace(' starts', '');
    const teamOneNames = teamOneIds.map(id => players.find(p => p.id === id)?.name);
    expect(teamOneNames).toContain(replacedPart);
  });

  it('should replace ${jo1} with a team two player name', () => {
    const result = personalizer.personalize(
      '${jo1} goes next',
      players[0],
      players,
      teamOneIds,
      teamTwoIds
    );
    const replacedPart = result.replace(' goes next', '');
    const teamTwoNames = teamTwoIds.map(id => players.find(p => p.id === id)?.name);
    expect(teamTwoNames).toContain(replacedPart);
  });

  it('should replace ${make_team_win} with text', () => {
    const result = personalizer.personalize(
      'First to touch their phone ${make_team_win}',
      players[0],
      players,
      teamOneIds,
      teamTwoIds
    );
    expect(result).toMatch(/your team wins/);
  });

  it('should replace ${win_or_loose} with wins or loses', () => {
    const result = personalizer.personalize(
      'The team ${win_or_loose}',
      players[0],
      players,
      teamOneIds,
      teamTwoIds
    );
    expect(['wins', 'loses']).toContain(result.match(/The team (\w+)/)[1]);
  });

  it('should handle sentence with no tokens', () => {
    const result = personalizer.personalize(
      'Water sports',
      players[0],
      players,
      teamOneIds,
      teamTwoIds
    );
    expect(result).toBe('Water sports');
  });
});

function pickRandomName(playerIds, allPlayers, excludeId = null) {
  const candidates = playerIds.filter(id => id !== excludeId);
  if (candidates.length === 0) {
    const fallback = playerIds[0];
    if (!fallback) return '';
    const p = allPlayers.find(pl => pl.id === fallback);
    return p ? p.name : '';
  }
  const id = candidates[Math.floor(Math.random() * candidates.length)];
  const p = allPlayers.find(pl => pl.id === id);
  return p ? p.name : '';
}

function pickRandomPlayerName(allPlayers, excludeId = null) {
  const candidates = allPlayers.filter(p => p.id !== excludeId);
  if (candidates.length === 0) {
    return allPlayers[0] ? allPlayers[0].name : '';
  }
  return candidates[Math.floor(Math.random() * candidates.length)].name;
}

export class TeamBattlePersonalizer {
  personalize(sentence, currentPlayer, allPlayers, teamOneIds, teamTwoIds) {
    const excludeId = currentPlayer ? currentPlayer.id : null;

    return sentence.replace(/\$\{([^}]+)\}/g, (_, token) => {
      if (token === 'make_team_win') return 'your team wins';
      if (token === 'make_team_win_or_loose') return Math.random() > 0.5 ? 'wins' : 'loses';
      if (token === 'ot_or_you_loose')
        return Math.random() > 0.5 ? 'the other team loses' : 'you lose';
      if (token === 'win_or_loose') return Math.random() > 0.5 ? 'wins' : 'loses';

      const match = token.match(/je(\d+)/);
      if (match) return pickRandomName(teamOneIds, allPlayers, excludeId);

      const matchO = token.match(/jo(\d+)/);
      if (matchO) return pickRandomName(teamTwoIds, allPlayers, excludeId);

      const matchA = token.match(/ja(\d+)/);
      if (matchA) return pickRandomPlayerName(allPlayers, excludeId);

      const numMatch = token.match(/(\d+)/);
      if (numMatch) return pickRandomPlayerName(allPlayers, excludeId);

      return pickRandomPlayerName(allPlayers, excludeId);
    });
  }
}

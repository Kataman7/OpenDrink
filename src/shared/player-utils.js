export const getOtherPlayerNames = (players, currentPlayerName) =>
  players
    .map(p => p.name)
    .filter(name => name !== currentPlayerName);

export const getPlayersExcluding = (players, excludeId) =>
  players.filter(p => p.id !== excludeId);

export const pickRandomFromIds = (playerIds, allPlayers, excludeId = null) => {
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
};

export const pickRandomPlayerName = (allPlayers, excludeId = null) => {
  const candidates = allPlayers.filter(p => p.id !== excludeId);
  if (candidates.length === 0) {
    return allPlayers[0] ? allPlayers[0].name : '';
  }
  return candidates[Math.floor(Math.random() * candidates.length)].name;
};

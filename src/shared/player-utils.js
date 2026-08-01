export const getOtherPlayerNames = (players, currentPlayerName) =>
  players.map(p => p.name).filter(name => name !== currentPlayerName);

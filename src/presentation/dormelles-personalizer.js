export class DormellesPersonalizer {
  personalize(sentence, currentPlayerName, allPlayers) {
    return sentence.replace(/\$\{([^}]+)\}/g, (_, token) => {
      if (token === 'toz') {
        return String(Math.floor(Math.random() * 4) + 2);
      }

      const match = token.match(/(\d+)/);
      if (!match) {
        return currentPlayerName;
      }

      const selectableNames = allPlayers
        .map(p => p.name)
        .filter(name => name !== currentPlayerName);

      if (selectableNames.length === 0) return currentPlayerName;

      const index = Math.floor(Math.random() * selectableNames.length);
      return selectableNames[index];
    });
  }
}

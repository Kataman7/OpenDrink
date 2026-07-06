export class PicoloPersonalizer {
  personalize(sentence, currentPlayer, allPlayers) {
    const excludeId = currentPlayer ? currentPlayer.id : null;
    const candidates = allPlayers.filter(p => p.id !== excludeId);
    const usedNames = new Set();
    const randomPlayer = () => {
      if (candidates.length === 0) return allPlayers[0] ? allPlayers[0].name : '';
      let pool = candidates.filter(p => !usedNames.has(p.name));
      if (pool.length === 0) pool = candidates;
      const p = pool[Math.floor(Math.random() * pool.length)];
      usedNames.add(p.name);
      return p.name;
    };

    return sentence
      .replace(/%s/g, randomPlayer)
      .replace(/\$/g, () => String(Math.floor(Math.random() * 5) + 1))
      .replace(/%t/g, () => (Math.random() > 0.5 ? '1' : '2'));
  }
}

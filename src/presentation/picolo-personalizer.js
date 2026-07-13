import { PICOL0_MIN, PICOL0_MAX } from '../config.js';
import { randomInt, randomBoolean } from '../shared/random.js';

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
      .replace(/\$(?!\d)/g, () => String(randomInt(PICOL0_MIN, PICOL0_MAX)))
      .replace(/%t/g, () => (randomBoolean() ? '1' : '2'));
  }
}

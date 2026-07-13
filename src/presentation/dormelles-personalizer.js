import { getOtherPlayerNames } from '../shared/player-utils.js';
import { TOZ_MIN, TOZ_MAX } from '../config.js';
import { randomInt } from '../shared/random.js';

export class DormellesPersonalizer {
  personalize(sentence, currentPlayerName, allPlayers) {
    const usedIndices = new Set();
    const selectableNames = getOtherPlayerNames(allPlayers, currentPlayerName);

    return sentence.replace(/\$\{([^}]+)\}/g, (_, token) => {
      if (token === 'toz') return String(randomInt(TOZ_MIN, TOZ_MAX));

      if (selectableNames.length === 0) return currentPlayerName;

      let pool = selectableNames.filter((_, i) => !usedIndices.has(i));
      if (pool.length === 0) {
        usedIndices.clear();
        pool = selectableNames;
      }

      const selectedName = pool[Math.floor(Math.random() * pool.length)];
      const originalIndex = selectableNames.indexOf(selectedName);
      usedIndices.add(originalIndex);
      return selectedName;
    });
  }
}

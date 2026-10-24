import { PlayerPicker } from '../shared/player-picker.js';
import { TOZ_MIN, TOZ_MAX } from '../config.js';
import { randomInt } from '../shared/random.js';

export class DormellesPersonalizer {
  personalize(sentence, currentPlayerName, allPlayers) {
    const current = allPlayers.find(p => p.name === currentPlayerName);
    const excludeId = current ? current.id : null;
    const picker = new PlayerPicker(allPlayers);

    // Clean Spanish stray $ {toz}
    const cleaned = sentence.replace(/\$\s*(?=\$\{toz\})/g, '');

    return cleaned.replace(/\$\{([^}]+)\}/g, (_, token) => {
      if (token === 'toz') return String(randomInt(TOZ_MIN, TOZ_MAX));
      const picked = picker.pick(excludeId) || currentPlayerName;
      if (token.startsWith('de')) {
        const isVowel = /^[aeiouyéèêëàâîïôûùh]/i.test(picked.trim());
        return isVowel ? `d'${picked}` : `de ${picked}`;
      }
      return picked;
    });
  }
}

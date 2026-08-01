import { PlayerPicker } from '../shared/player-picker.js';
import { TOZ_MIN, TOZ_MAX } from '../config.js';
import { randomInt } from '../shared/random.js';

export class DormellesPersonalizer {
  personalize(sentence, currentPlayerName, allPlayers) {
    const picker = new PlayerPicker(allPlayers);

    return sentence.replace(/\$\{([^}]+)\}/g, (_, token) => {
      if (token === 'toz') return String(randomInt(TOZ_MIN, TOZ_MAX));
      return picker.pick() || currentPlayerName;
    });
  }
}

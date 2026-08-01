import { PlayerPicker } from '../shared/player-picker.js';
import { PICOL0_MIN, PICOL0_MAX } from '../config.js';
import { randomInt, randomBoolean } from '../shared/random.js';

export class PicoloPersonalizer {
  personalize(sentence, currentPlayer, allPlayers) {
    const picker = new PlayerPicker(allPlayers);

    return sentence
      .replace(/%s/g, () => picker.pick() || allPlayers[0]?.name || '')
      .replace(/\$(?!\d)/g, () => String(randomInt(PICOL0_MIN, PICOL0_MAX)))
      .replace(/%t/g, () => (randomBoolean() ? '1' : '2'));
  }
}

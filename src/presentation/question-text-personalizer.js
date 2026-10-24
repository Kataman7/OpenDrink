import { randomInt } from '../shared/random.js';
import { PICOL0_MIN, PICOL0_MAX } from '../config.js';

export class QuestionTextPersonalizer {
  constructor(players) {
    this.players = players;
  }

  personalize(sentence, currentPlayerName) {
    const mappedSlots = new Map();

    let result = sentence;
    result = result.replace(/%s/g, () => {
      const slot = mappedSlots.size + 1;
      return this.selectPlayerName(slot, mappedSlots, currentPlayerName);
    });

    // Replace penalty dollar only when it is not part of currency
    result = result.replace(/(?<!(?:\d|R)\s*)\$(?![\d{]|\s*\d)/g, () =>
      String(randomInt(PICOL0_MIN, PICOL0_MAX))
    );

    result = result.replace(/\$\{([^}]+)\}/g, (_, token) => {
      const tokenSlot = this.extractTokenSlot(token, mappedSlots.size + 1);
      const selectedName = this.selectPlayerName(tokenSlot, mappedSlots, currentPlayerName);

      if (token.startsWith('de')) {
        const isVowel = /^[aeiouyéèêëàâîïôûùh]/i.test(selectedName.trim());
        return isVowel ? `d'${selectedName}` : `de ${selectedName}`;
      }
      if (token.startsWith('que')) {
        const isVowel = /^[aeiouyéèêëàâîïôûùh]/i.test(selectedName.trim());
        return isVowel ? `qu'${selectedName}` : `que ${selectedName}`;
      }
      return selectedName;
    });
    return result;
  }

  extractTokenSlot(token, fallbackSlot) {
    const match = token.match(/(\d+)/);
    if (!match) return fallbackSlot;
    return Number.parseInt(match[1], 10);
  }

  selectPlayerName(slot, mappedSlots, currentPlayerName) {
    const existing = mappedSlots.get(slot);
    if (existing) return existing.name;

    const usedIds = new Set(
      Array.from(mappedSlots.values())
        .map(p => p.id)
        .filter(id => id !== undefined)
    );
    const unassigned = this.players.filter(p => !usedIds.has(p.id));

    // Prefer other players if available to avoid active player self-targeting
    const otherUnassigned = currentPlayerName
      ? unassigned.filter(p => p.name !== currentPlayerName)
      : unassigned;

    let pool = otherUnassigned.length > 0 ? otherUnassigned : unassigned;
    if (pool.length === 0) {
      const otherPlayers = currentPlayerName
        ? this.players.filter(p => p.name !== currentPlayerName)
        : this.players;
      pool = otherPlayers.length > 0 ? otherPlayers : this.players;
    }
    if (pool.length === 0) return currentPlayerName || '';

    const picked = this.pickRandomItem(pool);
    mappedSlots.set(slot, picked);
    return picked.name;
  }

  pickRandomItem(items) {
    const index = Math.floor(Math.random() * items.length);
    return items[index];
  }
}

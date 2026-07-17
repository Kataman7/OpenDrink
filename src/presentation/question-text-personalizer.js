import { randomInt } from '../shared/random.js';
import { PICOL0_MIN, PICOL0_MAX } from '../config.js';

export class QuestionTextPersonalizer {
  constructor(players) {
    this.players = players;
  }

  personalize(sentence, currentPlayerName) {
    const replacedTokens = new Map();
    const mappedSlots = new Map();
    const selectableNames = this.buildSelectableNames(currentPlayerName);

    let result = sentence;
    result = result.replace(/%s/g, () => {
      const slot = mappedSlots.size + 1;
      const name = this.selectPlayerName(slot, mappedSlots, selectableNames, currentPlayerName);
      mappedSlots.set(slot, name);
      return name;
    });
    result = result.replace(/\$(?![\d{])/g, () => String(randomInt(PICOL0_MIN, PICOL0_MAX)));
    result = result.replace(/\$\{([^}]+)\}/g, (_, token) => {
      if (replacedTokens.has(token)) return replacedTokens.get(token);
      const tokenSlot = this.extractTokenSlot(token, mappedSlots.size + 1);
      const selectedName = this.selectPlayerName(
        tokenSlot,
        mappedSlots,
        selectableNames,
        currentPlayerName
      );
      mappedSlots.set(tokenSlot, selectedName);
      replacedTokens.set(token, selectedName);
      return selectedName;
    });
    return result;
  }

  buildSelectableNames(currentPlayerName) {
    return this.players
      .map(player => player.name)
      .filter(playerName => playerName !== currentPlayerName);
  }

  extractTokenSlot(token, fallbackSlot) {
    const match = token.match(/(\d+)/);
    if (!match) return fallbackSlot;
    return Number.parseInt(match[1], 10);
  }

  selectPlayerName(slot, mappedSlots, selectableNames, currentPlayerName) {
    const existingName = mappedSlots.get(slot);
    if (existingName) return existingName;
    const unassignedNames = this.findUnassignedNames(mappedSlots, selectableNames);
    const pool = unassignedNames.length > 0 ? unassignedNames : selectableNames;
    if (pool.length === 0) return currentPlayerName;
    return this.pickRandomItem(pool);
  }

  findUnassignedNames(mappedSlots, selectableNames) {
    const usedNames = new Set(mappedSlots.values());
    return selectableNames.filter(name => !usedNames.has(name));
  }

  pickRandomItem(items) {
    const index = Math.floor(Math.random() * items.length);
    return items[index];
  }
}

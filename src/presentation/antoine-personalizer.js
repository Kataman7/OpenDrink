import { PlayerPicker } from '../shared/player-picker.js';

export class AntoinePersonalizer {
  personalize(sentence, currentPlayer, allPlayers) {
    const picker = new PlayerPicker(allPlayers);
    const totalPlayers = allPlayers.length;

    const pickOther = () => picker.pick() || (currentPlayer ? currentPlayer.name : '');

    const replaceConditional = (_, scope, block) => {
      const [primary, fallback] = block.split('*');
      const normalizedScope = scope.toLowerCase();
      if (normalizedScope === '2players') return totalPlayers <= 2 ? primary : fallback || primary;
      if (normalizedScope === 'multi') return totalPlayers > 2 ? primary : fallback || primary;
      if (normalizedScope === 'couple') return primary;
      if (normalizedScope === 'timer' || normalizedScope === 'cash') return '';
      return '';
    };

    const replacePronoun = (_, _scope, alternatives) => {
      const parts = alternatives.split('*');
      return parts[0] || '';
    };

    let result = sentence;
    result = result.replace(/%P/g, () => (currentPlayer ? currentPlayer.name : ''));
    result = result.replace(/%([A-Za-z0-9]+)/g, pickOther);
    result = result.replace(
      /\{(?!2Players|Multi|Couple|Timer|timer|cash|Cash)([A-Za-z0-9]+)#([^}]*)\}/g,
      replacePronoun
    );
    result = result.replace(
      /\{(2Players|Multi|Couple|Timer|timer|cash|Cash)#([^}]*)\}/g,
      replaceConditional
    );
    result = result.replace(/\{Timer\}/gi, '');
    result = result.replace(/\{[^}]*\}/g, '');
    result = result.replace(/\s{2,}/g, ' ').trim();

    return result;
  }
}

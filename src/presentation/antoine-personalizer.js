import { PlayerPicker } from '../shared/player-picker.js';

export class AntoinePersonalizer {
  personalize(sentence, currentPlayer, allPlayers, timer = null) {
    const excludeId = currentPlayer ? currentPlayer.id : null;
    const otherPlayers = allPlayers.filter(p => p.id !== excludeId);
    const pool = otherPlayers.length > 0 ? otherPlayers : allPlayers;
    const picker = new PlayerPicker(pool);
    const totalPlayers = allPlayers.length;

    const pickOther = token => {
      const isGenitive =
        token &&
        token.endsWith('s') &&
        ['O', 'OX', 'OF', 'OH', 'OF2', 'OX2', 'OH2', 'P', 'Oh', 'Ox'].includes(token.slice(0, -1));
      const baseName =
        picker.pick(excludeId) ||
        (otherPlayers[0] ? otherPlayers[0].name : currentPlayer ? currentPlayer.name : '');
      return isGenitive ? `${baseName}s` : baseName;
    };

    const replaceConditional = (_, scope, block) => {
      const [primary, fallback] = block.split('*');
      const normalizedScope = scope.toLowerCase().replace(/\s+/g, '');
      if (normalizedScope === '2players') return totalPlayers <= 2 ? primary : fallback || primary;
      if (normalizedScope === 'multi') return totalPlayers > 2 ? primary : fallback || primary;
      if (normalizedScope === 'couple') return primary;
      if (normalizedScope === 'cash') return primary ? `${primary} €` : '';
      if (normalizedScope === 'timer') return timer ? `${timer}s` : '30s';
      return '';
    };

    const replacePronoun = (_, scope, alternatives) => {
      const normalizedScope = (scope || '').toLowerCase().replace(/\s+/g, '');
      if (normalizedScope === 'rud') {
        const parts = alternatives.split('*');
        const target = (parts[0] || '').trim();
        if (target === 'P') return currentPlayer ? currentPlayer.name : '';
        return pickOther('OX');
      }
      const parts = alternatives.split('*');
      return parts[0] || '';
    };

    let result = sentence;
    result = result.replace(/%Ps\b/g, () => (currentPlayer ? `${currentPlayer.name}s` : ''));
    result = result.replace(/%P\b/g, () => (currentPlayer ? currentPlayer.name : ''));
    result = result.replace(/%([A-Za-z0-9]+)/g, (_, token) => pickOther(token));
    result = result.replace(
      /\{(?!2\s*Players|Multi|Couple|Timer|timer|cash|Cash)([A-Za-z0-9]*)#([^}]*)\}/g,
      replacePronoun
    );
    result = result.replace(
      /\{(2\s*Players|Multi|Couple|Timer|timer|cash|Cash)#([^}]*)\}/g,
      replaceConditional
    );
    const timerFormatted = timer ? `${timer}s` : '30s';
    result = result.replace(/\{Timer\}/gi, timerFormatted);
    result = result.replace(/\{[^}]*\}/g, '');
    result = result.replace(/\s{2,}/g, ' ').trim();

    return result;
  }
}

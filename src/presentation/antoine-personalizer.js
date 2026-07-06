export class AntoinePersonalizer {
  personalize(sentence, currentPlayer, allPlayers) {
    const excludeId = currentPlayer ? currentPlayer.id : null;
    const otherPlayers = allPlayers.filter(p => p.id !== excludeId);
    const pickOther = () => {
      if (otherPlayers.length === 0) return currentPlayer ? currentPlayer.name : '';
      return otherPlayers[Math.floor(Math.random() * otherPlayers.length)].name;
    };
    const totalPlayers = allPlayers.length;

    const replaceConditional = (_, scope, block) => {
      const [ifTwo, ifMulti] = block.split('*');
      const sc = scope.toLowerCase();
      if (sc === '2players') return totalPlayers <= 2 ? ifTwo : ifMulti || ifTwo;
      if (sc === 'multi') return totalPlayers > 2 ? ifTwo : ifMulti || ifTwo;
      if (sc === 'couple') return ifTwo;
      if (sc === 'timer' || sc === 'cash') return '';
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

    return result;
  }
}

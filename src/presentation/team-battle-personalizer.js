import { PlayerPicker } from '../shared/player-picker.js';
import { randomBoolean } from '../shared/random.js';

export class TeamBattlePersonalizer {
  expandSentence(sentence, mode, i18n) {
    if (!mode || !i18n) return sentence;
    const templateKey = `teamBattleTemplates.${mode}`;
    const template = i18n.t(templateKey);
    if (!template || template === templateKey) return sentence;

    let cleanSentence = sentence.trim();
    if (mode === 'challenge' && cleanSentence.startsWith('de ')) {
      cleanSentence = cleanSentence.slice(3).trim();
    } else if (mode === 'challenge' && cleanSentence.startsWith("d'")) {
      cleanSentence = cleanSentence.slice(2).trim();
    }
    return template.replace('{sentence}', cleanSentence);
  }

  personalize(sentence, { mode = null, currentPlayer, allPlayers, teamOneIds, teamTwoIds, i18n }) {
    const expandedSentence = this.expandSentence(sentence, mode, i18n);
    const excludeId = currentPlayer ? currentPlayer.id : null;
    const jePicker = new PlayerPicker(allPlayers);
    const joPicker = new PlayerPicker(allPlayers);
    const jaPicker = new PlayerPicker(allPlayers);
    const allIds = allPlayers.map(p => p.id);
    const t = key => (i18n ? i18n.t(key) : key);

    return expandedSentence.replace(/\$\{([^}]+)\}/g, (_, token) => {
      const normalizedToken = token.replace(/_loose$/, '_lose');
      if (normalizedToken === 'make_team_win') return t('teamBattle.yourTeamWins');
      if (normalizedToken === 'make_team_win_or_lose')
        return randomBoolean() ? t('teamBattle.wins') : t('teamBattle.loses');
      if (normalizedToken === 'ot_or_you_lose')
        return randomBoolean() ? t('teamBattle.theOtherTeamLoses') : t('teamBattle.youLose');
      if (normalizedToken === 'win_or_lose')
        return randomBoolean() ? t('teamBattle.wins') : t('teamBattle.loses');
      if (/^je\d+/.test(token)) return jePicker.pickFrom(teamOneIds, excludeId) || '';
      if (/^jo\d+/.test(token)) return joPicker.pickFrom(teamTwoIds, excludeId) || '';
      if (/^ja\d+/.test(token)) return jaPicker.pickFrom(allIds, excludeId) || '';
      return jaPicker.pickFrom(allIds, excludeId) || '';
    });
  }
}

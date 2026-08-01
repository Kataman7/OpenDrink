import { PlayerPicker } from '../shared/player-picker.js';
import { randomBoolean } from '../shared/random.js';

export class TeamBattlePersonalizer {
  personalize(sentence, { currentPlayer, allPlayers, teamOneIds, teamTwoIds, i18n }) {
    const excludeId = currentPlayer ? currentPlayer.id : null;
    const jePicker = new PlayerPicker(allPlayers);
    const joPicker = new PlayerPicker(allPlayers);
    const jaPicker = new PlayerPicker(allPlayers);
    const allIds = allPlayers.map(p => p.id);
    const t = key => (i18n ? i18n.t(key) : key);

    return sentence.replace(/\$\{([^}]+)\}/g, (_, token) => {
      if (token === 'make_team_win') return t('teamBattle.yourTeamWins');
      if (token === 'make_team_win_or_lose')
        return randomBoolean() ? t('teamBattle.wins') : t('teamBattle.loses');
      if (token === 'ot_or_you_lose')
        return randomBoolean() ? t('teamBattle.theOtherTeamLoses') : t('teamBattle.youLose');
      if (token === 'win_or_lose')
        return randomBoolean() ? t('teamBattle.wins') : t('teamBattle.loses');
      if (/^je\d+/.test(token)) return jePicker.pickFrom(teamOneIds, excludeId) || '';
      if (/^jo\d+/.test(token)) return joPicker.pickFrom(teamTwoIds, excludeId) || '';
      if (/^ja\d+/.test(token)) return jaPicker.pickFrom(allIds, excludeId) || '';
      return jaPicker.pickFrom(allIds, excludeId) || '';
    });
  }
}

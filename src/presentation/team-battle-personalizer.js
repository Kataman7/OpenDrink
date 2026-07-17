import { randomBoolean } from '../shared/random.js';

function pickRandomName(playerIds, allPlayers, excludeId = null, usedIds = []) {
  const candidates = playerIds.filter(id => id !== excludeId && !usedIds.includes(id));
  if (candidates.length === 0) return '';
  const id = candidates[Math.floor(Math.random() * candidates.length)];
  usedIds.push(id);
  const p = allPlayers.find(pl => pl.id === id);
  return p ? p.name : '';
}

export class TeamBattlePersonalizer {
  personalize(sentence, { currentPlayer, allPlayers, teamOneIds, teamTwoIds, i18n }) {
    const excludeId = currentPlayer ? currentPlayer.id : null;
    const t = key => (i18n ? i18n.t(key) : key);
    const used = { teamOne: [], teamTwo: [], any: [] };
    const allIds = allPlayers.map(p => p.id);

    return sentence.replace(/\$\{([^}]+)\}/g, (_, token) => {
      if (token === 'make_team_win') return t('teamBattle.yourTeamWins');
      if (token === 'make_team_win_or_lose')
        return randomBoolean() ? t('teamBattle.wins') : t('teamBattle.loses');
      if (token === 'ot_or_you_lose')
        return randomBoolean() ? t('teamBattle.theOtherTeamLoses') : t('teamBattle.youLose');
      if (token === 'win_or_lose')
        return randomBoolean() ? t('teamBattle.wins') : t('teamBattle.loses');

      if (/^je\d+/.test(token))
        return pickRandomName(teamOneIds, allPlayers, excludeId, used.teamOne);
      if (/^jo\d+/.test(token))
        return pickRandomName(teamTwoIds, allPlayers, excludeId, used.teamTwo);
      if (/^ja\d+/.test(token)) return pickRandomName(allIds, allPlayers, excludeId, used.any);

      return pickRandomName(allIds, allPlayers, excludeId, used.any);
    });
  }
}

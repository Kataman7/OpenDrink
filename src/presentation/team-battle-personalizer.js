import { pickRandomFromArray, randomInt, randomBoolean } from '../shared/random.js';

function pickRandomName(playerIds, allPlayers, excludeId = null) {
  const candidates = playerIds.filter(id => id !== excludeId);
  if (candidates.length === 0) {
    const fallback = playerIds[0];
    if (!fallback) return '';
    const p = allPlayers.find(pl => pl.id === fallback);
    return p ? p.name : '';
  }
  const id = candidates[Math.floor(Math.random() * candidates.length)];
  const p = allPlayers.find(pl => pl.id === id);
  return p ? p.name : '';
}

function pickRandomPlayerName(allPlayers, excludeId = null) {
  const candidates = allPlayers.filter(p => p.id !== excludeId);
  if (candidates.length === 0) {
    return allPlayers[0] ? allPlayers[0].name : '';
  }
  return pickRandomFromArray(candidates).name;
}

export class TeamBattlePersonalizer {
  personalize(sentence, { currentPlayer, allPlayers, teamOneIds, teamTwoIds, i18n }) {
    const excludeId = currentPlayer ? currentPlayer.id : null;
    const t = key => (i18n ? i18n.t(key) : key);

    return sentence.replace(/\$\{([^}]+)\}/g, (_, token) => {
      if (token === 'make_team_win') return t('teamBattle.yourTeamWins');
      if (token === 'make_team_win_or_lose')
        return randomBoolean() ? t('teamBattle.wins') : t('teamBattle.loses');
      if (token === 'ot_or_you_lose')
        return randomBoolean() ? t('teamBattle.theOtherTeamLoses') : t('teamBattle.youLose');
      if (token === 'win_or_lose')
        return randomBoolean() ? t('teamBattle.wins') : t('teamBattle.loses');

      if (/^je\d+/.test(token)) return pickRandomName(teamOneIds, allPlayers, excludeId);
      if (/^jo\d+/.test(token)) return pickRandomName(teamTwoIds, allPlayers, excludeId);
      if (/^ja\d+/.test(token)) return pickRandomPlayerName(allPlayers, excludeId);

      return pickRandomPlayerName(allPlayers, excludeId);
    });
  }
}

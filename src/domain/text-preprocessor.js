const TTS_PREFIX_KEYS = {
  would_you_rather: 'round.ttsPrefixWouldYouRather',
  never_have_i_ever: 'round.ttsPrefixNeverHaveIEver',
  who_could: 'round.ttsPrefixWhoCould',
  seven_seconds: 'round.ttsPrefixSevenSeconds',
  its_a_10: 'round.ttsPrefixItsA10',
  quiz: 'round.ttsPrefixQuiz',
  team_battle: 'round.ttsPrefixTeamBattle',
  dormelles: 'round.ttsPrefixDormelles',
  picolo: 'round.ttsPrefixPicolo',
  truth_dare: 'round.ttsPrefixTruthDare',
};

const TTS_REPLACE_KEYS = ['round.ttsReplaceAnd', 'round.ttsReplaceOr'];

export function preprocessForTts(text, gameMode, i18n) {
  if (!text) return '';
  if (!i18n) return text.trim();

  let result = text;
  const [andReplace, orReplace] = TTS_REPLACE_KEYS.map(key => i18n.t(key));
  result = result.replace(/&/g, andReplace);
  result = result.replace(/\//g, orReplace);
  result = result.replace(/\./g, '');
  result = result.replace(/\s+/g, ' ').trim();

  const prefixKey = TTS_PREFIX_KEYS[gameMode];
  if (prefixKey) {
    const prefix = i18n.t(prefixKey);
    if (prefix && prefix !== prefixKey) {
      result = prefix + result;
    }
  }

  return result.trim();
}

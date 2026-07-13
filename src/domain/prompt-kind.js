export class PromptKind {
  static WOULD_YOU_RATHER = 'would_you_rather';
  static QUIZ = 'quiz';
  static DORMELLES = 'dormelles';
  static PICOLO = 'picolo';
  static TRUTH_DARE = 'truth_dare';
  static TEAM_BATTLE = 'team_battle';
  static SEVEN_SECONDS = 'seven_seconds';
  static IMPOSTOR = 'impostor';
  static TRUTH = 'truth';
  static DARE = 'dare';
  static WHO_COULD = 'who_could';
}

export const isModeOnlyLabel = promptKind =>
  promptKind === PromptKind.WOULD_YOU_RATHER ||
  promptKind === PromptKind.WHO_COULD ||
  promptKind === PromptKind.IMPOSTOR ||
  promptKind === PromptKind.QUIZ ||
  promptKind === PromptKind.DORMELLES ||
  (promptKind && promptKind.startsWith('team_battle_')) ||
  (promptKind && promptKind.startsWith('picolo_')) ||
  (promptKind && promptKind.startsWith('truth_dare_'));

export const GAME_KEY_MAP = {
  never_have_i_ever: ['jnj'],
  action_truth: ['tod', 'dare_chooser'],
  who_could: ['qpr'],
  seven_seconds: ['7seconds'],
  its_a_10: ['a_10'],
  impostor: ['imposter_words'],
  would_you_rather: ['tpf_questions'],
  quiz: ['quiz_questions'],
  team_battle: ['team_battle_questions'],
  dormelles: ['dormelles_questions'],
  picolo: ['picolo_rules'],
  truth_dare: ['antoine_dares'],
};

export const PROMPT_KIND_MAP = {
  tod: PromptKind.TRUTH,
  dare_chooser: PromptKind.DARE,
  qpr: PromptKind.WHO_COULD,
};

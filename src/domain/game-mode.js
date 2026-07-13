import { GAME_KEY_MAP } from './prompt-kind.js';
import { UnsupportedGameModeError } from './errors.js';

export class GameMode {
  static NEVER_HAVE_I_EVER = 'never_have_i_ever';
  static ACTION_TRUTH = 'action_truth';
  static WOULD_YOU_RATHER = 'would_you_rather';
  static WHO_COULD = 'who_could';
  static IMPOSTOR = 'impostor';
  static SEVEN_SECONDS = 'seven_seconds';
  static ITS_A_10 = 'its_a_10';
  static QUIZ = 'quiz';
  static TEAM_BATTLE = 'team_battle';
  static DORMELLES = 'dormelles';
  static PICOLO = 'picolo';
  static TRUTH_DARE = 'truth_dare';
  static RANDOM = 'random';

  static getCandidateGameKeys(gameMode) {
    const keys = GAME_KEY_MAP[gameMode];
    if (!keys) throw new UnsupportedGameModeError(gameMode);
    return keys;
  }

  static needsIntensity(gameMode) {
    if (gameMode === GameMode.RANDOM) return true;
    return (
      gameMode !== GameMode.IMPOSTOR &&
      gameMode !== GameMode.PICOLO &&
      gameMode !== GameMode.TRUTH_DARE
    );
  }
}

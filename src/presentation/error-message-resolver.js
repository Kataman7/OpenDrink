const ERROR_I18N_KEYS = {
  PlayerNameEmptyError: 'errors.emptyPlayerName',
  NoPlayersError: 'errors.noPlayers',
  NoQuestionsAvailableError: 'errors.noQuestions',
  DatabaseInitError: 'errors.dbInit',
};

export class ErrorMessageResolver {
  constructor(i18n) {
    this.i18n = i18n;
  }

  resolve(error) {
    const key = this.findI18nKey(error);
    return this.i18n.t(key);
  }

  findI18nKey(error) {
    if (!error || !error.name) return 'errors.noQuestions';
    return ERROR_I18N_KEYS[error.name] || 'errors.noQuestions';
  }
}

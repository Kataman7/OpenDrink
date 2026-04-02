const SCREEN_PREFIX = 'screen-';
const HIDDEN_CLASS = 'hidden';

export class GameView {
  constructor({ i18n }) {
    this.i18n = i18n;
  }

  renderLanguageSelector({ languages, selectedLang }) {
    const select = this.getElement('lang-select');
    select.innerHTML = languages
      .map((language) => this.renderLanguageOption(language, selectedLang))
      .join('');
  }

  renderPlayerList(players) {
    const list = this.getElement('player-list');
    const count = this.getElement('player-count');
    list.innerHTML = players.map((player) => this.renderPlayerTag(player)).join('');
    count.textContent = this.buildPlayerCountLabel(players.length);
  }

  renderScreen(screenName) {
    this.hideAllScreens();
    this.showScreen(screenName);
  }

  renderRound({ player, label, sentence, choiceA, choiceB }) {
    this.getElement('player-name').textContent = player.name;
    this.getElement('question-type').textContent = label;
    if (choiceA && choiceB) return this.renderWouldYouRather(choiceA, choiceB);
    return this.renderSentence(sentence);
  }

  renderImpostorAccusationList(players) {
    const container = this.getElement('impostor-candidates');
    container.innerHTML = players.map((player) => this.renderImpostorCandidateButton(player)).join('');
  }

  renderImpostorPassStep({ playerName, hint }) {
    this.getElement('impostor-step-title').textContent = this.i18n.t('impostor.passPhoneTo', { name: playerName });
    this.getElement('impostor-step-hint').textContent = hint;
    this.getElement('impostor-word').textContent = '';
    this.getElement('impostor-word').classList.add(HIDDEN_CLASS);
    this.getElement('impostor-result').textContent = '';
    this.getElement('impostor-accusation').classList.add(HIDDEN_CLASS);
    this.getElement('btn-impostor-reveal').classList.remove(HIDDEN_CLASS);
    this.getElement('btn-impostor-next').classList.add(HIDDEN_CLASS);
    this.getElement('btn-impostor-finish').classList.add(HIDDEN_CLASS);
  }

  renderImpostorRevealedWord({ word, hasNextPlayer }) {
    this.getElement('impostor-step-hint').textContent = this.i18n.t('impostor.wordLabel');
    this.getElement('impostor-word').textContent = word;
    this.getElement('impostor-word').classList.remove(HIDDEN_CLASS);
    this.getElement('btn-impostor-reveal').classList.add(HIDDEN_CLASS);
    this.getElement('btn-impostor-next').classList.toggle(HIDDEN_CLASS, !hasNextPlayer);
    this.getElement('btn-impostor-finish').classList.toggle(HIDDEN_CLASS, hasNextPlayer);
  }

  renderImpostorDiscussionState() {
    this.getElement('impostor-step-title').textContent = this.i18n.t('impostor.discussionTitle');
    this.getElement('impostor-step-hint').textContent = this.i18n.t('impostor.discussionHint');
    this.getElement('impostor-word').classList.add(HIDDEN_CLASS);
    this.getElement('impostor-accusation').classList.remove(HIDDEN_CLASS);
    this.getElement('btn-impostor-reveal').classList.add(HIDDEN_CLASS);
    this.getElement('btn-impostor-next').classList.add(HIDDEN_CLASS);
    this.getElement('btn-impostor-finish').classList.add(HIDDEN_CLASS);
  }

  renderImpostorAccusationResult(message) {
    this.getElement('impostor-result').textContent = message;
  }

  renderSentence(sentence) {
    this.getElement('question-text').textContent = sentence;
    this.getElement('question-text').classList.remove(HIDDEN_CLASS);
    this.getElement('wyr-choices').classList.add(HIDDEN_CLASS);
  }

  renderWouldYouRather(choiceA, choiceB) {
    this.getElement('wyr-choice-a').textContent = choiceA;
    this.getElement('wyr-choice-b').textContent = choiceB;
    this.getElement('question-text').classList.add(HIDDEN_CLASS);
    this.getElement('wyr-choices').classList.remove(HIDDEN_CLASS);
  }

  showError(message) {
    const toast = this.getElement('error-toast');
    toast.textContent = message;
    toast.classList.remove(HIDDEN_CLASS);
  }

  hideError() {
    this.getElement('error-toast').classList.add(HIDDEN_CLASS);
  }

  clearPlayerInput() {
    this.getElement('player-name-input').value = '';
  }

  readPlayerInput() {
    return this.getElement('player-name-input').value.trim();
  }

  readSelectedLanguage() {
    return this.getElement('lang-select').value;
  }

  applyStaticTranslations(selectedLang) {
    document.documentElement.lang = selectedLang;
    this.translateNodesWithText();
    this.translatePlaceholderNodes();
  }

  findActionTarget(target) {
    if (!(target instanceof HTMLElement)) return null;
    return target.closest('[data-action]');
  }

  getElement(id) {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Missing element #${id}`);
    return element;
  }

  renderLanguageOption(language, selectedLang) {
    const selectedAttribute = language.code === selectedLang ? 'selected' : '';
    return `<option value="${language.code}" ${selectedAttribute}>${language.label}</option>`;
  }

  renderPlayerTag(player) {
    const removeLabel = this.i18n.t('lobby.removePlayer', { name: player.name });
    return `
      <li class="player-tag" data-player-id="${player.id}">
        <span>${player.name}</span>
        <button class="btn-remove-player" data-action="remove-player" data-player-id="${player.id}" aria-label="${removeLabel}">×</button>
      </li>
    `;
  }

  renderImpostorCandidateButton(player) {
    return `
      <button class="btn btn-large btn-mode" data-action="impostor-accuse" data-player-id="${player.id}">
        ${player.name}
      </button>
    `;
  }

  buildPlayerCountLabel(count) {
    const key = count === 1 ? 'lobby.playerCountOne' : 'lobby.playerCountOther';
    return this.i18n.t(key, { count });
  }

  hideAllScreens() {
    document.querySelectorAll('.screen').forEach((screen) => {
      screen.classList.add(HIDDEN_CLASS);
    });
  }

  showScreen(screenName) {
    this.getElement(`${SCREEN_PREFIX}${screenName}`).classList.remove(HIDDEN_CLASS);
  }

  translateNodesWithText() {
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.getAttribute('data-i18n');
      if (!key) return;
      element.textContent = this.i18n.t(key);
    });
  }

  translatePlaceholderNodes() {
    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
      const key = element.getAttribute('data-i18n-placeholder');
      if (!key) return;
      element.setAttribute('placeholder', this.i18n.t(key));
    });
  }
}

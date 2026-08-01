export class CardGameView {
  constructor(view) {
    this.view = view;
  }

  renderList(games, lang) {
    const container = this.view.getElement('card-games-list');
    container.innerHTML = games
      .map(
        game => `
      <button class="btn btn-large btn-card-game" data-action="select-card-game" data-game="${game.id}">
        <span class="btn-mode-icon">${game.icon}</span>
        <div>
          <div class="card-game-title">${game.title}</div>
          <div class="card-game-desc">${game.description[lang] || game.description.en}</div>
        </div>
      </button>
    `
      )
      .join('');
  }

  renderDetail(title, rulesText) {
    this.view.getElement('card-game-title').textContent = title;
    this.view.getElement('card-game-rules').innerHTML = rulesText
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }
}

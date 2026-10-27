import { BONUS_GAMES } from './bonus-games.js';

export class BonusGameView {
  constructor({ view, i18n }) {
    this.view = view;
    this.i18n = i18n;
  }

  renderList(lang) {
    const container = this.view.getElement('bonus-games-list');
    if (!container) return;

    container.innerHTML = BONUS_GAMES.map(game => {
      const title = game.title[lang] || game.title.en;
      const desc = game.description[lang] || game.description.en;
      return `
        <button class="btn btn-large btn-mode btn-bonus-game" data-action="select-bonus-game" data-bonus="${game.id}">
          <span class="btn-mode-icon">${game.icon}</span>
          <div class="bonus-game-info">
            <div class="bonus-game-title">${title}</div>
            <div class="bonus-game-desc">${desc}</div>
          </div>
        </button>
      `;
    }).join('');
  }

  renderBombPlay({ activePlayer, question, isExploded, loser }) {
    const card = this.view.getElement('bonus-play-card');
    const actions = this.view.getElement('bonus-play-actions');
    if (!card || !actions) return;

    if (!isExploded) {
      card.innerHTML = `
        <div class="bonus-badge">💣 ${this.i18n.t('bonusGames.bomb')}</div>
        <p class="game-player">${this.i18n.t('bonusGames.turnOf', { name: activePlayer.name })}</p>
        <p class="game-type">${this.i18n.t('bonusGames.bombPrompt')}</p>
        <p class="game-text">${question}</p>
        <div class="bomb-visual bomb-ticking">💣</div>
      `;
      actions.innerHTML = `
        <button class="btn btn-large btn-accent" data-action="bonus-bomb-pass">
          ${this.i18n.t('bonusGames.bombPass')}
        </button>
      `;
    } else {
      card.innerHTML = `
        <div class="bonus-badge">💥 ${this.i18n.t('bonusGames.bombExplodedTitle')}</div>
        <div class="bomb-visual bomb-exploded">💥</div>
        <p class="game-player" style="color: #ff7675;">${loser ? loser.name : ''}</p>
        <p class="game-text">${this.i18n.t('bonusGames.bombExplodedText', { name: loser ? loser.name : '' })}</p>
        <p class="subtitle" style="font-weight: 700; color: #fd79a8; font-size: 1.2rem;">
          ${this.i18n.t('bonusGames.bombExplodedPenalty')}
        </p>
      `;
      actions.innerHTML = `
        <button class="btn btn-large btn-primary" data-action="bonus-bomb-restart">
          ${this.i18n.t('bonusGames.nextRound')}
        </button>
      `;
    }
  }

  renderCourtPlay({ accused, charge, guiltyVotes, innocentVotes, isVerdict, verdictResult }) {
    const card = this.view.getElement('bonus-play-card');
    const actions = this.view.getElement('bonus-play-actions');
    if (!card || !actions) return;

    if (!isVerdict) {
      card.innerHTML = `
        <div class="bonus-badge">⚖️ ${this.i18n.t('bonusGames.court')}</div>
        <p class="game-player">${this.i18n.t('bonusGames.accusedTitle', { name: accused.name })}</p>
        <p class="game-type">${this.i18n.t('bonusGames.chargeTitle')}</p>
        <p class="game-text">${charge}</p>
        <div class="court-vote-counter">
          <span class="vote-tag guilty-tag">⚖️ ${this.i18n.t('bonusGames.guilty')} : <strong>${guiltyVotes}</strong></span>
          <span class="vote-tag innocent-tag">🕊️ ${this.i18n.t('bonusGames.innocent')} : <strong>${innocentVotes}</strong></span>
        </div>
      `;
      actions.innerHTML = `
        <div class="mode-buttons-row">
          <button class="btn btn-large btn-danger" data-action="bonus-court-guilty">
            ⚖️ ${this.i18n.t('bonusGames.guilty')} (+1)
          </button>
          <button class="btn btn-large btn-secondary" data-action="bonus-court-innocent">
            🕊️ ${this.i18n.t('bonusGames.innocent')} (+1)
          </button>
        </div>
        <button class="btn btn-large btn-accent" data-action="bonus-court-verdict">
          ${this.i18n.t('bonusGames.renderVerdict')}
        </button>
      `;
    } else {
      const isGuilty = verdictResult.isGuilty;
      const title = isGuilty
        ? this.i18n.t('bonusGames.verdictGuiltyTitle')
        : this.i18n.t('bonusGames.verdictAcquittedTitle');
      const text = isGuilty
        ? this.i18n.t('bonusGames.verdictGuiltyText', {
            name: verdictResult.accused.name,
            votes: verdictResult.guiltyVotes,
            drinks: verdictResult.drinks,
          })
        : this.i18n.t('bonusGames.verdictAcquittedText', {
            name: verdictResult.accused.name,
          });

      card.innerHTML = `
        <div class="bonus-badge">⚖️ ${title}</div>
        <p class="game-player" style="color: ${isGuilty ? '#ff7675' : '#55efc4'};">${title}</p>
        <p class="game-text">${text}</p>
      `;
      actions.innerHTML = `
        <button class="btn btn-large btn-primary" data-action="bonus-court-next">
          ${this.i18n.t('bonusGames.nextRound')}
        </button>
      `;
    }
  }

  renderBarometerPlay({ situation, currentRatingPlayer, isFinished, result }) {
    const card = this.view.getElement('bonus-play-card');
    const actions = this.view.getElement('bonus-play-actions');
    if (!card || !actions) return;

    if (!isFinished) {
      card.innerHTML = `
        <div class="bonus-badge">⭐ ${this.i18n.t('bonusGames.barometer')}</div>
        <p class="game-type">${this.i18n.t('bonusGames.barometerTitle')}</p>
        <p class="game-text">${situation}</p>
        <hr class="bonus-divider" />
        <p class="game-player" style="font-size: 1.4rem;">
          ${this.i18n.t('bonusGames.turnOf', { name: currentRatingPlayer.name })}
        </p>
        <p class="subtitle">${this.i18n.t('bonusGames.barometerRateFor')}</p>
        <div class="barometer-control">
          <input type="range" id="barometer-slider" min="0" max="10" value="5" class="barometer-slider" />
          <div id="barometer-val-display" class="barometer-val-display">5 / 10</div>
        </div>
      `;
      actions.innerHTML = `
        <button class="btn btn-large btn-accent" data-action="bonus-barometer-submit">
          ${this.i18n.t('bonusGames.barometerSubmit')}
        </button>
      `;

      if (typeof document !== 'undefined') {
        const slider = document.getElementById('barometer-slider');
        const display = document.getElementById('barometer-val-display');
        if (slider && display) {
          slider.addEventListener('input', () => {
            display.textContent = `${slider.value} / 10`;
          });
        }
      }
    } else {
      const breakdown = result.ratings
        .map(
          r => `<span class="rating-chip">${r.player.name} : <strong>${r.rating}/10</strong></span>`
        )
        .join('');

      card.innerHTML = `
        <div class="bonus-badge">⭐ ${this.i18n.t('bonusGames.barometer')} - RÉSULTATS</div>
        <p class="game-player" style="color: #fdcb6e;">${this.i18n.t('bonusGames.barometerAvg', { avg: result.average })}</p>
        <p class="game-text">
          ${this.i18n.t('bonusGames.barometerExtreme', {
            name: result.extremePlayer.name,
            rating: result.extremeRating,
            drinks: result.drinks,
          })}
        </p>
        <div class="ratings-breakdown">${breakdown}</div>
      `;
      actions.innerHTML = `
        <button class="btn btn-large btn-primary" data-action="bonus-barometer-next">
          ${this.i18n.t('bonusGames.nextRound')}
        </button>
      `;
    }
  }

  renderConsensusPlay({ choiceA, choiceB, currentVoter, isFinished, result }) {
    const card = this.view.getElement('bonus-play-card');
    const actions = this.view.getElement('bonus-play-actions');
    if (!card || !actions) return;

    if (!isFinished) {
      card.innerHTML = `
        <div class="bonus-badge">🔀 ${this.i18n.t('bonusGames.consensus')}</div>
        <p class="game-player">${this.i18n.t('bonusGames.turnOf', { name: currentVoter.name })}</p>
        <p class="subtitle">${this.i18n.t('bonusGames.consensusChoice')}</p>
        <p class="game-type">${this.i18n.t('bonusGames.consensusTitle')}</p>
      `;
      actions.innerHTML = `
        <button class="btn btn-large btn-consensus btn-consensus-a" data-action="bonus-consensus-vote" data-choice="A">
          <span class="consensus-letter">A</span>
          <span class="consensus-text">${choiceA}</span>
        </button>
        <button class="btn btn-large btn-consensus btn-consensus-b" data-action="bonus-consensus-vote" data-choice="B">
          <span class="consensus-letter">B</span>
          <span class="consensus-text">${choiceB}</span>
        </button>
      `;
    } else {
      let outcomeText = '';
      if (result.isTie) {
        outcomeText = this.i18n.t('bonusGames.consensusTie', {
          countA: result.countA,
          countB: result.countB,
        });
      } else {
        const loserNames = result.losers.map(p => p.name).join(', ');
        const minorityChoiceText = result.minorityChoice === 'A' ? result.choiceA : result.choiceB;
        outcomeText = `${this.i18n.t('bonusGames.consensusMinority', { choice: `Option ${result.minorityChoice}` })}<br><strong>${loserNames}</strong> ("${minorityChoiceText}")`;
      }

      card.innerHTML = `
        <div class="bonus-badge">🔀 ${this.i18n.t('bonusGames.consensus')} - RÉSULTATS</div>
        <div class="consensus-scores">
          <div class="consensus-score-box">
            <span class="consensus-score-count">${result.countA}</span>
            <span class="consensus-score-label">Option A</span>
          </div>
          <div class="consensus-score-vs">VS</div>
          <div class="consensus-score-box">
            <span class="consensus-score-count">${result.countB}</span>
            <span class="consensus-score-label">Option B</span>
          </div>
        </div>
        <p class="game-text" style="margin-top: 15px;">${outcomeText}</p>
      `;
      actions.innerHTML = `
        <button class="btn btn-large btn-primary" data-action="bonus-consensus-next">
          ${this.i18n.t('bonusGames.nextRound')}
        </button>
      `;
    }
  }

  renderConfessionalPlay({ prompt, currentVoter, isFinished, result }) {
    const card = this.view.getElement('bonus-play-card');
    const actions = this.view.getElement('bonus-play-actions');
    if (!card || !actions) return;

    if (!isFinished) {
      card.innerHTML = `
        <div class="bonus-badge">🕵️ ${this.i18n.t('bonusGames.confessional')}</div>
        <p class="game-player">${this.i18n.t('bonusGames.turnOf', { name: currentVoter.name })}</p>
        <p class="subtitle">${this.i18n.t('bonusGames.confessionalSecretPrompt')}</p>
        <p class="game-text">${prompt}</p>
      `;
      actions.innerHTML = `
        <div class="mode-buttons-row">
          <button class="btn btn-large btn-accent" data-action="bonus-confessional-vote" data-done="true">
            ${this.i18n.t('bonusGames.confessionalDone')}
          </button>
          <button class="btn btn-large btn-secondary" data-action="bonus-confessional-vote" data-done="false">
            ${this.i18n.t('bonusGames.confessionalNever')}
          </button>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="bonus-badge">🕵️ ${this.i18n.t('bonusGames.confessionalResultTitle')}</div>
        <p class="game-player" style="color: #fd79a8; font-size: 2.2rem;">
          ${this.i18n.t('bonusGames.confessionalResultText', {
            count: result.doneCount,
            total: result.totalPlayers,
          })}
        </p>
        <p class="game-text" style="font-size: 1.1rem; color: var(--color-text-muted);">
          "${result.prompt}"
        </p>
        <p class="subtitle" style="font-weight: 700; color: #fdcb6e; margin-top: 10px;">
          ${this.i18n.t('bonusGames.confessionalDebate')}
        </p>
      `;
      actions.innerHTML = `
        <button class="btn btn-large btn-primary" data-action="bonus-confessional-next">
          ${this.i18n.t('bonusGames.nextRound')}
        </button>
      `;
    }
  }

  renderSurvivalPlay({ currentPlayer, challenge, lives, players, isFinished, winner }) {
    const card = this.view.getElement('bonus-play-card');
    const actions = this.view.getElement('bonus-play-actions');
    if (!card || !actions) return;

    const hpBar = players
      .map(p => {
        const hp = lives[p.id] || 0;
        const hearts = hp > 0 ? '❤️'.repeat(hp) : '💀';
        const isCurrent = currentPlayer && p.id === currentPlayer.id;
        return `
          <div class="survival-hp-pill ${isCurrent ? 'survival-current-pill' : ''} ${hp === 0 ? 'survival-dead-pill' : ''}">
            <span class="survival-hp-name">${p.name}</span>
            <span class="survival-hp-hearts">${hearts}</span>
          </div>
        `;
      })
      .join('');

    if (!isFinished) {
      const qText =
        challenge.question.sentence ||
        (challenge.question.choiceA
          ? `${challenge.question.choiceA} OU ${challenge.question.choiceB}`
          : '');

      card.innerHTML = `
        <div class="bonus-badge">🏆 ${this.i18n.t('bonusGames.survivalTitle')}</div>
        <div class="survival-hp-bar">${hpBar}</div>
        <p class="game-player">${this.i18n.t('bonusGames.survivalChallenge', { name: currentPlayer.name })}</p>
        <p class="game-text">${qText}</p>
      `;
      actions.innerHTML = `
        <div class="mode-buttons-row">
          <button class="btn btn-large btn-primary" data-action="bonus-survival-result" data-success="true">
            ${this.i18n.t('bonusGames.survivalSuccess')}
          </button>
          <button class="btn btn-large btn-danger" data-action="bonus-survival-result" data-success="false">
            ${this.i18n.t('bonusGames.survivalFail')}
          </button>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="bonus-badge">👑 ${this.i18n.t('bonusGames.survivalWinnerTitle')}</div>
        <div class="survival-hp-bar">${hpBar}</div>
        <p class="game-player" style="color: #fdcb6e; font-size: 2.2rem;">${winner ? winner.name : ''}</p>
        <p class="game-text">${this.i18n.t('bonusGames.survivalWinnerText', { name: winner ? winner.name : '' })}</p>
      `;
      actions.innerHTML = `
        <button class="btn btn-large btn-accent" data-action="bonus-survival-restart">
          ${this.i18n.t('bonusGames.nextRound')}
        </button>
      `;
    }
  }
}

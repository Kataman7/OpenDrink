import { describe, it, expect, beforeEach } from 'vitest';
import { BonusGameView } from './bonus-game-view.js';
import { BONUS_GAMES } from './bonus-games.js';

describe('BonusGameView', () => {
  let elements;
  let viewMock;
  let i18nMock;
  let bonusGameView;

  beforeEach(() => {
    elements = {
      'bonus-games-list': { innerHTML: '' },
      'bonus-play-card': { innerHTML: '' },
      'bonus-play-actions': { innerHTML: '' },
    };

    viewMock = {
      getElement: id => elements[id] || null,
    };

    i18nMock = {
      t: (key, params = {}) => {
        let text = key;
        for (const [k, v] of Object.entries(params)) {
          text += ` ${k}=${v}`;
        }
        return text;
      },
    };

    bonusGameView = new BonusGameView({ view: viewMock, i18n: i18nMock });
  });

  it('renders the list of bonus games', () => {
    bonusGameView.renderList('fr');
    expect(elements['bonus-games-list'].innerHTML).toContain('btn-bonus-game');
    expect(elements['bonus-games-list'].innerHTML).toContain(BONUS_GAMES[0].title.fr);
    expect(elements['bonus-games-list'].innerHTML).toContain('data-bonus="bomb"');
  });

  it('renders bomb playing and exploded states', () => {
    bonusGameView.renderBombPlay({
      activePlayer: { name: 'Alice' },
      question: 'Cite 3 bières',
      isExploded: false,
    });
    expect(elements['bonus-play-card'].innerHTML).toContain('Cite 3 bières');
    expect(elements['bonus-play-card'].innerHTML).toContain('Alice');
    expect(elements['bonus-play-actions'].innerHTML).toContain('bonus-bomb-pass');

    bonusGameView.renderBombPlay({
      activePlayer: { name: 'Alice' },
      isExploded: true,
      loser: { name: 'Alice' },
    });
    expect(elements['bonus-play-card'].innerHTML).toContain('bomb-exploded');
    expect(elements['bonus-play-actions'].innerHTML).toContain('bonus-bomb-restart');
  });

  it('renders court and verdict states', () => {
    bonusGameView.renderCourtPlay({
      accused: { name: 'Bob' },
      charge: 'A déjà vomi en soirée',
      guiltyVotes: 2,
      innocentVotes: 1,
      isVerdict: false,
    });
    expect(elements['bonus-play-card'].innerHTML).toContain('Bob');
    expect(elements['bonus-play-card'].innerHTML).toContain('A déjà vomi en soirée');
    expect(elements['bonus-play-actions'].innerHTML).toContain('bonus-court-guilty');
    expect(elements['bonus-play-actions'].innerHTML).toContain('bonus-court-verdict');

    bonusGameView.renderCourtPlay({
      isVerdict: true,
      verdictResult: {
        isGuilty: true,
        accused: { name: 'Bob' },
        guiltyVotes: 2,
        drinks: 2,
      },
    });
    expect(elements['bonus-play-card'].innerHTML).toContain('verdictGuiltyTitle');
    expect(elements['bonus-play-actions'].innerHTML).toContain('bonus-court-next');
  });

  it('renders barometer play and result states', () => {
    bonusGameView.renderBarometerPlay({
      situation: 'Il applaudit à la fin du film',
      currentRatingPlayer: { name: 'Charlie' },
      isFinished: false,
    });
    expect(elements['bonus-play-card'].innerHTML).toContain('Charlie');
    expect(elements['bonus-play-card'].innerHTML).toContain('Il applaudit à la fin du film');
    expect(elements['bonus-play-actions'].innerHTML).toContain('bonus-barometer-submit');

    bonusGameView.renderBarometerPlay({
      isFinished: true,
      result: {
        average: 6.5,
        ratings: [{ player: { name: 'Charlie' }, rating: 2 }],
        extremePlayer: { name: 'Charlie' },
        extremeRating: 2,
        drinks: 4,
      },
    });
    expect(elements['bonus-play-card'].innerHTML).toContain('6.5');
    expect(elements['bonus-play-actions'].innerHTML).toContain('bonus-barometer-next');
  });

  it('renders consensus play and result states', () => {
    bonusGameView.renderConsensusPlay({
      choiceA: 'Chocolat',
      choiceB: 'Vanille',
      currentVoter: { name: 'Alice' },
      isFinished: false,
    });
    expect(elements['bonus-play-card'].innerHTML).toContain('Alice');
    expect(elements['bonus-play-actions'].innerHTML).toContain('bonus-consensus-vote');

    bonusGameView.renderConsensusPlay({
      isFinished: true,
      result: {
        choiceA: 'Chocolat',
        choiceB: 'Vanille',
        countA: 1,
        countB: 2,
        minorityChoice: 'A',
        losers: [{ name: 'Alice' }],
        isTie: false,
      },
    });
    expect(elements['bonus-play-card'].innerHTML).toContain('Alice');
    expect(elements['bonus-play-actions'].innerHTML).toContain('bonus-consensus-next');
  });

  it('renders confessional play and result states', () => {
    bonusGameView.renderConfessionalPlay({
      prompt: 'Déjà sauté en parachute',
      currentVoter: { name: 'Bob' },
      isFinished: false,
    });
    expect(elements['bonus-play-card'].innerHTML).toContain('Bob');
    expect(elements['bonus-play-actions'].innerHTML).toContain('bonus-confessional-vote');

    bonusGameView.renderConfessionalPlay({
      isFinished: true,
      result: {
        prompt: 'Déjà sauté en parachute',
        doneCount: 2,
        totalPlayers: 3,
      },
    });
    expect(elements['bonus-play-card'].innerHTML).toContain('confessionalResultTitle');
    expect(elements['bonus-play-actions'].innerHTML).toContain('bonus-confessional-next');
  });

  it('renders survival play and winner states', () => {
    const players = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];
    bonusGameView.renderSurvivalPlay({
      currentPlayer: players[0],
      challenge: { question: { sentence: 'Défi chrono' } },
      lives: { 1: 3, 2: 2 },
      players,
      isFinished: false,
    });
    expect(elements['bonus-play-card'].innerHTML).toContain('Alice');
    expect(elements['bonus-play-card'].innerHTML).toContain('Défi chrono');
    expect(elements['bonus-play-actions'].innerHTML).toContain('bonus-survival-result');

    bonusGameView.renderSurvivalPlay({
      players,
      lives: { 1: 3, 2: 0 },
      isFinished: true,
      winner: players[0],
    });
    expect(elements['bonus-play-card'].innerHTML).toContain('survivalWinnerTitle');
    expect(elements['bonus-play-actions'].innerHTML).toContain('bonus-survival-restart');
  });
});

import { PromptKind } from '../domain/prompt-kind.js';
import { QuestionTextPersonalizer } from './question-text-personalizer.js';
import { DormellesPersonalizer } from './dormelles-personalizer.js';
import { TeamBattlePersonalizer } from './team-battle-personalizer.js';
import { PicoloPersonalizer } from './picolo-personalizer.js';
import { AntoinePersonalizer } from './antoine-personalizer.js';

export class RoundRenderer {
  constructor({ view, state, roundLabelBuilder, textToSpeech }) {
    this.view = view;
    this.state = state;
    this.roundLabelBuilder = roundLabelBuilder;
    this.textToSpeech = textToSpeech;
  }

  renderRound({ player, question }) {
    const label = this.roundLabelBuilder.build(
      this.state.buildRoundLabelInput(question.promptKind)
    );
    const showPlayerName = this.state.shouldDisplayRoundPlayerName();
    const players = this.state.players;

    const handler = this.getHandler(question.promptKind);
    handler({ player, question, label, showPlayerName, players });

    if (this.textToSpeech.isAutoReadEnabled()) {
      this.readCurrentQuestion();
    }
  }

  getHandler(promptKind) {
    if (promptKind === PromptKind.WOULD_YOU_RATHER) return opts => this.renderWouldYouRather(opts);
    if (promptKind === PromptKind.QUIZ) return opts => this.renderQuiz(opts);
    if (promptKind === PromptKind.DORMELLES) return opts => this.renderDormelles(opts);
    if (promptKind && promptKind.startsWith('picolo_')) return opts => this.renderPicolo(opts);
    if (promptKind && promptKind.startsWith('truth_dare_'))
      return opts => this.renderTruthDare(opts);
    if (promptKind && promptKind.startsWith('team_battle_'))
      return opts => this.renderTeamBattle(opts);
    return opts => this.renderDefault(opts);
  }

  renderWouldYouRather({ player, question, label, showPlayerName, players }) {
    const personalizer = new QuestionTextPersonalizer(players);
    this.view.renderRound({
      player,
      label,
      showPlayerName,
      choiceA: personalizer.personalize(question.choiceA, player.name),
      choiceB: personalizer.personalize(question.choiceB, player.name),
    });
  }

  renderQuiz({ player, question, label, showPlayerName }) {
    this.view.renderRound({
      player,
      label,
      showPlayerName,
      sentence: question.sentence,
      options: question.options,
    });
  }

  renderDormelles({ player, question, label, showPlayerName, players }) {
    const personalizer = new DormellesPersonalizer();
    const personalized = personalizer.personalize(question.sentence, player.name, players);
    const cardName = this.formatDormellesCard(question.cardId);
    const displayLabel = cardName ? `${label} — ${cardName}` : label;
    this.view.renderRound({ player, label: displayLabel, showPlayerName, sentence: personalized });
  }

  formatDormellesCard(cardId) {
    if (!cardId) return '';
    const CARD_MAP = {
      2: '2',
      3: '3',
      4: '4',
      5: '5',
      6: '6',
      7: '7',
      8: '8',
      9: '9',
      10: '10',
      11: 'Valet',
      12: 'Dame',
      13: 'Roi',
      14: 'As',
    };
    return CARD_MAP[cardId] || String(cardId);
  }

  renderPicolo({ player, question, label, showPlayerName, players }) {
    const personalizer = new PicoloPersonalizer();
    const personalized = personalizer.personalize(question.sentence, player, players);
    this.view.renderRound({ player, label, showPlayerName, sentence: personalized });
  }

  renderTruthDare({ player, question, label, showPlayerName, players }) {
    const personalizer = new AntoinePersonalizer();
    const personalized = personalizer.personalize(
      question.sentence,
      player,
      players,
      question.timer
    );
    this.view.renderRound({ player, label, showPlayerName, sentence: personalized });
  }

  renderTeamBattle({ player, question, label, showPlayerName, players }) {
    const personalizer = new TeamBattlePersonalizer();
    const mode = question.promptKind ? question.promptKind.replace('team_battle_', '') : '';
    const modeLabel = mode ? this.roundLabelBuilder.i18n.t(`teamBattleModes.${mode}`) || mode : '';
    const displayLabel = modeLabel ? `${label} — ${modeLabel}` : label;
    const personalized = personalizer.personalize(question.sentence, {
      currentPlayer: player,
      allPlayers: players,
      teamOneIds: this.state.teamOnePlayerIds,
      teamTwoIds: this.state.teamTwoPlayerIds,
      i18n: this.roundLabelBuilder.i18n,
    });
    const team1Names = this.state
      .getTeamOnePlayers()
      .map(p => p.name)
      .join(', ');
    const team2Names = this.state
      .getTeamTwoPlayers()
      .map(p => p.name)
      .join(', ');
    const teamsHeader =
      team1Names && team2Names
        ? `${this.roundLabelBuilder.i18n.t('teamBattle.team1') || 'Équipe 1'}: ${team1Names}  ⚡  ${this.roundLabelBuilder.i18n.t('teamBattle.team2') || 'Équipe 2'}: ${team2Names}`
        : '';

    this.view.renderRound({
      player: { name: teamsHeader || player.name },
      label: displayLabel,
      showPlayerName: Boolean(teamsHeader || showPlayerName),
      sentence: personalized,
    });
  }

  renderDefault({ player, question, label, showPlayerName, players }) {
    const personalizer = new QuestionTextPersonalizer(players);
    const sentence = personalizer.personalize(question.sentence, player.name);
    if (this.state.getActiveGameMode() === 'seven_seconds') {
      this.view.renderSevenSeconds({ player, label, sentence });
    } else {
      this.view.renderRound({ player, label, showPlayerName, sentence });
    }
  }

  readCurrentQuestion() {
    const text = this.view.getQuestionText();
    if (!text) return;
    const lang = this.state.selectedLang;
    this.textToSpeech.speak(
      text,
      this.state.getActiveGameMode(),
      lang,
      this.roundLabelBuilder.i18n
    );
  }
}

import { GameMode } from '../domain/game-mode.js';

export async function handleModeRandom(ctx) {
  ctx.screenManager.navigateToModeRandom();
  ctx.view.renderModeRandomList();
}

export async function handleModeImpostor(ctx) {
  ctx.view.renderImpostorSettings({
    playerCount: ctx.state.players.length,
    impostorCount: ctx.state.impostorCount,
    mrWhiteCount: ctx.state.mrWhiteCount,
  });
  ctx.screenManager.navigateToImpostorSettings();
}

export async function handleModeBonusGames(ctx) {
  ctx.screenManager.navigateToBonusGames();
  ctx.bonusGameView.renderList(ctx.state.selectedLang);
}

export async function handleModeBonusSpicy(ctx) {
  ctx.screenManager.navigateToBonusSpicy();
  ctx.bonusGameView.renderSpicyList(ctx.state.selectedLang);
}

export async function handleModeDefault(ctx) {
  if (ctx.state.selectedGameMode === GameMode.TEAM_BATTLE) {
    ctx.state.buildTeams();
  }
  ctx.screenManager.navigateToIntensitySelection();
}

export const MODE_HANDLERS = {
  [GameMode.RANDOM]: handleModeRandom,
  [GameMode.IMPOSTOR]: handleModeImpostor,
  [GameMode.BONUS_GAMES]: handleModeBonusGames,
  [GameMode.BONUS_SPICY]: handleModeBonusSpicy,
  _default: handleModeDefault,
};

import { GamePresenter } from './presentation/game-presenter.js';

const presenter = new GamePresenter();

document.addEventListener('DOMContentLoaded', () => {
  presenter.initialize().catch(err => {
    console.error('Initialization failed:', err);
    const loading = document.getElementById('loading-text');
    if (loading) loading.textContent = 'Erreur de chargement. Rafraîchissez la page.';
  });
});

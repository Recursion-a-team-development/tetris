import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../styles/top.css';

/**
 * TOP画面をレンダリングする
 *
 * @function renderTopPage
 * @returns {void} 
 */
export function renderTopPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
  <div class="container mt-5">
      <h1 class="text-primary">TOP画面</h1>
      <button id="goToGameButton">ゲーム画面へ</button>
  </div>
  `;

  const startButton = document.getElementById('goToGameButton');
  startButton.addEventListener('click', () => {
    import('./game.js').then(module => module.renderGamePage());
  });
}

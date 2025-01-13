import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../styles/game.css';

/**
 * ゲーム画面をレンダリングする
 *
 * @function renderGamePage
 * @returns {void} 
 */
export function renderGamePage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container mt-5">
      <h1 class="text-primary">ゲーム画面</h1>
      <button id="backToTopButton">TOP画面へ</button>
    </div>
  `;

  const backButton = document.getElementById('backToTopButton');
  backButton.addEventListener('click', () => {
    import('./top.js').then(module => module.renderTopPage());
  });
}

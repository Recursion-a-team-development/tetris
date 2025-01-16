import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

/**
 * 説明画面をレンダリングする
 * 
 * @function renderInstructionsPage
 * @returns {void}
 */
export function renderInstructionsPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container mt-5">
      <h1 class="text-primary">説明画面</h1>
      <button id="backToTopButton">TOP画面へ</button>
    </div>
  `;

  const backButton = document.getElementById('backToTopButton');
  backButton.addEventListener('click', () => {
    import('./top.js').then(module => module.renderTopPage());
  });
}

import { renderTopPage } from './pages/top.js';

/**
 * 初期表示でTOP画面をレンダリングする
 *
 * @listens DOMContentLoaded
 * @returns {void}
 */
document.addEventListener('DOMContentLoaded', () => {
    renderTopPage();
});

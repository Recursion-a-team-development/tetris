import "../styles/game.css";
import { TetrisGame } from "../game/app.js";

/**
 * ゲーム画面をレンダリングする関数
 *
 * @function renderGamePage
 * @returns {void}
 */
export function renderGamePage() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="full-height center-flex">
      <div id="game-ground">
        <div id="score-window">
          <h2>0</h2>
        </div>
        <div class="m-2 text-center p-1">
          <button id="backToTopButton">TOP画面へ</button>
        </div>
        <canvas id="tetris-board" width="300" height="600"></canvas>
        <div class="next-tetromino mt-2">
          <h3>NEXT</h3>
          <canvas id="next-tetromino" width="120" height="120"></canvas>
        </div>
      </div>
    </div>
  `;

  const backButton = document.getElementById("backToTopButton");
  backButton.addEventListener("click", () => {
    import("./top.js").then((module) => module.renderTopPage());
  });

  // ゲームの初期化
  const game = new TetrisGame("tetris-board", "score-window");
  game.startGame();
}

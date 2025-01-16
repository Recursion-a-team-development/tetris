import "bootstrap/dist/css/bootstrap.min.css";

/**
 * TOP画面をレンダリングする
 *
 * @function renderTopPage
 * @returns {void}
 */
export function renderTopPage() {
  const app = document.getElementById("app");
  app.innerHTML = `
  <div class="container mt-5">
      <h1 class="text-primary">TOP画面</h1>
      <button id="goToGameButton">ゲーム画面へ</button>
      <button id="goToInstructionButton">説明画面へ</button>
  </div>
  `;

  const startButton = document.getElementById("goToGameButton");
  startButton.addEventListener("click", () => {
    import("./game.js").then((module) => module.renderGamePage());
  });

  const instructionButton = document.getElementById("goToInstructionButton");
  instructionButton.addEventListener("click", () => {
    import("./instruction.js").then((module) =>
      module.renderInstructionsPage()
    );
  });
}

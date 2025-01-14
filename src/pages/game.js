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
    <div class="full-height center-flex">
      <div id="game-ground">
        <div id="score-window">
          <h2>スコアウィンドウ</h2>
        </div>
        <div class="m-2 text-center p-1">
          <button id="backToTopButton">TOP画面へ</button>
        </div>
        <canvas id="tetris-board" width="300" height="600"></canvas>
      </div>
    </div>
  `;
  const backButton = document.getElementById('backToTopButton');
  backButton.addEventListener('click', () => {
    import('./top.js').then(module => module.renderTopPage());
  });


  // テトリスゲームの初期化
  startGame();  
}

/**
 * ゲームを開始する関数
 */
export function startGame() {
  const canvas = document.getElementById('tetris-board');
  const ctx = canvas.getContext('2d');

  const COLS = 10;  // 列数
  const ROWS = 20;  // 行数
  const BLOCK_SIZE = 30;  // 各ブロックのサイズ

  // ボードを描画する関数
  function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // ボードをクリア

    // ボードの固定されたブロックを描画
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (board[row][col] !== null) {
          ctx.fillStyle = board[row][col];  // 固定されたブロックの色
          ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
          ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);  // 境界線
        }
      }
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = "gray";  // グリッド線の色を設定
    // ボードのグリッドを描画
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }

  // テトリスブロックの形と色を定義
  const tetrominoes = [
    { shape: [[1, 1, 1, 1]], color: 'red' },  // I型
    { shape: [[1, 1], [1, 1]], color: 'blue' },  // O型
    { shape: [[1, 1, 0], [0, 1, 1]], color: 'green' },  // S型
    { shape: [[0, 1, 1], [1, 1, 0]], color: 'purple' },  // Z型
    { shape: [[1, 0, 0], [1, 1, 1]], color: 'yellow' },  // L型
    { shape: [[0, 0, 1], [1, 1, 1]], color: 'orange' },  // J型
    { shape: [[0, 1, 0], [1, 1, 1]], color: 'cyan' },  // T型
  ];

  // ボードの状態を管理する2D配列（色も保存）
  let board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

  // 初期状態のブロック
  let currentTetromino = generateTetromino();
  let currentX = 3;
  let currentY = 0;

  // ゲームの落下速度（ms単位）
  const fallInterval = 1000; // 1000msごとに1回落ちる
  let lastFallTime = 0;

  // テトリスブロックを描画する関数
  function drawTetromino() {
    ctx.fillStyle = currentTetromino.color;

    for (let row = 0; row < currentTetromino.shape.length; row++) {
      for (let col = 0; col < currentTetromino.shape[row].length; col++) {
        if (currentTetromino.shape[row][col]) {
          ctx.fillRect((currentX + col) * BLOCK_SIZE, (currentY + row) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      }
    }
  }

  // 新しいテトリスブロックを生成する関数
  function generateTetromino() {
    const randomIndex = Math.floor(Math.random() * tetrominoes.length);
    return tetrominoes[randomIndex];
  }

  // テトリスブロックを1行下に移動する関数
  function moveTetrominoDown() {
    currentY++;
    if (isTetrominoAtBottom()) {
      freezeTetromino();
      currentTetromino = generateTetromino();
      currentX = 3;
      currentY = 0;
    }
  }

  // ブロックが底に到達したかどうかを判定する関数
  function isTetrominoAtBottom() {
    for (let row = 0; row < currentTetromino.shape.length; row++) {
      for (let col = 0; col < currentTetromino.shape[row].length; col++) {
        if (currentTetromino.shape[row][col]) {
          if (currentY + row >= ROWS - 1 || board[currentY + row + 1][currentX + col]) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // ブロックをボードに固定する関数
  function freezeTetromino() {
    for (let row = 0; row < currentTetromino.shape.length; row++) {
      for (let col = 0; col < currentTetromino.shape[row].length; col++) {
        if (currentTetromino.shape[row][col]) {
          board[currentY + row][currentX + col] = currentTetromino.color;  // 色も固定する
        }
      }
    }
  }

  // ゲームループ：ブロックを定期的に移動させる
  function gameLoop(timestamp) {
    if (timestamp - lastFallTime >= fallInterval) {
      lastFallTime = timestamp;
      moveTetrominoDown();
    }

    drawBoard();
    drawTetromino();

    // 次のフレームを要求
    requestAnimationFrame(gameLoop);
  }

  // ゲームを開始する
  requestAnimationFrame(gameLoop);
}

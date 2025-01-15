import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../styles/game.css';

/**
 * ゲーム画面をレンダリングする関数
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

  // ゲームの初期化
  const game = new TetrisGame('tetris-board');
  game.startGame();
}

/**
 * テトリスゲームを管理するクラス
 */
export class TetrisGame {
  /**
   * コンストラクタ - テトリスゲームの初期設定を行います
   * 
   * @param {string} canvasId - ゲームボードのキャンバス要素のID
   */
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    this.COLS = 10; // 列数
    this.ROWS = 20; // 行数
    this.BLOCK_SIZE = 30; // 各ブロックのサイズ

    this.board = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(null)); // 20行10列の二次元配列。縦に20,横10のイメージ
    this.tetrominoes = [
      { shape: [[1, 1, 1, 1]], color: 'red' },  // I型
      { shape: [[1, 1], [1, 1]], color: 'blue' },  // O型
      { shape: [[1, 1, 0], [0, 1, 1]], color: 'green' },  // S型
      { shape: [[0, 1, 1], [1, 1, 0]], color: 'purple' },  // Z型
      { shape: [[1, 0, 0], [1, 1, 1]], color: 'yellow' },  // L型
      { shape: [[0, 0, 1], [1, 1, 1]], color: 'orange' },  // J型
      { shape: [[0, 1, 0], [1, 1, 1]], color: 'cyan' },  // T型
    ];

    this.currentTetromino = this.generateTetromino();
    this.currentX = 3;
    this.currentY = 0;
    this.lastFallTime = 0;
    this.fallInterval = 1000; // 落下間隔公式設定より、800msに設定
  }

  /**
   * ゲームの開始処理
   * 
   * @returns {void}
   */
  startGame() {
    this.gameLoop();
  }

  /**
   * ゲームループ - 定期的に呼ばれてゲームの状態を更新します
   * 
   * @param {number} timestamp - 現在のタイムスタンプ（`requestAnimationFrame`から提供される、自動的に提供されるため手動で渡す必要はありません。）
   * @returns {void}
   */
  gameLoop(timestamp) {
    if (timestamp - this.lastFallTime >= this.fallInterval) {
      this.lastFallTime = timestamp;
      this.moveTetrominoDown();
    }

    this.drawBoard();
    this.drawTetromino();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * ボードを描画する
   * 
   * @returns {void}
   */
  drawBoard() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);  // ボードをクリア

    // ボードに固定されたブロックを描画
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        if (this.board[row][col] !== null) {
          this.ctx.fillStyle = this.board[row][col];
          this.ctx.fillRect(col * this.BLOCK_SIZE, row * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
          this.ctx.strokeRect(col * this.BLOCK_SIZE, row * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE); // 境界線
        }
      }
    }

    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "gray"; // グリッド線の色
    // ボードのグリッドを描画
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        this.ctx.strokeRect(col * this.BLOCK_SIZE, row * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
      }
    }
  }

  /**
   * テトリスブロックを描画する
   * 
   * @returns {void}
   */
  drawTetromino() {
    this.ctx.fillStyle = this.currentTetromino.color;

    for (let row = 0; row < this.currentTetromino.shape.length; row++) {
      for (let col = 0; col < this.currentTetromino.shape[row].length; col++) {
        if (this.currentTetromino.shape[row][col]) {
          this.ctx.fillRect((this.currentX + col) * this.BLOCK_SIZE, (this.currentY + row) * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
        }
      }
    }
  }

  /**
   * 新しいテトリスブロックをランダムに生成する
   * 
   * @returns {Object} - 生成されたテトリスブロックの形状と色
   */
  generateTetromino() {
    const randomIndex = Math.floor(Math.random() * this.tetrominoes.length);
    return this.tetrominoes[randomIndex];
  }

  /**
   * テトリスブロックを1行下に移動させる
   * 
   * @returns {void}
   */
  moveTetrominoDown() {
    this.currentY++;
    if (this.isTetrominoAtBottom()) {
      this.freezeTetromino();
      this.currentTetromino = this.generateTetromino();
      this.currentX = 3;
      this.currentY = 0;
    }
  }

  /**
   * テトリスブロックが底に到達したかどうかを判定する
   * 
   * @returns {boolean} - ブロックが底に到達した場合は`true`、そうでない場合は`false`
   */
  isTetrominoAtBottom() {
    for (let row = 0; row < this.currentTetromino.shape.length; row++) {
      for (let col = 0; col < this.currentTetromino.shape[row].length; col++) {
        if (this.currentTetromino.shape[row][col]) {
          if (this.currentY + row >= this.ROWS - 1 || this.board[this.currentY + row + 1][this.currentX + col]) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * 現在のテトリスブロックをボードに固定する
   * 
   * @returns {void}
   */
  freezeTetromino() {
    for (let row = 0; row < this.currentTetromino.shape.length; row++) {
      for (let col = 0; col < this.currentTetromino.shape[row].length; col++) {
        if (this.currentTetromino.shape[row][col]) {
          this.board[this.currentY + row][this.currentX + col] = this.currentTetromino.color;
        }
      }
    }
  }
}

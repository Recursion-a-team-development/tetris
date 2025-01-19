/**
 * ゲーム設定 クラス外で定義。
 */
export const GAME_SETTINGS = {
  START_X_POSITION: 3,
  START_Y_POSITION: 0,
  INITIAL_FALL_INTERVAL: 800,
  INITIAL_SCORE: 0,
  BOARD_COLUMNS: 10,
  BOARD_ROWS: 20,
  BLOCK_SIZE: 30,
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  ARROW_DOWN: "ArrowDown",
  SPACE_KEY: " ",
  DIRECTION_LEFT: "left",
  DIRECTION_RIGHT: "right",
};

/**
 * テトリスゲームを管理するクラス
 */
export class TetrisGame {
  /**
   * コンストラクタ - テトリスゲームの初期設定を行います
   *
   * @param {string} canvasId - ゲームボードのキャンバス要素のID
   * @param {string} scoreWindowId - スコアウィンドウのID
   */
  constructor(canvasId, scoreWindowId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.scoreWindow = document.getElementById(scoreWindowId);
    this.board = Array.from({ length: GAME_SETTINGS.BOARD_ROWS }, () =>
      Array(GAME_SETTINGS.BOARD_COLUMNS).fill(null)
    );

    this.tetrominoes = [
      { shape: [[1, 1, 1, 1]], color: "red" }, // I型
      {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: "blue",
      }, // O型
      {
        shape: [
          [1, 1, 0],
          [0, 1, 1],
        ],
        color: "green",
      }, // Z型
      {
        shape: [
          [0, 1, 1],
          [1, 1, 0],
        ],
        color: "purple",
      }, // S型
      {
        shape: [
          [1, 0, 0],
          [1, 1, 1],
        ],
        color: "yellow",
      }, // L型
      {
        shape: [
          [0, 0, 1],
          [1, 1, 1],
        ],
        color: "orange",
      }, // J型
      {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        color: "cyan",
      }, // T型
    ];

    this.currentTetromino = this.generateTetromino();
    this.lastFallTime = 0;

    // ゲームスコアの初期化
    this.score = GAME_SETTINGS.INITIAL_SCORE;

    // ゲームボードの初期位置設定 GAME_SETTINGSを直接変更することを防ぐために、クラスプロパティとしてxPositionとyPositionを使用。
    this.xPosition = GAME_SETTINGS.START_X_POSITION;
    this.yPosition = GAME_SETTINGS.START_Y_POSITION;

    // キーボードイベントのリスナーを追加
    document.addEventListener("keydown", (event) =>
      this.controlTetromino(event)
    );
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
    if (timestamp - this.lastFallTime >= GAME_SETTINGS.INITIAL_FALL_INTERVAL) {
      this.lastFallTime = timestamp;
      this.moveTetrominoDown();
    }

    this.clearAndUpdateScore();
    this.drawBoard();
    this.drawTetromino();
    requestAnimationFrame(this.gameLoop.bind(this)); // コンテキストを維持
  }

  /**
   * ボードを描画する
   *
   * @returns {void}
   */
  drawBoard() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // ボードをクリア
    // ボードに固定されたブロックを描画
    for (let row = 0; row < GAME_SETTINGS.BOARD_ROWS; row++) {
      for (let col = 0; col < GAME_SETTINGS.BOARD_COLUMNS; col++) {
        if (this.board[row][col] !== null) {
          this.ctx.fillStyle = this.board[row][col];
          this.ctx.fillRect(
            col * GAME_SETTINGS.BLOCK_SIZE,
            row * GAME_SETTINGS.BLOCK_SIZE,
            GAME_SETTINGS.BLOCK_SIZE,
            GAME_SETTINGS.BLOCK_SIZE
          );
          this.ctx.strokeRect(
            col * GAME_SETTINGS.BLOCK_SIZE,
            row * GAME_SETTINGS.BLOCK_SIZE,
            GAME_SETTINGS.BLOCK_SIZE,
            GAME_SETTINGS.BLOCK_SIZE
          ); // 境界線
        }
      }
    }

    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "gray"; // グリッド線の色
    // ボードのグリッドを描画
    for (let row = 0; row < GAME_SETTINGS.BOARD_ROWS; row++) {
      for (let col = 0; col < GAME_SETTINGS.BOARD_COLUMNS; col++) {
        this.ctx.strokeRect(
          col * GAME_SETTINGS.BLOCK_SIZE,
          row * GAME_SETTINGS.BLOCK_SIZE,
          GAME_SETTINGS.BLOCK_SIZE,
          GAME_SETTINGS.BLOCK_SIZE
        );
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
          this.ctx.fillRect(
            (this.xPosition + col) * GAME_SETTINGS.BLOCK_SIZE,
            (this.yPosition + row) * GAME_SETTINGS.BLOCK_SIZE,
            GAME_SETTINGS.BLOCK_SIZE,
            GAME_SETTINGS.BLOCK_SIZE
          );
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
    this.yPosition++;
    if (this.isTetrominoAtBottom()) {
      this.freezeAndGenerateTetromino();
    }
  }

  /**
   * キーを使用したテトリスブロックの操作
   *
   * @param {KeyboardEvent} event - キーボードイベント
   * @returns {void}
   */
  controlTetromino(event) {
    if (event.key === GAME_SETTINGS.ARROW_LEFT) {
      if (!this.isTetrominoAtSides(GAME_SETTINGS.DIRECTION_LEFT)) {
        this.xPosition--;
      }
    } else if (event.key === GAME_SETTINGS.ARROW_RIGHT) {
      if (!this.isTetrominoAtSides(GAME_SETTINGS.DIRECTION_RIGHT)) {
        this.xPosition++;
      }
    } else if (event.key === GAME_SETTINGS.ARROW_DOWN) {
      this.moveTetrominoDown();
    } else if (event.key === GAME_SETTINGS.SPACE_KEY) {
      while (!this.isTetrominoAtBottom()) {
        this.yPosition++;
      }
    }
    // 移動後のブロックが底に到達した場合は固定して新しいブロックを生成
    if (this.isTetrominoAtBottom()) {
      this.freezeAndGenerateTetromino();
    }
  }

  /**
   * テトリスブロックが左右に移動できるかどうかを判定する
   * @param {string} direction - 移動方向 ('left' または 'right')
   * @returns {boolean} - 移動できない場合は`true`、移動できる場合は`false`
   */
  isTetrominoAtSides(direction) {
    for (let row = 0; row < this.currentTetromino.shape.length; row++) {
      for (let col = 0; col < this.currentTetromino.shape[row].length; col++) {
        if (this.currentTetromino.shape[row][col]) {
          // 移動後のx位置を計算
          const newXPosition =
            direction === GAME_SETTINGS.DIRECTION_LEFT
              ? this.xPosition + col - 1
              : this.xPosition + col + 1;
          // 左右に壁があるかを判定
          if (newXPosition < 0 || newXPosition >= GAME_SETTINGS.BOARD_COLUMNS) {
            return true;
          }

          // 左右にミノがあるかを判定
          if (this.board[this.yPosition + row][newXPosition]) {
            return true;
          }
        }
      }
    }
    return false;
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
          if (
            this.yPosition + row >= GAME_SETTINGS.BOARD_ROWS - 1 ||
            this.board[this.yPosition + row + 1][this.xPosition + col]
          ) {
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
          this.board[this.yPosition + row][this.xPosition + col] =
            this.currentTetromino.color;
        }
      }
    }
  }

  /**
   * テトリスブロックの固定＆新しいテトリスブロックの生成をまとめて処理する
   * @returns {void}
   */
  freezeAndGenerateTetromino() {
    this.freezeTetromino();
    this.currentTetromino = this.generateTetromino();
    this.xPosition = GAME_SETTINGS.START_X_POSITION;
    this.yPosition = GAME_SETTINGS.START_Y_POSITION;
  }

  /**
   * テトリスブロックが一列揃ったらクリアする
   * クリアされた行はボードの一番上に新しい行として追加される
   * クリアした行数に応じてスコアを加算し、スコアウィンドのhtmlに反映
   *
   * @returns {void}
   */
  clearAndUpdateScore() {
    let rowsToDelete = []; // クリアされる行のインデックスを格納する配列

    // ボードの各行をすべてチェックする。
    for (let row = 0; row < GAME_SETTINGS.BOARD_ROWS; row++) {
      if (this.board[row].every((cell) => cell != null)) {
        rowsToDelete.push(row);
      }
    }

    // クリアされる行を削除し、新しく空の行を追加。
    rowsToDelete.forEach((row) => {
      this.board.splice(row, 1); // クリアすべき行を1行削除。
      this.board.unshift(Array(GAME_SETTINGS.BOARD_COLUMNS).fill(null));
    });

    if (rowsToDelete.length > 0) {
      this.updateScore(rowsToDelete.length);
    }
  }

  /**
   * クリアした行数に応じてスコアをつけていく
   * スコアウィンドウのhtmlに反映
   *
   * @param {number} lines - 一度にクリアされた行数
   * @returns {void}
   */
  updateScore(lines) {
    switch (lines) {
      case 1:
        this.score += 100;
        break;
      case 2:
        this.score += 200;
        break;
      case 3:
        this.score += 400;
        break;
      case 4:
        this.score += 800;
        break;
      default:
        this.score += 0;
        break;
    }
    this.scoreWindow.innerHTML = `
      <h2>${this.score}</h2>
    `;
  }
}

/**
 * ゲーム設定 クラス外で定義。
 */
export const GAME_SETTINGS = {
  START_X_POSITION: 3,
  START_Y_POSITION: 0,
  INITIAL_SCORE: 0,
  BOARD_COLUMNS: 10,
  BOARD_ROWS: 20,
  BLOCK_SIZE: 30,
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  SPACE_KEY: " ",
  DIRECTION_LEFT: "left",
  DIRECTION_RIGHT: "right",
  COLORS: {
    I: "rgba(0, 233, 233, 0.9)",
    O: "rgba(200, 200, 0, 0.9)",
    Z: "rgba(200, 0, 0, 0.9)",
    S: "rgba(0, 150, 0, 0.9)",
    L: "rgba(255, 120, 0, 0.9)",
    J: "rgba(6, 78, 211, 0.9)",
    T: "rgba(100, 0, 100, 0.9)",
    GHOST: "rgba(0, 0, 0, 0.5)",
  },
  FALL_INTERVALS: {
    INITIAL: 800,
    MIN: 400,
    REDUCTION: 100,
    STEP: 15000,
  },
  SOUND_EFFECTS: {
    CLEAR_LINE: "src/assets/audio/sound-effect/clearline.mp3",
  },
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
      {
        shape: [
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        color: GAME_SETTINGS.COLORS.I,
      }, // I型
      {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: GAME_SETTINGS.COLORS.O,
      }, // O型
      {
        shape: [
          [1, 1, 0],
          [0, 1, 1],
          [0, 0, 0],
        ],
        color: GAME_SETTINGS.COLORS.Z,
      }, // Z型
      {
        shape: [
          [0, 1, 1],
          [1, 1, 0],
          [0, 0, 0],
        ],
        color: GAME_SETTINGS.COLORS.S,
      }, // S型
      {
        shape: [
          [1, 0, 0],
          [1, 1, 1],
          [0, 0, 0],
        ],
        color: GAME_SETTINGS.COLORS.J,
      }, // J型
      {
        shape: [
          [0, 0, 1],
          [1, 1, 1],
          [0, 0, 0],
        ],
        color: GAME_SETTINGS.COLORS.L,
      }, // L型
      {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
          [0, 0, 0],
        ],
        color: GAME_SETTINGS.COLORS.T,
      }, // T型
    ];

    this.currentTetromino = this.generateTetromino();
    this.ghostTetromino = this.currentTetromino;
    this.nextTetromino = this.generateTetromino();
    this.lastFallTime = 0;

    // ゲームスコアの初期化
    this.score = GAME_SETTINGS.INITIAL_SCORE;

    // 落下間隔の初期設定
    this.fallInterval = GAME_SETTINGS.FALL_INTERVALS.INITIAL;

    // ゲームボードの初期位置設定 GAME_SETTINGSを直接変更することを防ぐために、クラスプロパティとしてxPositionとyPositionを使用。
    this.xPosition = GAME_SETTINGS.START_X_POSITION;
    this.yPosition = GAME_SETTINGS.START_Y_POSITION;

    // ゴーストブロックの初期位置設定
    this.ghostXPosition = this.xPosition;
    this.ghostYPosition = this.yPosition;

    // キーボードイベントのリスナーを追加
    document.addEventListener("keydown", (event) =>
      this.controlTetromino(event)
    );

    // 音声キャッシュを初期化
    this.soundEffects = {};

    // 効果音をキャッシュする
    this.cacheSounds();

    // startTimeをnullで初期化
    this.startTime = null;
  }

  /**
   * ゲームの開始処理
   *
   * @returns {void}
   */
  startGame() {
    this.gameLoop();

    // ゲームの開始時刻を記録
    this.startTime = Date.now();
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

    this.adjustFallInterval();
    this.clearAndUpdateScore();
    this.drawBoard();
    this.drawTetromino();
    this.drawGhostTetromino();
    this.updateGhostTetromino();
    this.drawNextTetromino();
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
          // ブロックの形で範囲を塗りつぶす
          this.ctx.fillRect(
            (this.xPosition + col) * GAME_SETTINGS.BLOCK_SIZE,
            (this.yPosition + row) * GAME_SETTINGS.BLOCK_SIZE,
            GAME_SETTINGS.BLOCK_SIZE,
            GAME_SETTINGS.BLOCK_SIZE
          );

          // ブロックの外周を線で描くことでグリッド線を疑似的に描画
          this.ctx.lineWidth = 1;
          this.ctx.strokeStyle = "gray"; //グリッド線の色
          this.ctx.strokeRect(
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
   * ゴーストブロックを描画する
   * ゴーストブロックが底に到達するまでの位置を描画する
   * @returns {void}
   * */
  drawGhostTetromino() {
    // ゴーストブロックを描画
    this.ctx.fillStyle = GAME_SETTINGS.COLORS.GHOST;

    for (let row = 0; row < this.ghostTetromino.shape.length; row++) {
      for (let col = 0; col < this.ghostTetromino.shape[row].length; col++) {
        if (this.ghostTetromino.shape[row][col]) {
          this.ctx.fillRect(
            (this.ghostXPosition + col) * GAME_SETTINGS.BLOCK_SIZE,
            (this.ghostYPosition + row) * GAME_SETTINGS.BLOCK_SIZE,
            GAME_SETTINGS.BLOCK_SIZE,
            GAME_SETTINGS.BLOCK_SIZE
          );
          this.ctx.strokeRect(
            (this.ghostXPosition + col) * GAME_SETTINGS.BLOCK_SIZE,
            (this.ghostYPosition + row) * GAME_SETTINGS.BLOCK_SIZE,
            GAME_SETTINGS.BLOCK_SIZE,
            GAME_SETTINGS.BLOCK_SIZE
          );
        }
      }
    }
  }

  /**
   * ゴーストブロックの位置を更新する
   * @returns {void}
   */
  updateGhostTetromino() {
    // ゴーストブロックを描画するために、テトリスブロックの位置をコピー
    this.ghostXPosition = this.xPosition;
    this.ghostYPosition = this.yPosition;

    // ゴーストブロックが底に到達するまでの位置を計算
    while (!this.isGhostTetrominoAtBottom()) {
      this.ghostYPosition++;
    }
  }

  /**
   * 次のテトリミノを描画する
   *
   * @returns {void}
   */
  drawNextTetromino() {
    const nextTetrominoCanvas = document.getElementById("next-tetromino");
    const context = nextTetrominoCanvas.getContext("2d");
    const blockSize = GAME_SETTINGS.BLOCK_SIZE;

    // キャンバスをクリア
    context.clearRect(
      0,
      0,
      nextTetrominoCanvas.width,
      nextTetrominoCanvas.height
    );

    // I型以外のミノの場合、X軸とY軸を1増やす
    let offsetX = 0;
    let offsetY = 0;
    if (this.nextTetromino.color !== GAME_SETTINGS.COLORS.I) {
      offsetX = 1;
      offsetY = 1;
    }

    // 次のテトリミノを描画
    this.nextTetromino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          context.fillStyle = this.nextTetromino.color;
          context.fillRect(
            (x + offsetX) * blockSize,
            (y + offsetY) * blockSize,
            blockSize,
            blockSize
          );
          context.strokeRect(
            (x + offsetX) * blockSize,
            (y + offsetY) * blockSize,
            blockSize,
            blockSize
          );
        }
      });
    });
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
   * テトリスブロックを90度時計回りに回転させる
   *
   * @returns {void}
   */
  rotateTetromino() {
    const rotatedShape = this.currentTetromino.shape[0].map((_, index) =>
      this.currentTetromino.shape.map((row) => row[index]).reverse()
    );

    // 壁を越えないように調整
    let offsetX = 0;
    while (
      this.isTetrominoOutOfBounds(rotatedShape, this.xPosition + offsetX)
    ) {
      offsetX += this.xPosition > 0 ? -1 : 1;
      if (Math.abs(offsetX) > rotatedShape[0].length) {
        // 回転後の形が収まらない場合は回転をキャンセル
        return;
      }
    }

    // ミノが他のブロックと重ならないように調整
    if (
      this.isTetrominoOverlapping(
        rotatedShape,
        this.xPosition + offsetX,
        this.yPosition
      )
    ) {
      // 回転に必要な空間がない場合は回転処理をキャンセル
      return;
    }

    this.currentTetromino.shape = rotatedShape;
    this.xPosition += offsetX;
  }

  /**
   * 回転後のテトリスブロックがボードの範囲外にあるかどうかを判定する
   * @param {Array} shape - テトリスブロックの形状
   * @param {number} xPosition - テトリスブロックのx位置
   * @returns {boolean} - ブロックが範囲外にある場合は`true`、そうでない場合は`false`
   * */
  isTetrominoOutOfBounds(shape, xPosition) {
    return shape.some((row) =>
      row.some((cell, colIndex) => {
        if (cell) {
          const x = xPosition + colIndex;
          return x < 0 || x >= this.board[0].length;
        }
        return false;
      })
    );
  }

  /**
   * 回転後のテトリスブロックが他のブロックと重なるかどうかを判定する
   * @param {Array} shape - テトリスブロックの形状
   * @param {number} xPosition - テトリスブロックのx位置
   * @param {number} yPosition - テトリスブロックのy位置
   * @returns {boolean} - ブロックが重なる場合は`true`、そうでない場合は`false`
   */
  isTetrominoOverlapping(shape, xPosition, yPosition) {
    return shape.some((row, rowIndex) =>
      row.some((cell, colIndex) => {
        if (cell) {
          const x = xPosition + colIndex;
          const y = yPosition + rowIndex;
          return this.board[y] && this.board[y][x];
        }
        return false;
      })
    );
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
    } else if (event.key === GAME_SETTINGS.ARROW_UP) {
      this.rotateTetromino();
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
   * ゴーストブロックが底に到達したかどうかを判定する
   * @returns {boolean} - ブロックが底に到達した場合は`true`、そうでない場合は`false`
   * */
  isGhostTetrominoAtBottom() {
    for (let row = 0; row < this.ghostTetromino.shape.length; row++) {
      for (let col = 0; col < this.ghostTetromino.shape[row].length; col++) {
        if (this.ghostTetromino.shape[row][col]) {
          if (
            this.ghostYPosition + row >= GAME_SETTINGS.BOARD_ROWS - 1 ||
            this.board[this.ghostYPosition + row + 1][this.ghostXPosition + col]
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
    this.currentTetromino = this.nextTetromino;
    this.ghostTetromino = this.currentTetromino;
    this.drawGhostTetromino();
    this.nextTetromino = this.generateTetromino();
    this.xPosition = GAME_SETTINGS.START_X_POSITION;
    this.yPosition = GAME_SETTINGS.START_Y_POSITION;
    this.drawNextTetromino(); // 次のテトリミノを描画
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
  async updateScore(lines) {
    let scoreIncrease = 0;

    switch (lines) {
      case 1:
        scoreIncrease = 100;
        break;
      case 2:
        scoreIncrease = 200;
        break;
      case 3:
        scoreIncrease = 400;
        break;
      case 4:
        scoreIncrease = 800;
        break;
      default:
        scoreIncrease = 0;
        break;
    }

    // スコアの更新は即座に行う
    this.score += scoreIncrease;
    this.scoreWindow.innerHTML = `
      <h2>${this.score}</h2>
    `;

    // 音声を複数回鳴らす
    if (scoreIncrease > 0) {
      for (let i = 0; i < lines; i++) {
        // 音声再生を待つ
        await this.playSoundEffect("CLEAR_LINE");
      }
    }
  }

  /**
   * GAME_SETTINGS.FALLINTERVALSの設定に基づいて、落下間隔を調整する
   *
   * @returns {void}
   */
  adjustFallInterval() {
    const elapsedTime = Date.now() - this.startTime;

    // 経過時間が設定のSTEPを超えたら落下間隔を短縮する
    if (elapsedTime >= GAME_SETTINGS.FALL_INTERVALS.STEP) {
      this.fallInterval = Math.max(
        GAME_SETTINGS.FALL_INTERVALS.MIN,
        this.fallInterval - GAME_SETTINGS.FALL_INTERVALS.REDUCTION
      );

      // startTimeを現在の時間にして経過時間を現在の時刻からにする
      this.startTime = Date.now();
    }
  }

  /**
   * 効果音をキャッシュ
   *
   * @returns {void}
   */
  cacheSounds() {
    for (const [key, soundPath] of Object.entries(
      GAME_SETTINGS.SOUND_EFFECTS
    )) {
      const audio = new Audio(soundPath);
      this.soundEffects[key] = audio; // 音声をキャッシュ
    }
  }

  /**
   * 効果音を再生
   *
   * @param {string} soundKey - 効果音のキー
   * @returns {void}
   */
  async playSoundEffect(soundKey) {
    const sound = this.soundEffects[soundKey];
    if (sound) {
      // 音声の再生が終わるまで待つための Promise を返す
      return new Promise((resolve, reject) => {
        sound.play().catch((error) => {
          console.error("効果音の再生に失敗しました: ", error);
          reject(error);
        });

        // 再生終了後に resolve を呼び出して次の音声を再生する
        sound.onended = () => resolve();
      });
    } else {
      console.warn(`指定された音声 "${soundKey}" がキャッシュされていません`);
    }
  }
}

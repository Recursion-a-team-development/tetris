
import { renderTopPage } from "../pages/top";
import { GAME_SETTINGS } from "./gameSetting.js";
import { Tetromino } from "./tetromino.js";
import { Score } from "./score.js";
import { Board } from "./board.js";
import { Sound } from "./sound.js";

export class TetrisGame {
  /**
   * コンストラクタ - テトリスゲームの初期設定を行います
   *
   * @param {string} canvasId - ゲームボードのキャンバス要素のID
   * @param {string} scoreWindowId - スコアウィンドウのID
   */
  constructor(canvasId, scoreWindowId) {
    // キャンバスとコンテキストの取得
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.scoreWindow = document.getElementById(scoreWindowId);

    // テトリスブロックの初期化
    this.currentTetromino = Tetromino.generateRandomTetromino();
    this.ghostTetromino = this.currentTetromino;
    this.nextTetromino = Tetromino.generateRandomTetromino();

    // ゲーム効果音の初期化
    this.soundManager = new Sound(GAME_SETTINGS.SOUND_EFFECTS);

    // ゲームスコアの初期化
    this.score = new Score(
      this.scoreWindow,
      this.soundManager.playSoundEffect.bind(this.soundManager)
    );

    // ゲームボードの初期化
    this.boardInstance = new Board(this.canvas, this.score);
    this.board = this.boardInstance.board;

    // 落下間隔の初期設定
    this.fallInterval = GAME_SETTINGS.FALL_INTERVALS.INITIAL;
    this.lastFallTime = 0;

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

    // ゲームオーバー処理が何度も呼ばれないようにフラグを追加
    this.gameOverFlag = false;

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
    // ゲームオーバー判定
    if (this.isGameOver()) {
      this.gameOver(); // ゲームオーバー処理
      return; // ゲームオーバー後はループを中断
    }

    if (timestamp - this.lastFallTime >= this.fallInterval) {
      this.lastFallTime = timestamp;
      this.moveTetrominoDown();
    }

    this.adjustFallInterval();
    this.boardInstance.clearAndUpdateScore();
    this.boardInstance.drawBoard();
    this.currentTetromino.drawTetromino(
      this.ctx,
      this.xPosition,
      this.yPosition,
      this.currentTetromino.color
    );
    this.ghostTetromino.drawTetromino(
      this.ctx,
      this.ghostXPosition,
      this.ghostYPosition,
      GAME_SETTINGS.COLORS.GHOST
    );
    this.updateGhostTetromino();
    this.drawNextTetromino();
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this)); // コンテキストを維持
  }

  /**
   * 次のテトリミノを描画する
   *
   * @returns {void}
   */
  drawNextTetromino() {
    const nextTetrominoCanvas = document.getElementById("next-tetromino");
    if (!nextTetrominoCanvas) {
      return;
    }
    const context = nextTetrominoCanvas.getContext("2d");

    // キャンバスをクリア
    context.clearRect(
      0,
      0,
      nextTetrominoCanvas.width,
      nextTetrominoCanvas.height
    );

    // I型以外のミノの場合、オフセットを調整
    const offsetX = this.nextTetromino.color === GAME_SETTINGS.COLORS.I ? 0 : 1;
    const offsetY = this.nextTetromino.color === GAME_SETTINGS.COLORS.I ? 0 : 1;

    // 次のテトリミノを描画
    this.nextTetromino.drawNext(context, offsetX, offsetY);
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
    this.nextTetromino = Tetromino.generateRandomTetromino();
    this.xPosition = GAME_SETTINGS.START_X_POSITION;
    this.yPosition = GAME_SETTINGS.START_Y_POSITION;
    this.ghostTetromino = this.currentTetromino;
    this.drawNextTetromino(); // 次のテトリミノを描画
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
   * ゲームオーバー判定
   *
   * @returns {boolean} - ゲームオーバーの場合は`true`、そうでないなら`false`
   */
  isGameOver() {
    // ゲームオーバーフラグが立っている場合、すでにゲームオーバー処理が行われたので、false
    if (this.gameOverFlag) {
      return false;
    }

    // 新しいテトリスブロックがボードの最上部に配置されているとき
    // すでに固定されたブロックと重なっている場合はゲームオーバー
    for (let row = 0; row < this.currentTetromino.shape.length; row++) {
      for (let col = 0; col < this.currentTetromino.shape[row].length; col++) {
        if (this.currentTetromino.shape[row][col]) {
          const x = this.xPosition + col;
          const y = this.yPosition + row;

          // ボード内で重なる位置にすでにブロックがある場合はゲームオーバー
          if (y < 0 || (this.board[y] && this.board[y][x])) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * ゲームオーバー処理
   *
   * @returns {void}
   */
  gameOver() {
    // すでにゲームオーバーなら何もしない
    if (this.gameOverFlag) {
      return;
    }

    this.gameOverFlag = true; // ゲームオーバーフラグを立てる

    // ゲームループを停止
    cancelAnimationFrame(this.animationFrameId);

    // スコアを表示して再プレイするか選択してもらう
    const isConfirmed = confirm(
      `Your Score: ${this.score}\n再プレイしますか？`
    );

    // 再プレイしなければトップページへ、再プレイならスコアウィンドウをクリアしてリスタート
    if (!isConfirmed) {
      renderTopPage();
    } else {
      const newGame = new TetrisGame("tetris-board", "score-window");
      newGame.scoreWindow.innerHTML = `
        <h2>${newGame.score}</h2>
      `;
      newGame.startGame();
    }
  }
}

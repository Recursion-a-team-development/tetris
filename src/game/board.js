import { GAME_SETTINGS } from "./gameSetting.js";

export class Board {
  constructor(canvas, score) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.board = Array.from({ length: GAME_SETTINGS.BOARD_ROWS }, () =>
      Array(GAME_SETTINGS.BOARD_COLUMNS).fill(null)
    );
    this.score = score;
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
      this.score.updateScore(rowsToDelete.length);
    }
  }
}

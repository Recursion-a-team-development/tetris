import { GAME_SETTINGS } from "./gameSetting.js";

export class Tetromino {
  constructor(shape, color) {
    this.shape = shape;
    this.color = color;
  }

  /**
   * 新しいテトリスブロックをランダムに生成する
   *
   * @returns {Object} - 生成されたテトリスブロックの形状と色
   */
  static generateRandomTetromino() {
    const tetrominoes = [
      {
        shape: [
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        color: GAME_SETTINGS.COLORS.I,
      },
      {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: GAME_SETTINGS.COLORS.O,
      },
      {
        shape: [
          [1, 1, 0],
          [0, 1, 1],
          [0, 0, 0],
        ],
        color: GAME_SETTINGS.COLORS.Z,
      },
      {
        shape: [
          [0, 1, 1],
          [1, 1, 0],
          [0, 0, 0],
        ],
        color: GAME_SETTINGS.COLORS.S,
      },
      {
        shape: [
          [1, 0, 0],
          [1, 1, 1],
          [0, 0, 0],
        ],
        color: GAME_SETTINGS.COLORS.J,
      },
      {
        shape: [
          [0, 0, 1],
          [1, 1, 1],
          [0, 0, 0],
        ],
        color: GAME_SETTINGS.COLORS.L,
      },
      {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
          [0, 0, 0],
        ],
        color: GAME_SETTINGS.COLORS.T,
      },
    ];

    const randomIndex = Math.floor(Math.random() * tetrominoes.length);
    const { shape, color } = tetrominoes[randomIndex];
    return new Tetromino(shape, color);
  }

  /**
   * テトリスブロックを描画する
   *
   * @param {CanvasRenderingContext2D} ctx - 描画対象のコンテキスト
   * @param {number} offsetX - 描画のXオフセット
   * @param {number} offsetY - 描画のYオフセット
   * @param {string} color - ブロックの色
   * @returns {void}
   */
  drawTetromino(ctx, xPosition, yPosition, color) {
    ctx.fillStyle = color;

    for (let row = 0; row < this.shape.length; row++) {
      for (let col = 0; col < this.shape[row].length; col++) {
        if (this.shape[row][col]) {
          // ブロックの形で範囲を塗りつぶす
          ctx.fillRect(
            (xPosition + col) * GAME_SETTINGS.BLOCK_SIZE,
            (yPosition + row) * GAME_SETTINGS.BLOCK_SIZE,
            GAME_SETTINGS.BLOCK_SIZE,
            GAME_SETTINGS.BLOCK_SIZE
          );

          // ブロックの外周を線で描くことでグリッド線を疑似的に描画
          ctx.lineWidth = 1;
          ctx.strokeStyle = "gray"; // グリッド線の色
          ctx.strokeRect(
            (xPosition + col) * GAME_SETTINGS.BLOCK_SIZE,
            (yPosition + row) * GAME_SETTINGS.BLOCK_SIZE,
            GAME_SETTINGS.BLOCK_SIZE,
            GAME_SETTINGS.BLOCK_SIZE
          );
        }
      }
    }
  }

  /**
   * 次のテトリミノを描画する
   *
   * @param {CanvasRenderingContext2D} ctx - 描画対象のコンテキスト
   * @param {number} offsetX - 描画のXオフセット
   * @param {number} offsetY - 描画のYオフセット
   */
  drawNext(ctx, offsetX = 0, offsetY = 0) {
    const blockSize = GAME_SETTINGS.BLOCK_SIZE;

    // 次のテトリミノを描画
    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          ctx.fillStyle = this.color;
          ctx.fillRect(
            (x + offsetX) * blockSize,
            (y + offsetY) * blockSize,
            blockSize,
            blockSize
          );
          ctx.strokeRect(
            (x + offsetX) * blockSize,
            (y + offsetY) * blockSize,
            blockSize,
            blockSize
          );
        }
      });
    });
  }
}

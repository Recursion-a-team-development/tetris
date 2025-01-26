import { GAME_SETTINGS } from "./gameSetting.js";

export class Score {
  constructor(scoreWindow, playSoundEffect) {
    this.score = GAME_SETTINGS.INITIAL_SCORE;
    this.scoreWindow = scoreWindow;
    this.playSoundEffect = playSoundEffect;
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
}

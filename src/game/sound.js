export class Sound {
  constructor(soundEffects) {
    this.soundEffects = {}; // 効果音を格納するオブジェクト
    this.cacheSounds(soundEffects);
  }

  /**
   * 効果音をキャッシュ
   *
   * @param {Object} soundEffects - 効果音のキーとパスのペア
   * @returns {void}
   */
  cacheSounds(soundEffects) {
    for (const [key, soundPath] of Object.entries(soundEffects)) {
      const audio = new Audio(soundPath);
      this.soundEffects[key] = audio; // 音声をキャッシュ
    }
  }

  /**
   * 効果音を再生
   *
   * @param {string} soundKey - 効果音のキー
   * @returns {Promise<void>}
   */
  async playSoundEffect(soundKey) {
    const sound = this.soundEffects[soundKey];
    if (sound) {
      return new Promise((resolve, reject) => {
        sound.play().catch((error) => {
          console.error("効果音の再生に失敗しました: ", error);
          reject(error);
        });

        sound.onended = () => resolve();
      });
    } else {
      console.warn(`指定された音声 "${soundKey}" がキャッシュされていません`);
    }
  }
}

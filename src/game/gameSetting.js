import clearlineSound from "../assets/audio/sound-effect/clearline.mp3";

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
    CLEAR_LINE: clearlineSound,
  },
};

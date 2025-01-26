import Swiper from "swiper";
import { Navigation, Pagination, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import "../styles/instructions.css";
import arrowImage from "../assets/images/arrow.png";
import instructions1 from "../assets/images/instructions1.png";
import instructions2 from "../assets/images/instructions2.png";
import instructions3 from "../assets/images/instructions3.png";
Swiper.use([Navigation, Pagination, EffectCoverflow]);

/**
 * 説明画面をレンダリングする
 *
 * @function renderInstructionsPage
 * @returns {void}
 */
export function renderInstructionsPage() {
  const app = document.getElementById("app");
  app.innerHTML = `
  <div class="container mt-5">
    <div class="spacer"></div>

    <div class="swiper-container">
      <div class="swiper-wrapper">
        <div class="swiper-slide">
          <img src="${instructions1}" alt="説明1" />
        </div>
        <div class="swiper-slide">
          <img src="${instructions2}" alt="説明2" />
        </div>
        <div class="swiper-slide">
          <img src="${instructions3}" alt="説明3" />
        </div>
      </div>

      <!-- ページネーションとナビゲーション -->
      <div class="swiper-pagination"></div>
        <button class="swiper-button-prev">
        </button>
        <button class="swiper-button-next">
        </button>
      </div>
    </div>

    <button id="backToTopButton">TOP画面へ</button>
  </div>
  `;

  // TOP画面へボタン押下でTOP画面をレンダリング
  const backButton = document.getElementById("backToTopButton");
  backButton.addEventListener("click", () => {
    import("./top.js").then((module) => module.renderTopPage());
  });

  // Swiperの設定
  const swiper = new Swiper(".swiper-container", {
    // ドットインジケーターの表示
    pagination: {
      el: ".swiper-pagination",
    },

    // 前後スライドボタンを表示
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },

    loop: true, // ループの有効化

    slidesPerView: 1.2, // 表示するスライドの枚数
    centeredSlides: true, // スライドを中央揃えを有効化
    effect: "coverflow",
    coverflowEffect: {
      rotate: 0, // スライドの回転角度
      stretch: 50, // スライドの間隔（px単位）
      depth: 200, // 奥行きの設定（translateをZ方向にpx単位で移動）
      modifier: 1, // 効果の強さ
      slideShadows: true, // 先頭スライドのbox-shadowを有効化
    },

    // 前後スライドボタンに画像を設定
    on: {
      init: function () {
        document.querySelector(
          ".swiper-button-prev"
        ).style.backgroundImage = `url(${arrowImage})`;
        document.querySelector(
          ".swiper-button-next"
        ).style.backgroundImage = `url(${arrowImage})`;
      },
    },
  });
}

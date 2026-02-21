// ===== 設定値（後でここだけ変える） =====
const CIRCLE_INTERVAL = 20;   // 周期（秒）
const WARNING_TIME = 5;       // 警告を出す残り秒数

// ===== HTML要素取得 =====
const circleBtn = document.getElementById("circleBtn");
const circleTimer = document.getElementById("circleTimer");
const circleWarning = document.getElementById("circleWarning");

// ===== 状態管理 =====
let remainingTime = CIRCLE_INTERVAL;
let timerId = null;

// ===== ボタンが押されたとき =====
circleBtn.addEventListener("click", () => {
  // 二重起動防止
  if (timerId !== null) return;

  remainingTime = CIRCLE_INTERVAL;
  circleTimer.textContent = remainingTime + "秒";

  timerId = setInterval(() => {
    remainingTime--;

    // 表示更新
    circleTimer.textContent = remainingTime + "秒";

    // 警告表示制御
    if (remainingTime <= WARNING_TIME && remainingTime > 0) {
      circleWarning.style.display = "block";
    }

    // 0秒になったらリセット
    if (remainingTime === 0) {
      circleWarning.style.display = "none";
      remainingTime = CIRCLE_INTERVAL;
    }

  }, 1000);
});
// ===== 設定値 =====
const CIRCLE_INTERVAL = 19.15;
const GRAND_INTERVAL = 18;
const WARNING_TIME = 5;

const GRAND_SEQUENCE = ["rainbow", "rainbow", "yellow"];

// ===== 音声データ =====
const audioMap = {
  yellow: new Audio("audio/yellow_floor.wav"),
  rainbow: new Audio("audio/rainbow_floor.wav"),
};

Object.values(audioMap).forEach(a => a.preload = "auto");

// ===== HTML要素取得 =====
const circleBtn = document.getElementById("circleBtn");
const grandBtn = document.getElementById("grandBtn");
const timerText = document.getElementById("circleTimer");
const warningText = document.getElementById("circleWarning");
const resetBtn = document.getElementById("resetBtn");

// ===== 状態管理 =====
let activeMode = "none"; // none | circle | grand
let timerId = null;
let remainingTime = 0;
let warningPlayed = false;
let grandIndex = 0;

// ===== 音声再生のロック解除 =====
function unlockAudio() {
  Object.values(audioMap).forEach(audio => {
    audio.muted = true;
    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
    }).catch(() => {});
  });
}

// ===== タイマー開始関数 =====
function startTimer(interval, getNextFloor) {
  if (timerId !== null) clearInterval(timerId);

  const intervalMs = interval * 1000;
  let endTime = Date.now() + intervalMs;

  warningPlayed = false;
  warningText.style.display = "none";

  timerId = setInterval(() => {
    const now = Date.now();
    const remainingMs = endTime - now;
    const remainingSec = Math.max(0, remainingMs / 1000);

    // 表示（0.01秒単位）
    timerText.textContent = remainingSec.toFixed(2) + "秒";

    // ===== 警告：初めてWARNING_TIMEを下回った瞬間 =====
    if (
      remainingSec <= WARNING_TIME &&
      !warningPlayed &&
      remainingSec > 0
    ) {
      warningText.style.display = "block";

      const floor = getNextFloor();
      audioMap[floor].currentTime = 0;
      audioMap[floor].play();

      warningPlayed = true;
    }

    // ===== 床発生 =====
    if (remainingMs <= 0) {
      warningText.style.display = "none";

      // 次周期
      endTime = Date.now() + intervalMs;
      warningPlayed = false;
    }
  }, 10); // 0.01秒更新
}

// ===== サークルカラミティボタン =====
circleBtn.addEventListener("click", () => {
  unlockAudio();
  activeMode = "circle";

  startTimer(CIRCLE_INTERVAL, () => "yellow");
});

// ===== グランドカラミティボタン =====
grandBtn.addEventListener("click", () => {
  unlockAudio();
  activeMode = "grand";
  grandIndex = 0;

  startTimer(GRAND_INTERVAL, () => {
    const floor = GRAND_SEQUENCE[grandIndex];
    grandIndex = (grandIndex + 1) % GRAND_SEQUENCE.length;
    return floor;
  });
});

// ===== リセットボタン =====
resetBtn.addEventListener("click", () => {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }

  activeMode = "none";
  remainingTime = 0;
  warningPlayed = false;
  grandIndex = 0;

  timerText.textContent = "未発動";
  warningText.style.display = "none";
});
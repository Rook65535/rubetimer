// ===== 設定値 =====
const CIRCLE_FLOORS = [
  { name: "安置", interval: 23.4 },
  { name: "安置", interval: 20.8 },
  { name: "逆", interval: 23.4 },
  { name: "安置", interval: 20.8 },
  { name: "太い", interval: 25 },
  { name: "逆", interval: 20.8 },
];
const GRAND_INTERVAL = 23;
const WARNING_TIME = 5;
const GRAND_SEQUENCE = ["rainbow", "rainbow", "yellow"];

// ===== 音声データ =====
const audioMap = {
  yellow: new Audio("audio/yellow_floor.wav"),
  rainbow: new Audio("audio/rainbow_floor.wav"),
  // 必要なら安置・逆・太い用もここに追加
};

Object.values(audioMap).forEach(a => a.preload = "auto");

// ===== HTML要素取得 =====
const circleBtn = document.getElementById("circleBtn");
const grandBtn = document.getElementById("grandBtn");
const timerText = document.getElementById("circleTimer");
const warningText = document.getElementById("circleWarning");
const resetBtn = document.getElementById("resetBtn");
const nextFloorText = document.getElementById("nextFloor");

// ===== 状態管理 =====
let activeMode = "none"; // none | circle | grand
let timerId = null;
let warningPlayed = false;
let grandIndex = 0;
let currentFloor = null; // 床名文字列
let circleIndex = 0;     // サークルカラミティのサイクルインデックス

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
function startTimer(initialInterval, getNextFloor) {
  if (timerId !== null) clearInterval(timerId);

  let intervalMs = initialInterval * 1000;
  let endTime = Date.now() + intervalMs;

  currentFloor = getNextFloor();
  updateNextFloorDisplay();

  warningPlayed = false;

  timerId = setInterval(() => {
    const now = Date.now();
    const remainingMs = endTime - now;
    const remainingSec = Math.max(0, remainingMs / 1000);

    // 表示（0.01秒単位）
    timerText.textContent = remainingSec.toFixed(2) + "秒";

    // ===== 警告 =====
    // ===== 警告 =====
if (remainingSec <= WARNING_TIME && !warningPlayed && remainingSec > 0) {
  warningText.style.display = "block";

  // 音声再生（安置・逆・太い床用があれば audioMap[currentFloor] を使う）
  if (audioMap[currentFloor]) {
    audioMap[currentFloor].currentTime = 0;
    audioMap[currentFloor].play();
  }

  warningPlayed = true;
}

    // ===== 床発光 =====
    if (remainingMs <= 0) {
      warningText.style.display = "none";

      // 次周期の床を決定
      currentFloor = getNextFloor();
      updateNextFloorDisplay();

      // 次周期の間隔を設定
      if (activeMode === "circle") {
        intervalMs = CIRCLE_FLOORS[circleIndex].interval * 1000;
      } else if (activeMode === "grand") {
        intervalMs = GRAND_INTERVAL * 1000;
      }

      // 次周期
      endTime = Date.now() + intervalMs;
      warningPlayed = false;
    }
  }, 10); // 0.01秒更新
}

// ===== 次の床表示 =====
function updateNextFloorDisplay() {
  if (currentFloor === "yellow") {
    nextFloorText.textContent = "次の床：黄";
    nextFloorText.style.color = "gold";
  } else if (currentFloor === "rainbow") {
    nextFloorText.textContent = "次の床：虹";
    nextFloorText.style.color = "purple";
  } else if (["安置","逆","太い"].includes(currentFloor)) {
    nextFloorText.textContent = "次の床：" + currentFloor;
    nextFloorText.style.color = "black";
  } else {
    nextFloorText.textContent = "次の床：--";
    nextFloorText.style.color = "black";
  }
}

// ===== サークルカラミティボタン =====
circleBtn.addEventListener("click", () => {
  unlockAudio();
  activeMode = "circle";
  circleIndex = 0;

  startTimer(CIRCLE_FLOORS[circleIndex].interval, () => {
    const floor = CIRCLE_FLOORS[circleIndex].name;
    circleIndex = (circleIndex + 1) % CIRCLE_FLOORS.length;
    return floor;
  });
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
  warningPlayed = false;
  grandIndex = 0;
  circleIndex = 0;
  currentFloor = null;

  nextFloorText.textContent = "次の床：--";
  timerText.textContent = "未発動";
  warningText.style.display = "none";
});
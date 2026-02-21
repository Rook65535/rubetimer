const button = document.getElementById("circleBtn");
const timerText = document.getElementById("circleTimer");

button.addEventListener("click", () => {
  timerText.textContent = "押されました";
});
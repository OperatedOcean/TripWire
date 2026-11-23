const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const leftScoreElement = document.getElementById("leftScore");
const rightScoreElement = document.getElementById("rightScore");
const messageElement = document.getElementById("message");
const startButton = document.getElementById("startButton");

const paddleWidth = 16;
const paddleHeight = 110;
const paddleSpeed = 520;
const winningScore = 7;

const leftPaddle = {
  x: 28,
  y: canvas.height / 2 - paddleHeight / 2,
};

const rightPaddle = {
  x: canvas.width - 28 - paddleWidth,
  y: canvas.height / 2 - paddleHeight / 2,
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  vx: 360,
  vy: 180,
};

let leftScore = 0;
let rightScore = 0;
let running = false;
let gameOver = false;
let lastTime = 0;
const keys = new Set();

function resetBall(direction = Math.random() > 0.5 ? 1 : -1) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  const angle = (Math.random() * 0.8 - 0.4);
  const speed = 390;
  ball.vx = Math.cos(angle) * speed * direction;
  ball.vy = Math.sin(angle) * speed;
}

function resetGame() {
  leftScore = 0;
  rightScore = 0;
  leftScoreElement.textContent = "0";
  rightScoreElement.textContent = "0";
  leftPaddle.y = canvas.height / 2 - paddleHeight / 2;
  rightPaddle.y = canvas.height / 2 - paddleHeight / 2;
  gameOver = false;
  messageElement.textContent = "First to 7";
  resetBall();
}

function startGame() {
  if (gameOver) {
    resetGame();
  }
  running = true;
  startButton.textContent = "Pause";
  messageElement.textContent = "Playing";
  lastTime = performance.now();
}

function toggleGame() {
  if (!running) {
    startGame();
  } else {
    running = false;
    startButton.textContent = "Resume";
    messageElement.textContent = "Paused";
  }
}

function scorePoint(scoringSide) {
  if (scoringSide === "left") {
    leftScore += 1;
    leftScoreElement.textContent = leftScore;
  } else {
    rightScore += 1;
    rightScoreElement.textContent = rightScore;
  }

  if (leftScore >= winningScore || rightScore >= winningScore) {
    running = false;
    gameOver = true;
    messageElement.textContent = `${scoringSide === "left" ? "Blue" : "Red"} wins!`;
    startButton.textContent = "Play Again";
  } else {
    resetBall(scoringSide === "left" ? 1 : -1);
  }
}

function updatePaddles(delta) {
  if (keys.has("w")) leftPaddle.y -= paddleSpeed * delta;
  if (keys.has("s")) leftPaddle.y += paddleSpeed * delta;
  if (keys.has("arrowup")) rightPaddle.y -= paddleSpeed * delta;
  if (keys.has("arrowdown")) rightPaddle.y += paddleSpeed * delta;

  leftPaddle.y = Math.max(0, Math.min(canvas.height - paddleHeight, leftPaddle.y));
  rightPaddle.y = Math.max(0, Math.min(canvas.height - paddleHeight, rightPaddle.y));
}

function hitsPaddle(paddle) {
  return (
    ball.x - ball.radius <= paddle.x + paddleWidth &&
    ball.x + ball.radius >= paddle.x &&
    ball.y + ball.radius >= paddle.y &&
    ball.y - ball.radius <= paddle.y + paddleHeight
  );
}

function updateBall(delta) {
  ball.x += ball.vx * delta;
  ball.y += ball.vy * delta;

  if (ball.y - ball.radius <= 0 && ball.vy < 0) {
    ball.y = ball.radius;
    ball.vy *= -1;
  }
  if (ball.y + ball.radius >= canvas.height && ball.vy > 0) {
    ball.y = canvas.height - ball.radius;
    ball.vy *= -1;
  }

  if (hitsPaddle(leftPaddle) && ball.vx < 0) {
    ball.x = leftPaddle.x + paddleWidth + ball.radius;
    const impact = (ball.y - (leftPaddle.y + paddleHeight / 2)) / (paddleHeight / 2);
    const speed = Math.min(Math.hypot(ball.vx, ball.vy) + 18, 720);
    ball.vx = Math.cos(impact * 0.9) * speed;
    ball.vy = Math.sin(impact * 0.9) * speed;
  }

  if (hitsPaddle(rightPaddle) && ball.vx > 0) {
    ball.x = rightPaddle.x - ball.radius;
    const impact = (ball.y - (rightPaddle.y + paddleHeight / 2)) / (paddleHeight / 2);
    const speed = Math.min(Math.hypot(ball.vx, ball.vy) + 18, 720);
    ball.vx = -Math.cos(impact * 0.9) * speed;
    ball.vy = Math.sin(impact * 0.9) * speed;
  }

  if (ball.x + ball.radius < 0) scorePoint("right");
  if (ball.x - ball.radius > canvas.width) scorePoint("left");
}

function draw() {
  context.fillStyle = "#080d18";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "rgba(255, 255, 255, 0.16)";
  for (let y = 12; y < canvas.height; y += 32) {
    context.fillRect(canvas.width / 2 - 2, y, 4, 16);
  }

  context.fillStyle = "#60a5fa";
  context.fillRect(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight);
  context.fillStyle = "#f87171";
  context.fillRect(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight);

  context.fillStyle = "#fff";
  context.beginPath();
  context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  context.fill();
}

function frame(timestamp) {
  const delta = Math.min((timestamp - lastTime) / 1000, 0.02);
  lastTime = timestamp;

  if (running) {
    updatePaddles(delta);
    updateBall(delta);
  }

  draw();
  requestAnimationFrame(frame);
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["w", "s", "arrowup", "arrowdown", " "].includes(key)) {
    event.preventDefault();
  }
  if (key === " ") {
    toggleGame();
  } else {
    keys.add(key);
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

startButton.addEventListener("click", toggleGame);

resetGame();
draw();
requestAnimationFrame(frame);

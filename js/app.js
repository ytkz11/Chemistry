const GAME_TIME = 60;

let questions = [];
let p1 = { idx: 0, answered: 0, correct: 0, wrong: 0, locked: false };
let p2 = { idx: 0, answered: 0, correct: 0, wrong: 0, locked: false };
let timer = null;
let timeLeft = GAME_TIME;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startGame() {
  questions = shuffle(QUESTIONS);
  timeLeft = GAME_TIME;
  p1 = { idx: 0, answered: 0, correct: 0, wrong: 0, locked: false };
  p2 = { idx: 0, answered: 0, correct: 0, wrong: 0, locked: false };

  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('result-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'flex';

  updateScores();
  renderQuestion('p1');
  renderQuestion('p2');
  startTimer();
}

function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    const el = document.getElementById('timer');
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    el.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    el.classList.toggle('danger', timeLeft <= 10);

    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame();
    }
  }, 1000);
}

function renderQuestion(player) {
  const state = player === 'p1' ? p1 : p2;
  const side = document.querySelector(`.${player}`);

  if (state.idx >= questions.length) {
    side.querySelector('.question-box').textContent = '已完成所有题目!';
    side.querySelector('.options').innerHTML = '';
    return;
  }

  const q = questions[state.idx];
  const numEl = side.closest('.player-side').querySelector('.q-num');
  if (numEl) numEl.textContent = `第 ${state.idx + 1} / ${questions.length} 题`;

  side.querySelector('.question-box').textContent = q.q;
  side.querySelector('.options').innerHTML = q.opts.map((opt, i) =>
    `<button class="option-btn" data-idx="${i}">${String.fromCharCode(65 + i)}. ${opt}</button>`
  ).join('');

  state.locked = false;

  side.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => handleAnswer(player, parseInt(btn.dataset.idx)));
  });
}

function handleAnswer(player, idx) {
  const state = player === 'p1' ? p1 : p2;
  if (state.locked || state.idx >= questions.length) return;

  const q = questions[state.idx];
  const isCorrect = idx === q.ans;
  const side = document.querySelector(`.${player}`);
  const btns = side.querySelectorAll('.option-btn');

  btns.forEach(btn => {
    btn.disabled = true;
    const bIdx = parseInt(btn.dataset.idx);
    if (bIdx === q.ans) btn.classList.add('show-correct');
    if (bIdx === idx && !isCorrect) btn.classList.add('selected-wrong');
    if (bIdx === idx && isCorrect) btn.classList.add('selected-correct');
  });

  state.locked = true;
  state.answered++;
  if (isCorrect) state.correct++; else state.wrong++;

  updateScores();

  setTimeout(() => {
    state.idx++;
    renderQuestion(player);
  }, 500);
}

function updateScores() {
  document.getElementById('p1-correct').textContent = p1.correct;
  document.getElementById('p1-wrong').textContent = p1.wrong;
  document.getElementById('p2-correct').textContent = p2.correct;
  document.getElementById('p2-wrong').textContent = p2.wrong;
}

function endGame() {
  clearInterval(timer);
  document.getElementById('game-screen').style.display = 'none';
  document.getElementById('result-screen').style.display = 'flex';

  document.getElementById('p1-final').textContent = p1.correct;
  document.getElementById('p1-detail-correct').textContent = p1.correct;
  document.getElementById('p1-detail-wrong').textContent = p1.wrong;
  document.getElementById('p1-detail-total').textContent = p1.answered;

  document.getElementById('p2-final').textContent = p2.correct;
  document.getElementById('p2-detail-correct').textContent = p2.correct;
  document.getElementById('p2-detail-wrong').textContent = p2.wrong;
  document.getElementById('p2-detail-total').textContent = p2.answered;

  const winnerEl = document.getElementById('winner-text');
  if (p1.correct > p2.correct) {
    winnerEl.textContent = '左边玩家获胜!';
    winnerEl.style.color = 'var(--p1)';
  } else if (p2.correct > p1.correct) {
    winnerEl.textContent = '右边玩家获胜!';
    winnerEl.style.color = 'var(--p2)';
  } else {
    winnerEl.textContent = '平局!';
    winnerEl.style.color = '#f9ab00';
  }
}

document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-restart').addEventListener('click', startGame);

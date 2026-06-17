const GAME_TIME = 60;

let questions = [];
let p1 = { answered: 0, correct: 0, wrong: 0, locked: false };
let p2 = { answered: 0, correct: 0, wrong: 0, locked: false };
let timer = null;
let timeLeft = GAME_TIME;
let qIndex = 0;

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
  qIndex = 0;
  timeLeft = GAME_TIME;
  p1 = { answered: 0, correct: 0, wrong: 0, locked: false };
  p2 = { answered: 0, correct: 0, wrong: 0, locked: false };

  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('result-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'flex';

  updateScores();
  renderQuestion();
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

function renderQuestion() {
  if (qIndex >= questions.length) {
    endGame();
    return;
  }

  const q = questions[qIndex];
  document.getElementById('q-number').textContent = `第 ${qIndex + 1} / ${questions.length} 题`;
  document.getElementById('q-category').textContent = q.cat;

  const optsHtml = q.opts.map((opt, i) =>
    `<button class="option-btn" data-idx="${i}">${String.fromCharCode(65 + i)}. ${opt}</button>`
  ).join('');

  document.querySelector('.p1 .question-box').textContent = q.q;
  document.querySelector('.p1 .options').innerHTML = optsHtml;
  document.querySelector('.p2 .question-box').textContent = q.q;
  document.querySelector('.p2 .options').innerHTML = optsHtml;

  p1.locked = false;
  p2.locked = false;

  document.querySelectorAll('.p1 .option-btn').forEach(btn => {
    btn.addEventListener('click', () => handleAnswer('p1', parseInt(btn.dataset.idx)));
  });
  document.querySelectorAll('.p2 .option-btn').forEach(btn => {
    btn.addEventListener('click', () => handleAnswer('p2', parseInt(btn.dataset.idx)));
  });
}

function handleAnswer(player, idx) {
  if (player === 'p1' && p1.locked) return;
  if (player === 'p2' && p2.locked) return;

  const q = questions[qIndex];
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

  if (player === 'p1') {
    p1.locked = true;
    p1.answered++;
    if (isCorrect) p1.correct++; else p1.wrong++;
  } else {
    p2.locked = true;
    p2.answered++;
    if (isCorrect) p2.correct++; else p2.wrong++;
  }

  updateScores();

  if (p1.locked && p2.locked) {
    setTimeout(() => {
      qIndex++;
      renderQuestion();
    }, 600);
  }
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

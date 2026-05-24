(function () {
  'use strict';

  var params    = new URLSearchParams(window.location.search);
  var quizMode  = params.get('quiz') === '1';
  var totalQ    = Number(params.get('q')) || 5;
  var qNum      = 1;
  var score     = 0;
  var answered  = false;

  var hudEl      = document.getElementById('hud');
  var starsA     = document.getElementById('starsA');
  var starsB     = document.getElementById('starsB');
  var equationEl = document.getElementById('equation');
  var choiceGrid = document.getElementById('choiceGrid');
  var feedbackEl = document.getElementById('feedback');
  var btnNext    = document.getElementById('btnNext');

  function randInt(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }

  function updateHUD() {
    hudEl.textContent = quizMode ? ('Soalan ' + qNum + ' / ' + totalQ) : '';
  }

  function renderStars(container, n) {
    container.innerHTML = '';
    if (n > 9) return;
    for (var i = 0; i < n; i++) {
      var span = document.createElement('span');
      span.className = 'math-star';
      span.style.animationDelay = (i * 50) + 'ms';
      span.textContent = '⭐';
      container.appendChild(span);
    }
  }

  function makeChoices(correct, min, max) {
    var choices = [correct];
    var attempts = 0;
    while (choices.length < 4 && attempts < 40) {
      var offset = randInt(1, 4) * (Math.random() < 0.5 ? 1 : -1);
      var d = correct + offset;
      if (d >= min && d <= max && choices.indexOf(d) === -1) choices.push(d);
      attempts++;
    }
    for (var v = min; choices.length < 4 && v <= max; v++) {
      if (choices.indexOf(v) === -1) choices.push(v);
    }
    return choices.sort(function () { return Math.random() - 0.5; });
  }

  function newQuestion() {
    answered = false;
    feedbackEl.style.display = 'none';
    btnNext.style.display    = 'none';
    updateHUD();

    var a = randInt(2, 10);
    var b = randInt(1, a - 1);
    var correct = a - b;

    renderStars(starsA, a);
    renderStars(starsB, b);
    equationEl.textContent = a + ' − ' + b + ' = ?';

    var choices = makeChoices(correct, 1, 9);
    choiceGrid.innerHTML = '';
    choices.forEach(function (val) {
      var btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = val;
      btn.addEventListener('click', function () {
        if (answered) return;
        answered = true;
        if (window.SoundFX) SoundFX.click();
        handleAnswer(val === correct, correct, btn);
      });
      choiceGrid.appendChild(btn);
    });
  }

  function handleAnswer(isCorrect, correct, clickedBtn) {
    choiceGrid.querySelectorAll('.choice-btn').forEach(function (b) {
      if (Number(b.textContent) === correct) b.classList.add('correct');
    });
    if (!isCorrect) clickedBtn.classList.add('wrong');

    if (isCorrect) {
      score++;
      if (window.SoundFX) SoundFX.correct();
      if (window.Mascot)  Mascot.happy(600);
    } else {
      if (window.SoundFX) SoundFX.wrong();
      if (window.Mascot)  Mascot.sad(800);
    }

    if (quizMode) {
      setTimeout(function () {
        if (qNum >= totalQ) {
          finishQuiz();
        } else {
          qNum++;
          newQuestion();
        }
      }, 750);
    } else {
      feedbackEl.style.display = 'block';
      feedbackEl.style.color   = isCorrect ? 'green' : '#c0392b';
      feedbackEl.textContent   = isCorrect ? '✅ Betul! Hebat!' : '❌ Salah! Jawapan: ' + correct;
      btnNext.style.display = 'inline-block';
    }
  }

  function finishQuiz() {
    var wrong = totalQ - score;
    var acc   = Math.round((score / totalQ) * 100);
    location.href = 'quiz_result.html?betul=' + score + '&salah=' + wrong + '&acc=' + acc;
  }

  window.nextQuestion = function () {
    if (!quizMode) { qNum++; newQuestion(); }
  };

  newQuestion();
})();

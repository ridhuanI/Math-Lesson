(function () {
  'use strict';

  var OBJECTS = ['⭐','🍎','🐟','🌸','🎈','🦋','🍦','🌈','🎁','🐣','🍭','🏀'];

  var params     = new URLSearchParams(window.location.search);
  var quizMode   = params.get('quiz') === '1';
  var totalQ     = Number(params.get('q')) || 10;
  var questionNum = 1;
  var score      = 0;
  var answered   = false;
  var currentCount = 0;

  var emojiDisplay = document.getElementById('emojiDisplay');
  var choiceGrid   = document.getElementById('choiceGrid');
  var feedbackEl   = document.getElementById('feedback');
  var hudEl        = document.getElementById('hud');
  var btnNext      = document.getElementById('btnNext');

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function updateHUD() {
    hudEl.textContent = quizMode ? ('Soalan ' + questionNum + ' / ' + totalQ) : '';
  }

  function renderQuestion() {
    answered    = false;
    feedbackEl.style.display = 'none';
    btnNext.style.display    = 'none';
    updateHUD();

    currentCount = Math.floor(Math.random() * 10) + 1;
    var emoji    = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];

    emojiDisplay.innerHTML = '';
    for (var i = 0; i < currentCount; i++) {
      (function (idx) {
        var el = document.createElement('span');
        el.className = 'emoji-item';
        el.textContent = emoji;
        el.style.animationDelay = (idx * 0.07) + 's';
        emojiDisplay.appendChild(el);
      })(i);
    }

    var choices = [currentCount];
    while (choices.length < 4) {
      var n = Math.floor(Math.random() * 10) + 1;
      if (choices.indexOf(n) === -1) choices.push(n);
    }
    choices = shuffle(choices);

    choiceGrid.innerHTML = '';
    choices.forEach(function (n) {
      var btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = n;
      btn.addEventListener('click', function () {
        if (answered) return;
        answered = true;
        if (window.SoundFX) SoundFX.click();
        handleAnswer(n === currentCount, btn, n);
      });
      choiceGrid.appendChild(btn);
    });
  }

  function handleAnswer(isCorrect, btn, chosen) {
    choiceGrid.querySelectorAll('.choice-btn').forEach(function (b) {
      if (Number(b.textContent) === currentCount) b.classList.add('correct');
      else if (b === btn && !isCorrect)            b.classList.add('wrong');
    });

    if (isCorrect) {
      if (window.SoundFX) SoundFX.correct();
      if (window.Mascot)  Mascot.happy();
      score++;
    } else {
      if (window.SoundFX) SoundFX.wrong();
      if (window.Mascot)  Mascot.sad();
    }

    if (quizMode) {
      if (questionNum >= totalQ) {
        setTimeout(finishQuiz, 700);
      } else {
        questionNum++;
        setTimeout(renderQuestion, 750);
      }
    } else {
      feedbackEl.style.display = 'block';
      feedbackEl.style.color   = isCorrect ? 'green' : 'red';
      feedbackEl.textContent   = isCorrect ? '✅ Betul! Hebat!' : '❌ Salah! Jawapan: ' + currentCount;
      btnNext.style.display    = 'inline-block';
    }
  }

  function finishQuiz() {
    var wrong = totalQ - score;
    var acc   = Math.round((score / totalQ) * 100);
    location.href = 'quiz_result.html?betul=' + score + '&salah=' + wrong + '&acc=' + acc;
  }

  window.nextQuestion = function () {
    if (!quizMode) { questionNum++; renderQuestion(); }
  };

  renderQuestion();
})();

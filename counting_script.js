(function () {
  'use strict';

  var OBJECTS = [
    '⭐','🍎','🐟','🌸','🎈','🦋','🍦','🌈','🎁','🐣','🍭','🏀',
    '🌻','🍊','🎃','🌙','🍓','🍇','🎵','🚀','🎄','🌴','🐠','🎀'
  ];

  var params      = new URLSearchParams(window.location.search);
  var quizMode    = params.get('quiz') === '1';
  var totalQ      = Number(params.get('q')) || 10;
  var questionNum  = 1;
  var score       = 0;
  var answered    = false;
  var currentCount = 0;
  var currentType  = 'count';

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
    answered = false;
    feedbackEl.style.display = 'none';
    btnNext.style.display    = 'none';
    updateHUD();

    currentCount = Math.floor(Math.random() * 10) + 1;
    var emoji    = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
    currentType  = Math.random() < 0.5 ? 'count' : 'reverse';

    emojiDisplay.innerHTML = '';
    choiceGrid.innerHTML   = '';

    if (currentType === 'count') {
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

    } else {
      emojiDisplay.innerHTML =
        '<div style="font-size:90px;font-weight:700;color:#ff6600;line-height:1;">' + currentCount + '</div>';

      var counts = [currentCount];
      while (counts.length < 4) {
        var m = Math.floor(Math.random() * 10) + 1;
        if (counts.indexOf(m) === -1) counts.push(m);
      }
      counts = shuffle(counts);
      counts.forEach(function (n) {
        var btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.dataset.count = String(n);
        btn.style.padding = '10px 6px';
        var strip = '';
        for (var k = 0; k < n; k++) strip += emoji;
        btn.innerHTML = '<div style="font-size:14px;line-height:1.5;word-break:break-all;text-align:center;">' + strip + '</div>';
        btn.addEventListener('click', function () {
          if (answered) return;
          answered = true;
          if (window.SoundFX) SoundFX.click();
          handleAnswer(n === currentCount, btn, n);
        });
        choiceGrid.appendChild(btn);
      });
    }
  }

  function handleAnswer(isCorrect, btn, chosen) {
    choiceGrid.querySelectorAll('.choice-btn').forEach(function (b) {
      var isCorrectBtn = currentType === 'count'
        ? Number(b.textContent) === currentCount
        : b.dataset.count === String(currentCount);
      if (isCorrectBtn) b.classList.add('correct');
      else if (b === btn && !isCorrect) b.classList.add('wrong');
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

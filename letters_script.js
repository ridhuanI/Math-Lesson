(function () {
  'use strict';

  var LETTERS = [
    { letter:'A', word:'Ayam',   emoji:'🐔', color:'#FF6B6B' },
    { letter:'B', word:'Bola',   emoji:'⚽', color:'#4ECDC4' },
    { letter:'C', word:'Cacing', emoji:'🪱', color:'#FFD93D' },
    { letter:'D', word:'Duit',   emoji:'💰', color:'#6BCB77' },
    { letter:'E', word:'Epal',   emoji:'🍎', color:'#FF8B94' },
    { letter:'F', word:'Filem',  emoji:'🎬', color:'#A8D8EA' },
    { letter:'G', word:'Gajah',  emoji:'🐘', color:'#F7CAC9' },
    { letter:'H', word:'Harimau',emoji:'🐯', color:'#92A8D1' },
    { letter:'I', word:'Ikan',   emoji:'🐟', color:'#88B04B' },
    { letter:'J', word:'Jambu',  emoji:'🍑', color:'#F7786B' },
    { letter:'K', word:'Kucing', emoji:'🐱', color:'#955251' },
    { letter:'L', word:'Lembu',  emoji:'🐄', color:'#B5838D' },
    { letter:'M', word:'Monyet', emoji:'🐒', color:'#E8A87C' },
    { letter:'N', word:'Naga',   emoji:'🐲', color:'#84B1ED' },
    { letter:'O', word:'Orkid',  emoji:'🌸', color:'#F18F01' },
    { letter:'P', word:'Pisang', emoji:'🍌', color:'#C73E1D' },
    { letter:'Q', word:'Qatar',  emoji:'🏁', color:'#3B6BC4' },
    { letter:'R', word:'Rusa',   emoji:'🦌', color:'#44BBA4' },
    { letter:'S', word:'Singa',  emoji:'🦁', color:'#E94F37' },
    { letter:'T', word:'Tikus',  emoji:'🐭', color:'#6B8F71' },
    { letter:'U', word:'Ular',   emoji:'🐍', color:'#3F88C5' },
    { letter:'V', word:'Violin', emoji:'🎻', color:'#8B5E3C' },
    { letter:'W', word:'Wau',    emoji:'🪁', color:'#44CF6C' },
    { letter:'X', word:'Xilofon',emoji:'🎵', color:'#7B2D8B' },
    { letter:'Y', word:'Yoyo',   emoji:'🪀', color:'#FF9A3C' },
    { letter:'Z', word:'Zirafah',emoji:'🦒', color:'#F9A620' },
  ];

  var params      = new URLSearchParams(window.location.search);
  var quizMode    = params.get('quiz') === '1';
  var totalQ      = Number(params.get('q')) || 10;
  var questionNum  = 1;
  var score       = 0;
  var answered    = false;
  var currentMode = 1;

  var hudEl        = document.getElementById('hud');
  var modeRow      = document.getElementById('modeRow');
  var questionCard = document.getElementById('questionCard');
  var promptEl     = document.getElementById('promptText');
  var choiceGrid   = document.getElementById('choiceGrid');
  var feedbackEl   = document.getElementById('feedback');
  var btnNext      = document.getElementById('btnNext');

  if (quizMode) modeRow.style.display = 'none';

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

  window.setMode = function (mode, btn) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    renderQuestion();
  };

  function renderQuestion() {
    answered = false;
    feedbackEl.style.display = 'none';
    btnNext.style.display    = 'none';
    updateHUD();

    var mode   = quizMode ? (Math.random() < 0.5 ? 1 : 2) : currentMode;
    var target = LETTERS[Math.floor(Math.random() * LETTERS.length)];

    if (mode === 1) {
      // Show big letter → pick the correct letter
      questionCard.innerHTML =
        '<div class="letter-display" style="background:' + target.color + ';">' + target.letter + '</div>' +
        '<div class="word-hint">' + target.word + '</div>';
      promptEl.textContent = 'Apakah huruf ini?';
    } else {
      // Show emoji + word → pick the first letter
      questionCard.innerHTML =
        '<div class="emoji-hint">' + target.emoji + '</div>' +
        '<div class="word-hint" style="font-size:28px;font-weight:700;">' + target.word + '</div>';
      promptEl.textContent = 'Apakah huruf pertama?';
    }

    var pool = [target.letter];
    while (pool.length < 4) {
      var l = LETTERS[Math.floor(Math.random() * LETTERS.length)].letter;
      if (pool.indexOf(l) === -1) pool.push(l);
    }
    pool = shuffle(pool);

    choiceGrid.innerHTML = '';
    pool.forEach(function (ch) {
      var btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = ch;
      btn.addEventListener('click', function () {
        if (answered) return;
        answered = true;
        if (window.SoundFX) SoundFX.click();
        handleAnswer(ch === target.letter, target.letter, btn);
      });
      choiceGrid.appendChild(btn);
    });
  }

  function handleAnswer(isCorrect, correctLetter, btn) {
    choiceGrid.querySelectorAll('.choice-btn').forEach(function (b) {
      if (b.textContent === correctLetter) b.classList.add('correct');
      else if (b === btn && !isCorrect)    b.classList.add('wrong');
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
      feedbackEl.textContent   = isCorrect ? '✅ Betul! Hebat!' : '❌ Salah! Huruf ' + correctLetter;
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

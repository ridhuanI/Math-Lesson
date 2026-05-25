(function () {
  'use strict';

  var WORDS = [
    { suku:['ba','tu'],    word:'batu',   emoji:'🪨' },
    { suku:['bu','ku'],    word:'buku',   emoji:'📚' },
    { suku:['bi','ru'],    word:'biru',   emoji:'💙' },
    { suku:['bo','la'],    word:'bola',   emoji:'⚽' },
    { suku:['ka','ki'],    word:'kaki',   emoji:'🦶' },
    { suku:['ma','ta'],    word:'mata',   emoji:'👁️' },
    { suku:['ku','da'],    word:'kuda',   emoji:'🐴' },
    { suku:['i','kan'],    word:'ikan',   emoji:'🐟' },
    { suku:['ru','mah'],   word:'rumah',  emoji:'🏠' },
    { suku:['su','su'],    word:'susu',   emoji:'🥛' },
    { suku:['na','si'],    word:'nasi',   emoji:'🍚' },
    { suku:['ku','ci','ng'], word:'kucing', emoji:'🐱' },
    { suku:['a','yam'],    word:'ayam',   emoji:'🐔' },
    { suku:['pi','sau'],   word:'pisau',  emoji:'🔪' },
    { suku:['ta','ngan'],  word:'tangan', emoji:'✋' },
  ];

  var params    = new URLSearchParams(location.search);
  var quizMode  = params.get('quiz') === '1';
  var quizTotal = parseInt(params.get('q')) || 0;
  var qNum = 0, betul = 0, salah = 0;
  var currentMode = 'kenal';
  var currentWord = null;
  var answered = false;

  var qDisplay   = document.getElementById('qDisplay');
  var choiceGrid = document.getElementById('choiceGrid');
  var feedback   = document.getElementById('feedback');
  var btnNext    = document.getElementById('btnNext');
  var hud        = document.getElementById('hud');

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function updateHud() {
    if (quizMode) {
      hud.textContent = 'Soalan ' + (qNum + 1) + ' / ' + quizTotal;
    } else {
      hud.textContent = '✅ ' + betul + '  ❌ ' + salah;
    }
  }

  function setMode(mode, btn) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(function (b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    if (!quizMode) { qNum = 0; betul = 0; salah = 0; }
    nextQuestion();
  }
  window.setMode = setMode;

  function nextQuestion() {
    answered = false;
    feedback.style.display = 'none';
    btnNext.style.display = 'none';
    choiceGrid.innerHTML = '';

    if (quizMode && qNum >= quizTotal) {
      var acc = Math.round(betul / quizTotal * 100);
      location.href = 'quiz_result.html?betul=' + betul + '&salah=' + salah + '&acc=' + acc;
      return;
    }

    currentWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    updateHud();
    renderQuestion();
  }
  window.nextQuestion = nextQuestion;

  function renderQuestion() {
    var w = currentWord;

    if (currentMode === 'kenal') {
      qDisplay.innerHTML =
        '<div class="word-emoji">' + w.emoji + '</div>' +
        '<div class="suku-display">' + w.suku.join('-') + '</div>';
      renderSyllableChoices(w.suku[0]);

    } else if (currentMode === 'bina') {
      var rest = w.suku.slice(1).join('-');
      qDisplay.innerHTML =
        '<div class="word-emoji">' + w.emoji + '</div>' +
        '<div class="suku-display"><span class="blank-suku">__</span>-' + rest + '</div>';
      renderSyllableChoices(w.suku[0]);

    } else {
      qDisplay.innerHTML = '<div class="suku-display">' + w.suku[0] + '</div>' +
        '<div style="font-size:14px;color:#aaa;margin-top:6px;">Pilih perkataan yang bermula dengan suku kata ini</div>';
      renderEmojiChoices(w);
    }
  }

  function renderSyllableChoices(correct) {
    var pool = [];
    WORDS.forEach(function (wd) {
      if (wd.suku[0] !== correct && pool.indexOf(wd.suku[0]) === -1) {
        pool.push(wd.suku[0]);
      }
    });
    var choices = shuffle([correct].concat(shuffle(pool).slice(0, 3)));
    choices.forEach(function (syl) {
      var btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = syl;
      btn.addEventListener('click', function () {
        handleAnswer(syl === correct, correct, btn);
      });
      choiceGrid.appendChild(btn);
    });
  }

  function renderEmojiChoices(correctWord) {
    var pool = WORDS.filter(function (wd) {
      return wd !== correctWord && wd.suku[0] !== correctWord.suku[0];
    });
    var choices = shuffle([correctWord].concat(shuffle(pool).slice(0, 3)));
    choices.forEach(function (wd) {
      var btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = wd.emoji;
      btn.style.fontSize = '40px';
      btn.addEventListener('click', function () {
        handleAnswer(wd === correctWord, correctWord.emoji, btn);
      });
      choiceGrid.appendChild(btn);
    });
  }

  function handleAnswer(isCorrect, correctDisplay, clickedBtn) {
    if (answered) return;
    answered = true;

    if (isCorrect) {
      betul++;
      clickedBtn.classList.add('correct');
      feedback.textContent = '✅ Betul!';
      feedback.style.display = 'block';
      if (window.SoundFX) SoundFX.correct();
      if (window.Mascot) Mascot.happy();
      if (quizMode) { qNum++; setTimeout(nextQuestion, 750); }
      else { btnNext.style.display = 'inline-block'; }
    } else {
      salah++;
      clickedBtn.classList.add('wrong');
      choiceGrid.querySelectorAll('.choice-btn').forEach(function (b) {
        if (b.textContent === correctDisplay) b.classList.add('correct');
      });
      feedback.textContent = '❌ Cuba lagi!';
      feedback.style.display = 'block';
      if (window.SoundFX) SoundFX.wrong();
      if (window.Mascot) Mascot.sad();
      if (quizMode) { qNum++; setTimeout(nextQuestion, 1200); }
      else { btnNext.style.display = 'inline-block'; }
    }
    updateHud();
  }

  nextQuestion();
})();

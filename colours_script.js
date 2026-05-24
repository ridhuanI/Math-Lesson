(function () {
  'use strict';

  var COLORS = [
    { id:'merah',       name:'Merah',       hex:'#E74C3C' },
    { id:'biru',        name:'Biru',        hex:'#3498DB' },
    { id:'kuning',      name:'Kuning',      hex:'#F1C40F' },
    { id:'hijau',       name:'Hijau',       hex:'#2ECC71' },
    { id:'oren',        name:'Oren',        hex:'#E67E22' },
    { id:'ungu',        name:'Ungu',        hex:'#9B59B6' },
    { id:'merah-jambu', name:'Merah Jambu', hex:'#FF69B4' },
    { id:'coklat',      name:'Coklat',      hex:'#8B6914' },
  ];

  var params    = new URLSearchParams(window.location.search);
  var quizMode  = params.get('quiz') === '1';
  var totalQ    = Number(params.get('q')) || 8;
  var qNum      = 1;
  var score     = 0;
  var answered  = false;
  var mode      = 'nama';

  var hudEl         = document.getElementById('hud');
  var colourDisplay = document.getElementById('colourDisplay');
  var choiceGrid    = document.getElementById('choiceGrid');
  var swatchGrid    = document.getElementById('swatchGrid');
  var feedbackEl    = document.getElementById('feedback');
  var btnNext       = document.getElementById('btnNext');

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function updateHUD() {
    hudEl.textContent = quizMode ? ('Soalan ' + qNum + ' / ' + totalQ) : '';
  }

  function showQuestion() {
    answered = false;
    feedbackEl.style.display = 'none';
    btnNext.style.display    = 'none';
    updateHUD();

    var shuffled = shuffle(COLORS);
    var target   = shuffled[0];
    var pool     = shuffled.slice(0, 4);

    colourDisplay.innerHTML = '';
    choiceGrid.innerHTML    = '';
    swatchGrid.innerHTML    = '';

    if (mode === 'nama') {
      choiceGrid.style.display = '';
      swatchGrid.style.display = 'none';

      var circle = document.createElement('div');
      circle.className = 'colour-display';
      circle.style.background = target.hex;
      colourDisplay.appendChild(circle);

      pool.forEach(function (c) {
        var btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.style.fontSize = '20px';
        btn.textContent = c.name;
        btn.addEventListener('click', function () {
          if (answered) return;
          answered = true;
          if (window.SoundFX) SoundFX.click();
          handleAnswer(c.id === target.id, target, btn, 'text');
        });
        choiceGrid.appendChild(btn);
      });

    } else {
      choiceGrid.style.display = 'none';
      swatchGrid.style.display = '';

      var nameEl = document.createElement('div');
      nameEl.className = 'colour-name-display';
      nameEl.textContent = target.name;
      colourDisplay.appendChild(nameEl);

      pool.forEach(function (c) {
        var item = document.createElement('div');
        item.className = 'swatch-item';

        var btn = document.createElement('button');
        btn.className = 'colour-swatch-btn';
        btn.style.background = c.hex;
        btn.dataset.colorId = c.id;
        btn.addEventListener('click', function () {
          if (answered) return;
          answered = true;
          if (window.SoundFX) SoundFX.click();
          handleAnswer(c.id === target.id, target, btn, 'swatch');
        });

        var label = document.createElement('span');
        label.className = 'swatch-label';
        label.textContent = c.name;

        item.appendChild(btn);
        item.appendChild(label);
        swatchGrid.appendChild(item);
      });
    }
  }

  function handleAnswer(isCorrect, target, clickedBtn, type) {
    if (type === 'text') {
      choiceGrid.querySelectorAll('.choice-btn').forEach(function (b) {
        if (b.textContent === target.name) b.classList.add('correct');
      });
      if (!isCorrect) clickedBtn.classList.add('wrong');
    } else {
      swatchGrid.querySelectorAll('.colour-swatch-btn').forEach(function (b) {
        if (b.dataset.colorId === target.id) b.classList.add('correct');
      });
      if (!isCorrect) clickedBtn.classList.add('wrong');
    }

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
          showQuestion();
        }
      }, 750);
    } else {
      feedbackEl.style.display = 'block';
      feedbackEl.style.color   = isCorrect ? 'green' : '#c0392b';
      feedbackEl.textContent   = isCorrect ? '✅ Betul! Hebat!' : '❌ Salah! Jawapan: ' + target.name;
      btnNext.style.display = 'inline-block';
    }
  }

  function finishQuiz() {
    var wrong = totalQ - score;
    var acc   = Math.round((score / totalQ) * 100);
    location.href = 'quiz_result.html?betul=' + score + '&salah=' + wrong + '&acc=' + acc;
  }

  window.nextQuestion = function () {
    if (!quizMode) { qNum++; showQuestion(); }
  };

  window.setMode = function (newMode, btn) {
    mode = newMode;
    document.querySelectorAll('.mode-btn').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    qNum = 1; score = 0;
    showQuestion();
  };

  showQuestion();
})();

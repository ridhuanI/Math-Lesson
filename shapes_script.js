(function () {
  'use strict';

  var SHAPES = [
    { id:'bulatan',           name:'Bulatan',           css:'shape-circle',    unicode:'',  sides:0 },
    { id:'segi-empat',        name:'Segi Empat',         css:'shape-square',    unicode:'',  sides:4 },
    { id:'segi-tiga',         name:'Segi Tiga',          css:'shape-triangle',  unicode:'',  sides:3 },
    { id:'segi-empat-panjang',name:'Segi Empat Panjang', css:'shape-rectangle', unicode:'',  sides:4 },
    { id:'bintang',           name:'Bintang',            css:'shape-star',      unicode:'',  sides:5 },
    { id:'hati',              name:'Hati',               css:'shape-heart',     unicode:'♥', sides:0 },
  ];

  var POLY_SHAPES = SHAPES.filter(function (s) { return s.sides > 0; });

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

  var params      = new URLSearchParams(window.location.search);
  var quizMode    = params.get('quiz') === '1';
  var totalQ      = Number(params.get('q')) || 10;
  var questionNum  = 1;
  var score       = 0;
  var answered    = false;
  var currentMode = 'bentuk';
  var currentAnswer = '';

  var hudEl        = document.getElementById('hud');
  var modeRow      = document.getElementById('modeRow');
  var shapeDisplay = document.getElementById('shapeDisplay');
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

    var modes = ['bentuk', 'warna', 'sisi'];
    var mode = quizMode
      ? modes[Math.floor(Math.random() * modes.length)]
      : (currentMode === 'campur' ? modes[Math.floor(Math.random() * modes.length)] : currentMode);

    // sisi only works with polygon shapes; fall back to bentuk for other modes
    var shapePool = (mode === 'sisi') ? POLY_SHAPES : SHAPES;
    var shape = shapePool[Math.floor(Math.random() * shapePool.length)];
    var color = COLORS[Math.floor(Math.random() * COLORS.length)];

    shapeDisplay.innerHTML = '';
    if (shape.unicode) {
      var span = document.createElement('span');
      span.className = 'shape-el shape-heart';
      span.style.color = color.hex;
      span.textContent = shape.unicode;
      shapeDisplay.appendChild(span);
    } else {
      var div = document.createElement('div');
      div.className = 'shape-el ' + shape.css;
      div.style.background = color.hex;
      shapeDisplay.appendChild(div);
    }

    if (mode === 'bentuk') {
      promptEl.textContent = 'Apakah bentuk ini?';
      currentAnswer = shape.name;

      var pool = [shape.name];
      while (pool.length < 4) {
        var s = SHAPES[Math.floor(Math.random() * SHAPES.length)].name;
        if (pool.indexOf(s) === -1) pool.push(s);
      }
      renderChoices(shuffle(pool), shape.name, 'bentuk');

    } else if (mode === 'warna') {
      promptEl.textContent = 'Apakah warna ini?';
      currentAnswer = color.name;

      var cpool = [color.name];
      while (cpool.length < 4) {
        var c = COLORS[Math.floor(Math.random() * COLORS.length)].name;
        if (cpool.indexOf(c) === -1) cpool.push(c);
      }
      renderChoices(shuffle(cpool), color.name, 'warna');

    } else {
      promptEl.textContent = 'Berapa sisi bentuk ini?';
      currentAnswer = String(shape.sides);

      var sidesPool = shuffle(['3', '4', '5', '6']);
      if (sidesPool.indexOf(currentAnswer) === -1) {
        sidesPool[3] = currentAnswer;
        sidesPool = shuffle(sidesPool);
      }
      renderChoices(sidesPool, currentAnswer, 'sisi');
    }
  }

  function renderChoices(pool, correctAnswer, type) {
    choiceGrid.innerHTML = '';
    pool.forEach(function (name) {
      var btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.style.fontSize = '18px';
      btn.textContent = name;
      btn.addEventListener('click', function () {
        if (answered) return;
        answered = true;
        if (window.SoundFX) SoundFX.click();
        handleAnswer(name === correctAnswer, correctAnswer, btn);
      });
      choiceGrid.appendChild(btn);
    });
  }

  function handleAnswer(isCorrect, correctAnswer, btn) {
    choiceGrid.querySelectorAll('.choice-btn').forEach(function (b) {
      if (b.textContent === correctAnswer) b.classList.add('correct');
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
      feedbackEl.textContent   = isCorrect ? '✅ Betul! Hebat!' : '❌ Salah! Jawapan: ' + correctAnswer;
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

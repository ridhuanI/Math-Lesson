(function () {
  'use strict';

  var DERIA = [
    { organ:'Mata',    deria:'Melihat',   emoji:'👁️' },
    { organ:'Telinga', deria:'Mendengar', emoji:'👂' },
    { organ:'Hidung',  deria:'Menghidu',  emoji:'👃' },
    { organ:'Lidah',   deria:'Merasa',    emoji:'👅' },
    { organ:'Tangan',  deria:'Menyentuh', emoji:'✋' },
  ];

  var TUMBUHAN = [
    { bahagian:'Akar',  emoji:'🌱', fungsi:'Menyerap air dari tanah' },
    { bahagian:'Batang',emoji:'🪵', fungsi:'Menyokong tumbuhan' },
    { bahagian:'Daun',  emoji:'🍃', fungsi:'Membuat makanan' },
    { bahagian:'Bunga', emoji:'🌸', fungsi:'Tempat pembiakan' },
    { bahagian:'Buah',  emoji:'🍎', fungsi:'Mengandungi biji benih' },
    { bahagian:'Akar',  emoji:'🌱', fungsi:'Menahan tumbuhan di tanah' },
    { bahagian:'Batang',emoji:'🪵', fungsi:'Mengangkut air dan makanan' },
    { bahagian:'Daun',  emoji:'🍃', fungsi:'Menyedut cahaya matahari' },
  ];

  var HAIWAN = [
    { nama:'Kucing',      emoji:'🐱', jenis:'Mamalia' },
    { nama:'Burung',      emoji:'🐦', jenis:'Burung' },
    { nama:'Ikan',        emoji:'🐟', jenis:'Ikan' },
    { nama:'Buaya',       emoji:'🐊', jenis:'Reptilia' },
    { nama:'Katak',       emoji:'🐸', jenis:'Amfibia' },
    { nama:'Labah-labah', emoji:'🕷️', jenis:'Artropod' },
    { nama:'Gajah',       emoji:'🐘', jenis:'Mamalia' },
    { nama:'Helang',      emoji:'🦅', jenis:'Burung' },
    { nama:'Ular',        emoji:'🐍', jenis:'Reptilia' },
    { nama:'Arnab',       emoji:'🐰', jenis:'Mamalia' },
    { nama:'Kura-kura',   emoji:'🐢', jenis:'Reptilia' },
    { nama:'Penguin',     emoji:'🐧', jenis:'Burung' },
    { nama:'Rusa',        emoji:'🦌', jenis:'Mamalia' },
    { nama:'Kuda',        emoji:'🐴', jenis:'Mamalia' },
    { nama:'Lebah',       emoji:'🐝', jenis:'Artropod' },
  ];

  var ALL_JENIS = ['Mamalia', 'Burung', 'Ikan', 'Reptilia', 'Amfibia', 'Artropod'];

  var params    = new URLSearchParams(location.search);
  var quizMode  = params.get('quiz') === '1';
  var quizTotal = parseInt(params.get('q')) || 0;
  var qNum = 0, betul = 0, salah = 0;
  var currentMode = 'deria';
  var currentItem = null;
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

    updateHud();

    if (currentMode === 'deria') {
      currentItem = DERIA[Math.floor(Math.random() * DERIA.length)];
      renderDeria();
    } else if (currentMode === 'tumbuhan') {
      currentItem = TUMBUHAN[Math.floor(Math.random() * TUMBUHAN.length)];
      renderTumbuhan();
    } else {
      currentItem = HAIWAN[Math.floor(Math.random() * HAIWAN.length)];
      renderHaiwan();
    }
  }
  window.nextQuestion = nextQuestion;

  function renderDeria() {
    var item = currentItem;
    var fmt = Math.random() < 0.5 ? 'normal' : 'reverse';

    if (fmt === 'normal') {
      qDisplay.innerHTML =
        '<div style="font-size:13px;color:#888;margin-bottom:8px;">Organ apakah yang digunakan untuk...</div>' +
        '<div style="font-size:clamp(28px,9vw,44px);font-weight:700;color:#2980b9;">' + item.deria + '?</div>';
      var correct = item.emoji + ' ' + item.organ;
      var pool = shuffle(DERIA.filter(function (d) { return d !== item; })).slice(0, 3)
                   .map(function (d) { return d.emoji + ' ' + d.organ; });
      renderChoices(shuffle([correct].concat(pool)), correct, 'clamp(18px,5.5vw,22px)');

    } else {
      qDisplay.innerHTML =
        '<div style="font-size:70px;line-height:1;">' + item.emoji + '</div>' +
        '<div style="font-size:22px;font-weight:700;margin-top:8px;">' + item.organ + '</div>' +
        '<div style="font-size:13px;color:#888;margin-top:4px;">Apakah deria yang boleh digunakan?</div>';
      var correct = item.deria;
      var pool = shuffle(DERIA.filter(function (d) { return d !== item; })).slice(0, 3)
                   .map(function (d) { return d.deria; });
      renderChoices(shuffle([correct].concat(pool)), correct, 'clamp(18px,5.5vw,22px)');
    }
  }

  function renderTumbuhan() {
    var item = currentItem;
    qDisplay.innerHTML =
      '<div style="font-size:13px;color:#888;margin-bottom:8px;">Apakah bahagian tumbuhan yang...</div>' +
      '<div style="font-size:clamp(20px,6.5vw,30px);font-weight:700;color:#27ae60;">' + item.fungsi + '?</div>';

    var correct = item.emoji + ' ' + item.bahagian;
    var uniqueParts = [];
    var seen = {};
    TUMBUHAN.forEach(function (t) {
      if (!seen[t.bahagian]) { seen[t.bahagian] = true; uniqueParts.push(t); }
    });
    var pool = shuffle(uniqueParts.filter(function (t) { return t.bahagian !== item.bahagian; })).slice(0, 3)
                 .map(function (t) { return t.emoji + ' ' + t.bahagian; });
    renderChoices(shuffle([correct].concat(pool)), correct, 'clamp(18px,5.5vw,22px)');
  }

  function renderHaiwan() {
    var item = currentItem;
    var fmt = Math.random() < 0.5 ? 'normal' : 'reverse';

    if (fmt === 'normal') {
      qDisplay.innerHTML =
        '<div style="font-size:70px;line-height:1;">' + item.emoji + '</div>' +
        '<div style="font-size:22px;font-weight:700;margin-top:8px;">' + item.nama + '</div>' +
        '<div style="font-size:13px;color:#888;margin-top:4px;">Apakah jenis haiwan ini?</div>';
      var correct = item.jenis;
      var pool = shuffle(ALL_JENIS.filter(function (j) { return j !== correct; })).slice(0, 3);
      renderChoices(shuffle([correct].concat(pool)), correct, 'clamp(14px,4.5vw,18px)');

    } else {
      qDisplay.innerHTML =
        '<div style="font-size:clamp(28px,9vw,44px);font-weight:700;color:#16a085;">' + item.jenis + '</div>' +
        '<div style="font-size:13px;color:#888;margin-top:6px;">Pilih haiwan jenis ini</div>';
      var correct = item.emoji + ' ' + item.nama;
      var distractors = shuffle(HAIWAN.filter(function (h) {
        return h !== item && h.jenis !== item.jenis;
      })).slice(0, 3).map(function (h) { return h.emoji + ' ' + h.nama; });
      renderChoices(shuffle([correct].concat(distractors)), correct, 'clamp(14px,4.5vw,18px)');
    }
  }

  function renderChoices(choices, correct, fontSize) {
    choices.forEach(function (choice) {
      var btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = choice;
      btn.style.fontSize = fontSize;
      btn.addEventListener('click', function () {
        handleAnswer(choice === correct, correct, btn);
      });
      choiceGrid.appendChild(btn);
    });
  }

  function handleAnswer(isCorrect, correctText, clickedBtn) {
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
        if (b.textContent === correctText) b.classList.add('correct');
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

(function () {
  'use strict';

  var TOPICS = {
    warna: [
      { en:'Red',    emoji:'🔴' },
      { en:'Blue',   emoji:'🔵' },
      { en:'Yellow', emoji:'🟡' },
      { en:'Green',  emoji:'🟢' },
      { en:'Orange', emoji:'🟠' },
      { en:'Purple', emoji:'🟣' },
      { en:'Pink',   emoji:'🩷' },
      { en:'Brown',  emoji:'🟤' },
      { en:'White',  emoji:'⬜' },
      { en:'Black',  emoji:'⬛' },
    ],
    haiwan: [
      { en:'Cat',       emoji:'🐱' },
      { en:'Dog',       emoji:'🐶' },
      { en:'Bird',      emoji:'🐦' },
      { en:'Fish',      emoji:'🐟' },
      { en:'Rabbit',    emoji:'🐰' },
      { en:'Elephant',  emoji:'🐘' },
      { en:'Tiger',     emoji:'🐯' },
      { en:'Monkey',    emoji:'🐒' },
      { en:'Lion',      emoji:'🦁' },
      { en:'Penguin',   emoji:'🐧' },
      { en:'Crocodile', emoji:'🐊' },
      { en:'Turtle',    emoji:'🐢' },
    ],
    nombor: [
      { en:'One',    emoji:'1️⃣' },
      { en:'Two',    emoji:'2️⃣' },
      { en:'Three',  emoji:'3️⃣' },
      { en:'Four',   emoji:'4️⃣' },
      { en:'Five',   emoji:'5️⃣' },
      { en:'Six',    emoji:'6️⃣' },
      { en:'Seven',  emoji:'7️⃣' },
      { en:'Eight',  emoji:'8️⃣' },
      { en:'Nine',   emoji:'9️⃣' },
      { en:'Ten',    emoji:'🔟' },
    ],
    badan: [
      { en:'Eyes',    emoji:'👀' },
      { en:'Nose',    emoji:'👃' },
      { en:'Mouth',   emoji:'👄' },
      { en:'Ears',    emoji:'👂' },
      { en:'Head',    emoji:'🗣️' },
      { en:'Hands',   emoji:'✋' },
      { en:'Feet',    emoji:'🦶' },
      { en:'Fingers', emoji:'🖐️' },
      { en:'Back',    emoji:'🔙' },
      { en:'Tummy',   emoji:'🫃' },
    ],
  };

  var params    = new URLSearchParams(location.search);
  var quizMode  = params.get('quiz') === '1';
  var quizTotal = parseInt(params.get('q')) || 0;
  var qNum = 0, betul = 0, salah = 0;
  var currentTopic = 'warna';
  var currentItem  = null;
  var qType    = 'pic2word';
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
      hud.textContent = 'Question ' + (qNum + 1) + ' / ' + quizTotal;
    } else {
      hud.textContent = '✅ ' + betul + '  ❌ ' + salah;
    }
  }

  function setTopic(topic, btn) {
    currentTopic = topic;
    document.querySelectorAll('.mode-btn').forEach(function (b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    if (!quizMode) { qNum = 0; betul = 0; salah = 0; }
    nextQuestion();
  }
  window.setTopic = setTopic;

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

    var data = TOPICS[currentTopic];
    currentItem = data[Math.floor(Math.random() * data.length)];
    qType = Math.random() < 0.5 ? 'pic2word' : 'word2pic';
    updateHud();
    renderQuestion();
  }
  window.nextQuestion = nextQuestion;

  function makeChoiceBtn(text, isCorrect, correctText, fontSize) {
    var btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = text;
    btn.style.fontSize = fontSize || 'clamp(14px, 4.5vw, 18px)';
    btn.addEventListener('click', function () {
      handleAnswer(isCorrect, correctText, btn);
    });
    return btn;
  }

  function renderQuestion() {
    var item = currentItem;
    var data  = TOPICS[currentTopic];

    if (qType === 'pic2word') {
      qDisplay.innerHTML =
        '<div style="font-size:80px;line-height:1;">' + item.emoji + '</div>' +
        '<div style="font-size:13px;color:#aaa;margin-top:6px;">What is this?</div>';
      var correct = item.en;
      var pool = shuffle(data.filter(function (d) { return d !== item; })).slice(0, 3).map(function (d) { return d.en; });
      shuffle([correct].concat(pool)).forEach(function (choice) {
        choiceGrid.appendChild(makeChoiceBtn(choice, choice === correct, correct));
      });

    } else {
      qDisplay.innerHTML =
        '<div class="english-word">' + item.en + '</div>' +
        '<div style="font-size:13px;color:#aaa;margin-top:6px;">Pick the matching picture</div>';
      var correct = item.emoji;
      var pool = shuffle(data.filter(function (d) { return d !== item; })).slice(0, 3).map(function (d) { return d.emoji; });
      shuffle([correct].concat(pool)).forEach(function (choice) {
        choiceGrid.appendChild(makeChoiceBtn(choice, choice === correct, correct, '40px'));
      });
    }
  }

  function handleAnswer(isCorrect, correctText, clickedBtn) {
    if (answered) return;
    answered = true;

    if (isCorrect) {
      betul++;
      clickedBtn.classList.add('correct');
      feedback.textContent = '✅ Correct!';
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
      feedback.textContent = '❌ Try again!';
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

(function () {
  'use strict';

  var ANIMALS = [
    { id:'kucing',       name:'Kucing',        emoji:'🐱' },
    { id:'anjing',       name:'Anjing',        emoji:'🐶' },
    { id:'lembu',        name:'Lembu',         emoji:'🐄' },
    { id:'kambing',      name:'Kambing',       emoji:'🐐' },
    { id:'gajah',        name:'Gajah',         emoji:'🐘' },
    { id:'katak',        name:'Katak',         emoji:'🐸' },
    { id:'burung',       name:'Burung',        emoji:'🐦' },
    { id:'ikan',         name:'Ikan',          emoji:'🐟' },
    { id:'harimau',      name:'Harimau',       emoji:'🐯' },
    { id:'monyet',       name:'Monyet',        emoji:'🐒' },
    { id:'arnab',        name:'Arnab',         emoji:'🐰' },
    { id:'beruang',      name:'Beruang',       emoji:'🐻' },
    { id:'rusa',         name:'Rusa',          emoji:'🦌' },
    { id:'kuda',         name:'Kuda',          emoji:'🐴' },
    { id:'ayam',         name:'Ayam',          emoji:'🐔' },
    { id:'singa',        name:'Singa',         emoji:'🦁' },
    { id:'zebra',        name:'Zebra',         emoji:'🦓' },
    { id:'zirafah',      name:'Zirafah',       emoji:'🦒' },
    { id:'penguin',      name:'Penguin',       emoji:'🐧' },
    { id:'buaya',        name:'Buaya',         emoji:'🐊' },
    { id:'ular',         name:'Ular',          emoji:'🐍' },
    { id:'kura-kura',    name:'Kura-kura',     emoji:'🐢' },
    { id:'burung-hantu', name:'Burung Hantu',  emoji:'🦉' },
    { id:'lumba-lumba',  name:'Lumba-lumba',   emoji:'🐬' },
    { id:'lebah',        name:'Lebah',         emoji:'🐝' },
  ];

  var params      = new URLSearchParams(window.location.search);
  var quizMode    = params.get('quiz') === '1';
  var totalQ      = Number(params.get('q')) || 10;
  var questionNum  = 1;
  var score       = 0;
  var answered    = false;
  var currentAnimal = null;
  var qFmt = 'emoji';

  var hudEl         = document.getElementById('hud');
  var animalDisplay = document.getElementById('animalDisplay');
  var choiceGrid    = document.getElementById('choiceGrid');
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
    hudEl.textContent = quizMode ? ('Soalan ' + questionNum + ' / ' + totalQ) : '';
  }

  function renderQuestion() {
    answered = false;
    feedbackEl.style.display = 'none';
    btnNext.style.display    = 'none';
    updateHUD();

    currentAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    qFmt = Math.random() < 0.6 ? 'emoji' : 'text';

    if (qFmt === 'emoji') {
      animalDisplay.textContent = currentAnimal.emoji;
    } else {
      animalDisplay.innerHTML =
        '<span style="font-size:clamp(34px,10vw,54px);font-weight:700;color:#2c3e50;line-height:1.3;">'
        + currentAnimal.name + '</span>';
    }

    void animalDisplay.offsetWidth;
    animalDisplay.className = 'animal-display';
    animalDisplay.offsetWidth;
    animalDisplay.className = 'animal-display pop';

    choiceGrid.innerHTML = '';

    if (qFmt === 'emoji') {
      var pool = [currentAnimal.name];
      while (pool.length < 4) {
        var a = ANIMALS[Math.floor(Math.random() * ANIMALS.length)].name;
        if (pool.indexOf(a) === -1) pool.push(a);
      }
      shuffle(pool).forEach(function (name) {
        var btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.style.fontSize = '18px';
        btn.textContent = name;
        btn.addEventListener('click', function () {
          if (answered) return;
          answered = true;
          if (window.SoundFX) SoundFX.click();
          handleAnswer(name === currentAnimal.name, currentAnimal.name, btn);
        });
        choiceGrid.appendChild(btn);
      });

    } else {
      var epool = [currentAnimal.emoji];
      while (epool.length < 4) {
        var e = ANIMALS[Math.floor(Math.random() * ANIMALS.length)].emoji;
        if (epool.indexOf(e) === -1) epool.push(e);
      }
      shuffle(epool).forEach(function (emoji) {
        var btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.style.fontSize = '40px';
        btn.textContent = emoji;
        btn.addEventListener('click', function () {
          if (answered) return;
          answered = true;
          if (window.SoundFX) SoundFX.click();
          handleAnswer(emoji === currentAnimal.emoji, currentAnimal.emoji, btn);
        });
        choiceGrid.appendChild(btn);
      });
    }
  }

  function handleAnswer(isCorrect, correctDisplay, btn) {
    choiceGrid.querySelectorAll('.choice-btn').forEach(function (b) {
      if (b.textContent === correctDisplay) b.classList.add('correct');
      else if (b === btn && !isCorrect)     b.classList.add('wrong');
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
      feedbackEl.textContent   = isCorrect
        ? '✅ Betul! Ia adalah ' + currentAnimal.name + '!'
        : '❌ Salah! Ini adalah ' + currentAnimal.name;
      btnNext.style.display = 'inline-block';
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

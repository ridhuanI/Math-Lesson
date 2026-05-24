(function () {
  'use strict';

  var ANIMALS = [
    { id:'kucing',  name:'Kucing',   emoji:'🐱' },
    { id:'anjing',  name:'Anjing',   emoji:'🐶' },
    { id:'lembu',   name:'Lembu',    emoji:'🐄' },
    { id:'kambing', name:'Kambing',  emoji:'🐐' },
    { id:'gajah',   name:'Gajah',   emoji:'🐘' },
    { id:'katak',   name:'Katak',   emoji:'🐸' },
    { id:'burung',  name:'Burung',  emoji:'🐦' },
    { id:'ikan',    name:'Ikan',    emoji:'🐟' },
    { id:'harimau', name:'Harimau', emoji:'🐯' },
    { id:'monyet',  name:'Monyet',  emoji:'🐒' },
    { id:'arnab',   name:'Arnab',   emoji:'🐰' },
    { id:'beruang', name:'Beruang', emoji:'🐻' },
    { id:'rusa',    name:'Rusa',    emoji:'🦌' },
    { id:'kuda',    name:'Kuda',    emoji:'🐴' },
    { id:'ayam',    name:'Ayam',    emoji:'🐔' },
  ];

  var params      = new URLSearchParams(window.location.search);
  var quizMode    = params.get('quiz') === '1';
  var totalQ      = Number(params.get('q')) || 10;
  var questionNum  = 1;
  var score       = 0;
  var answered    = false;
  var currentAnimal = null;

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
    animalDisplay.textContent = currentAnimal.emoji;
    animalDisplay.className   = 'animal-display pop';

    // Restart animation
    void animalDisplay.offsetWidth;
    animalDisplay.className = 'animal-display';
    animalDisplay.offsetWidth; // trigger reflow
    animalDisplay.className = 'animal-display pop';

    var pool = [currentAnimal.name];
    while (pool.length < 4) {
      var a = ANIMALS[Math.floor(Math.random() * ANIMALS.length)].name;
      if (pool.indexOf(a) === -1) pool.push(a);
    }
    pool = shuffle(pool);

    choiceGrid.innerHTML = '';
    pool.forEach(function (name) {
      var btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.style.fontSize = '18px';
      btn.textContent = name;
      btn.addEventListener('click', function () {
        if (answered) return;
        answered = true;
        handleAnswer(name === currentAnimal.name, btn);
      });
      choiceGrid.appendChild(btn);
    });
  }

  function handleAnswer(isCorrect, btn) {
    choiceGrid.querySelectorAll('.choice-btn').forEach(function (b) {
      if (b.textContent === currentAnimal.name) b.classList.add('correct');
      else if (b === btn && !isCorrect)         b.classList.add('wrong');
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

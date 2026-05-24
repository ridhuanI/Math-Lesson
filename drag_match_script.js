(function () {
  'use strict';

  var SHAPES = [
    { id:'bulatan',            name:'Bulatan',            css:'shape-circle',    unicode:null },
    { id:'segi-empat',         name:'Segi Empat',          css:'shape-square',    unicode:null },
    { id:'segi-tiga',          name:'Segi Tiga',           css:'shape-triangle',  unicode:null },
    { id:'segi-empat-panjang', name:'Segi Empat Panjang',  css:'shape-rectangle', unicode:null },
    { id:'bintang',            name:'Bintang',             css:'shape-star',      unicode:null },
    { id:'hati',               name:'Hati',                css:'shape-heart',     unicode:'♥' },
  ];

  var COLORS = ['#E74C3C','#3498DB','#F1C40F','#2ECC71','#E67E22','#9B59B6','#FF69B4'];

  var params      = new URLSearchParams(window.location.search);
  var quizMode    = params.get('quiz') === '1';
  var totalRounds = Number(params.get('q')) || 5;
  var roundNum    = 1;
  var score       = 0;
  var matchCount  = 0;
  var roundPerfect = true;

  var hudEl      = document.getElementById('hud');
  var shapesGrid = document.getElementById('shapesGrid');
  var namesGrid  = document.getElementById('namesGrid');
  var feedbackEl = document.getElementById('feedback');
  var btnNext    = document.getElementById('btnNext');

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function updateHUD() {
    hudEl.textContent = quizMode ? ('Pusingan ' + roundNum + ' / ' + totalRounds) : '';
  }

  function makeShapeEl(shape, colorHex) {
    if (shape.unicode) {
      var span = document.createElement('span');
      span.className = 'shape-el ' + shape.css;
      span.style.color = colorHex;
      span.textContent = shape.unicode;
      return span;
    }
    var div = document.createElement('div');
    div.className = 'shape-el ' + shape.css;
    div.style.background = colorHex;
    return div;
  }

  function renderRound() {
    matchCount   = 0;
    roundPerfect = true;
    feedbackEl.style.display = 'none';
    btnNext.style.display    = 'none';
    updateHUD();

    var roundShapes = shuffle(SHAPES.slice()).slice(0, 4);
    var roundColors = shuffle(COLORS.slice()).slice(0, 4);

    // --- Shape cards (draggable) ---
    shapesGrid.innerHTML = '';
    roundShapes.forEach(function (shape, i) {
      var card = document.createElement('div');
      card.className = 'drag-shape-card';
      card.setAttribute('draggable', 'true');
      card.dataset.shapeId = shape.id;
      card.appendChild(makeShapeEl(shape, roundColors[i]));

      // Desktop drag
      card.addEventListener('dragstart', function (e) {
        e.dataTransfer.setData('text/plain', shape.id);
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', function () {
        card.classList.remove('dragging');
      });

      // Touch drag
      addTouchDrag(card, shape.id);

      shapesGrid.appendChild(card);
    });

    // --- Name drop zones (shuffled order) ---
    var shuffledForNames = shuffle(roundShapes.slice());
    namesGrid.innerHTML = '';
    shuffledForNames.forEach(function (shape) {
      var zone = document.createElement('div');
      zone.className = 'name-dropzone';
      zone.dataset.expectedId = shape.id;
      zone.textContent = shape.name;

      zone.addEventListener('dragover', function (e) {
        if (zone.classList.contains('matched')) return;
        e.preventDefault();
        zone.classList.add('hover');
      });
      zone.addEventListener('dragleave', function () {
        zone.classList.remove('hover');
      });
      zone.addEventListener('drop', function (e) {
        e.preventDefault();
        zone.classList.remove('hover');
        if (zone.classList.contains('matched')) return;
        var shapeId = e.dataTransfer.getData('text/plain');
        var card    = shapesGrid.querySelector('[data-shape-id="' + shapeId + '"]');
        handleDrop(shapeId, zone, card);
      });

      namesGrid.appendChild(zone);
    });
  }

  function addTouchDrag(card, shapeId) {
    card.addEventListener('touchstart', function (e) {
      e.preventDefault();
      if (card.classList.contains('matched')) return;

      var touch = e.touches[0];
      var rect  = card.getBoundingClientRect();

      // Floating clone that follows the finger
      var preview = card.cloneNode(true);
      preview.style.cssText = [
        'position:fixed',
        'z-index:99999',
        'pointer-events:none',
        'width:'  + rect.width  + 'px',
        'height:' + rect.height + 'px',
        'left:'   + (touch.clientX - rect.width  / 2) + 'px',
        'top:'    + (touch.clientY - rect.height / 2) + 'px',
        'opacity:0.88',
        'transform:scale(1.08)',
        'box-shadow:0 8px 22px rgba(0,0,0,0.28)',
        'transition:none',
      ].join(';');
      document.body.appendChild(preview);
      card.classList.add('dragging');

      function moveHandler(ev) {
        var t = ev.touches[0];
        preview.style.left = (t.clientX - rect.width  / 2) + 'px';
        preview.style.top  = (t.clientY - rect.height / 2) + 'px';

        namesGrid.querySelectorAll('.name-dropzone').forEach(function (zone) {
          if (zone.classList.contains('matched')) return;
          var zr = zone.getBoundingClientRect();
          var inside = t.clientX >= zr.left && t.clientX <= zr.right &&
                       t.clientY >= zr.top  && t.clientY <= zr.bottom;
          zone.classList.toggle('hover', inside);
        });
      }

      function endHandler(ev) {
        var t = ev.changedTouches[0];
        preview.remove();
        card.classList.remove('dragging');
        namesGrid.querySelectorAll('.name-dropzone').forEach(function (z) {
          z.classList.remove('hover');
        });

        var hit  = document.elementFromPoint(t.clientX, t.clientY);
        var zone = hit && hit.closest && hit.closest('.name-dropzone');
        if (zone && !zone.classList.contains('matched')) {
          handleDrop(shapeId, zone, card);
        }

        window.removeEventListener('touchmove', moveHandler);
        window.removeEventListener('touchend',  endHandler);
      }

      window.addEventListener('touchmove', moveHandler, { passive: false });
      window.addEventListener('touchend',  endHandler,  { passive: true  });
    }, { passive: false });
  }

  function handleDrop(shapeId, zone, card) {
    if (zone.dataset.expectedId === shapeId) {
      if (card) card.classList.add('matched');
      zone.classList.add('matched');
      matchCount++;
      if (window.SoundFX) SoundFX.correct();
      if (window.Mascot)  Mascot.happy(600);
      if (matchCount === 4) setTimeout(onRoundComplete, 500);
    } else {
      roundPerfect = false;
      zone.classList.remove('hover');
      zone.classList.add('wrong-shake');
      setTimeout(function () { zone.classList.remove('wrong-shake'); }, 450);
      if (window.SoundFX) SoundFX.wrong();
      if (window.Mascot)  Mascot.sad(800);
    }
  }

  function onRoundComplete() {
    if (window.SoundFX) SoundFX.celebrate();
    if (window.Mascot)  Mascot.excited(3000);
    if (roundPerfect) score++;

    if (quizMode) {
      if (roundNum >= totalRounds) {
        setTimeout(finishQuiz, 1200);
      } else {
        roundNum++;
        setTimeout(renderRound, 1400);
      }
    } else {
      feedbackEl.style.display = 'block';
      feedbackEl.style.color   = 'green';
      feedbackEl.textContent   = roundPerfect
        ? '🌟 Sempurna! Semua padanan betul!'
        : '✅ Tahniah! Semua bentuk dipadan!';
      btnNext.style.display = 'inline-block';
    }
  }

  function finishQuiz() {
    var wrong = totalRounds - score;
    var acc   = Math.round((score / totalRounds) * 100);
    location.href = 'quiz_result.html?betul=' + score + '&salah=' + wrong + '&acc=' + acc;
  }

  window.nextRound = function () {
    if (!quizMode) { roundNum++; renderRound(); }
  };

  renderRound();
})();

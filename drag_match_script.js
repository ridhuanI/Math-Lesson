(function () {
  'use strict';

  var SHAPES = [
    { id:'bulatan',           name:'Bulatan',           css:'shape-circle',    unicode:null, decoys:['bujur'] },
    { id:'segi-empat',        name:'Segi Empat',         css:'shape-square',    unicode:null, decoys:['berlian','segiempat-panjang'] },
    { id:'segi-tiga',         name:'Segi Tiga',          css:'shape-triangle',  unicode:null, decoys:[] },
    { id:'segiempat-panjang', name:'Segi Empat Panjang', css:'shape-rectangle', unicode:null, decoys:['segi-empat'] },
    { id:'bintang',           name:'Bintang',            css:'shape-star',      unicode:null, decoys:[] },
    { id:'hati',              name:'Hati',               css:'shape-heart',     unicode:'♥',  decoys:[] },
    { id:'bujur',             name:'Bujur',              css:'shape-oval',      unicode:null, decoys:['bulatan'] },
    { id:'pentagon',          name:'Pentagon',           css:'shape-pentagon',  unicode:null, decoys:['heksagon'] },
    { id:'heksagon',          name:'Heksagon',           css:'shape-hexagon',   unicode:null, decoys:['pentagon'] },
    { id:'berlian',           name:'Berlian',            css:'shape-diamond',   unicode:null, decoys:['segi-empat'] },
  ];

  var SHAPE_BY_ID = {};
  SHAPES.forEach(function (s) { SHAPE_BY_ID[s.id] = s; });

  var DIFFICULTIES = [
    { label:'🟢 Mudah',     sourceCount:3, decoyCount:0, pool:['bulatan','segi-empat','segi-tiga','hati','bintang'] },
    { label:'🟡 Sederhana', sourceCount:4, decoyCount:2, pool:['bulatan','segi-empat','segi-tiga','segiempat-panjang','bintang','hati','pentagon','heksagon'] },
    { label:'🔴 Sukar',     sourceCount:5, decoyCount:3, pool:null },
  ];

  var COLORS = ['#E74C3C','#3498DB','#F1C40F','#2ECC71','#E67E22','#9B59B6','#FF69B4'];

  var params      = new URLSearchParams(window.location.search);
  var quizMode    = params.get('quiz') === '1';
  var totalRounds = Number(params.get('q')) || 5;
  var roundNum    = 1;
  var score       = 0;
  var matchCount  = 0;
  var sourceCount = 0;
  var roundPerfect = true;
  var currentDiff  = 0;

  var hudEl      = document.getElementById('hud');
  var shapesGrid = document.getElementById('shapesGrid');
  var siluetGrid = document.getElementById('siluetGrid');
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

  function makeSilhouetteEl(shape) {
    if (shape.unicode) {
      var span = document.createElement('span');
      span.className = 'shape-el ' + shape.css;
      span.style.color = '#ABABAB';
      span.textContent = shape.unicode;
      return span;
    }
    var div = document.createElement('div');
    div.className = 'shape-el ' + shape.css;
    div.style.background = '#ABABAB';
    return div;
  }

  function renderRound() {
    matchCount   = 0;
    roundPerfect = true;
    feedbackEl.style.display = 'none';
    btnNext.style.display    = 'none';
    updateHUD();

    var diff = DIFFICULTIES[currentDiff];
    var pool = diff.pool
      ? diff.pool.map(function (id) { return SHAPE_BY_ID[id]; })
      : SHAPES.slice();

    var roundShapes = shuffle(pool).slice(0, diff.sourceCount);
    sourceCount = roundShapes.length;

    // Build decoy list — prefer shapes from each source shape's decoys array
    var usedIds = {};
    roundShapes.forEach(function (s) { usedIds[s.id] = true; });

    var decoys = [];
    if (diff.decoyCount > 0) {
      // Collect candidate decoys from each source shape's decoys list
      var candidates = [];
      roundShapes.forEach(function (s) {
        s.decoys.forEach(function (did) {
          if (!usedIds[did] && SHAPE_BY_ID[did] && candidates.indexOf(did) === -1) {
            candidates.push(did);
          }
        });
      });
      // Shuffle candidates and pick up to decoyCount
      candidates = shuffle(candidates);
      for (var i = 0; i < Math.min(diff.decoyCount, candidates.length); i++) {
        var d = SHAPE_BY_ID[candidates[i]];
        if (d) { decoys.push(d); usedIds[d.id] = true; }
      }
      // If still under decoyCount, fill from remaining pool shapes
      if (decoys.length < diff.decoyCount) {
        var remaining = pool.filter(function (s) { return !usedIds[s.id]; });
        remaining = shuffle(remaining);
        for (var j = 0; j < remaining.length && decoys.length < diff.decoyCount; j++) {
          decoys.push(remaining[j]);
        }
      }
    }

    var silhouetteShapes = shuffle(roundShapes.concat(decoys));

    // --- Source shape cards (draggable) ---
    shapesGrid.innerHTML = '';
    var roundColors = shuffle(COLORS.slice()).slice(0, roundShapes.length);
    roundShapes.forEach(function (shape, i) {
      var card = document.createElement('div');
      card.className = 'drag-shape-card';
      card.setAttribute('draggable', 'true');
      card.dataset.shapeId = shape.id;
      card.appendChild(makeShapeEl(shape, roundColors[i]));

      card.addEventListener('dragstart', function (e) {
        e.dataTransfer.setData('text/plain', shape.id);
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', function () {
        card.classList.remove('dragging');
      });

      addTouchDrag(card, shape.id);
      shapesGrid.appendChild(card);
    });

    // --- Silhouette drop zones ---
    siluetGrid.innerHTML = '';
    silhouetteShapes.forEach(function (shape) {
      var zone = document.createElement('div');
      zone.className = 'silhouette-zone';
      zone.dataset.expectedId = shape.id;
      zone.appendChild(makeSilhouetteEl(shape));

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
        var card = shapesGrid.querySelector('[data-shape-id="' + shapeId + '"]');
        handleDrop(shapeId, zone, card);
      });

      siluetGrid.appendChild(zone);
    });
  }

  function addTouchDrag(card, shapeId) {
    card.addEventListener('touchstart', function (e) {
      e.preventDefault();
      if (card.classList.contains('matched')) return;

      var touch = e.touches[0];
      var rect  = card.getBoundingClientRect();

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

        siluetGrid.querySelectorAll('.silhouette-zone').forEach(function (zone) {
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
        siluetGrid.querySelectorAll('.silhouette-zone').forEach(function (z) {
          z.classList.remove('hover');
        });

        var hit  = document.elementFromPoint(t.clientX, t.clientY);
        var zone = hit && hit.closest && hit.closest('.silhouette-zone');
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
      if (matchCount === sourceCount) setTimeout(onRoundComplete, 500);
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

  window.setDiff = function (level, btn) {
    currentDiff = level;
    document.querySelectorAll('.diff-btn').forEach(function (b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');
    roundNum = 1;
    score    = 0;
    renderRound();
  };

  renderRound();
})();

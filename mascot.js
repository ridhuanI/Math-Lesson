// mascot.js — Pure-CSS round face injected as a fixed overlay
(function () {
  'use strict';

  var root = document.createElement('div');
  root.id = 'mascot-root';
  root.className = 'state-idle';
  root.innerHTML =
    '<div class="mascot-body">' +
      '<div class="mascot-eye left"></div>' +
      '<div class="mascot-eye right"></div>' +
      '<div class="mascot-blush left"></div>' +
      '<div class="mascot-blush right"></div>' +
      '<div class="mascot-mouth"></div>' +
    '</div>';
  document.body.appendChild(root);

  var STATES = ['idle', 'happy', 'sad', 'excited'];
  var stateTimer = null;

  function setState(state, ms) {
    if (STATES.indexOf(state) === -1) return;
    STATES.forEach(function (s) { root.classList.remove('state-' + s); });
    root.classList.add('state-' + state);
    if (stateTimer) { clearTimeout(stateTimer); stateTimer = null; }
    if (state !== 'idle' && ms) {
      stateTimer = setTimeout(function () { setState('idle'); }, ms);
    }
  }

  window.Mascot = {
    idle:    function ()    { setState('idle'); },
    happy:   function (ms)  { setState('happy',   ms || 2000); },
    sad:     function (ms)  { setState('sad',     ms || 2000); },
    excited: function (ms)  { setState('excited', ms || 2500); },
    state:   function ()    {
      for (var i = 0; i < STATES.length; i++) {
        if (root.classList.contains('state-' + STATES[i])) return STATES[i];
      }
      return 'idle';
    }
  };
})();

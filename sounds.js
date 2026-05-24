// sounds.js — Web Audio API sound effects, no audio files needed
(function () {
  'use strict';

  var ctx = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function playTone(freq, startOffset, dur, vol, type) {
    vol  = vol  || 0.3;
    type = type || 'sine';
    var c    = getCtx();
    var osc  = c.createOscillator();
    var gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime + startOffset);
    gain.gain.setValueAtTime(0, c.currentTime + startOffset);
    gain.gain.linearRampToValueAtTime(vol, c.currentTime + startOffset + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + startOffset + dur);
    osc.start(c.currentTime + startOffset);
    osc.stop(c.currentTime + startOffset + dur + 0.05);
  }

  // Ascending C5-E5-G5 arpeggio — affirmation
  function correct() {
    playTone(523, 0.00, 0.12, 0.30);
    playTone(659, 0.13, 0.12, 0.30);
    playTone(784, 0.26, 0.22, 0.35);
  }

  // Gentle A4-F4 descend — not harsh for kids
  function wrong() {
    playTone(440, 0.00, 0.15, 0.25, 'triangle');
    playTone(349, 0.18, 0.22, 0.25, 'triangle');
  }

  // Soft single pop for button taps
  function click() {
    playTone(880, 0, 0.06, 0.20);
  }

  // 6-note C5-A5 fanfare with fifth harmonics
  function celebrate() {
    var notes = [523, 587, 659, 698, 784, 880];
    notes.forEach(function (freq, i) {
      playTone(freq,        i * 0.08,        0.18, 0.28);
      playTone(freq * 1.5,  i * 0.08 + 0.04, 0.12, 0.12);
    });
  }

  // Two-note ready jingle
  function start() {
    playTone(523, 0.00, 0.10, 0.20);
    playTone(784, 0.12, 0.18, 0.20);
  }

  // Unique frequency patterns per animal
  var ANIMAL_PATTERNS = {
    kucing:  [[600,0,.10,.30,'square'],  [500,.12,.15,.25,'square']],
    anjing:  [[300,0,.08,.30,'sawtooth'],[280,.10,.08,.30,'sawtooth'],[300,.20,.12,.30,'sawtooth']],
    lembu:   [[120,0,.50,.35,'sawtooth']],
    kambing: [[400,0,.08,.25,'triangle'],[450,.10,.15,.25,'triangle']],
    gajah:   [[150,0,.06,.35,'sawtooth'],[200,.08,.06,.30,'sawtooth'],[300,.16,.08,.30,'sawtooth'],[400,.26,.12,.30,'sawtooth']],
    katak:   [[200,0,.06,.30,'square'],  [200,.12,.06,.30,'square']],
    burung:  [[900,0,.05,.20,'sine'],    [1100,.07,.05,.20,'sine'],[900,.14,.08,.20,'sine']],
    ikan:    [[400,0,.04,.15,'sine'],    [300,.06,.04,.15,'sine']],
    harimau: [[80, 0,.30,.40,'sawtooth'],[60,.35,.40,.40,'sawtooth']],
    monyet:  [[500,0,.05,.25,'triangle'],[600,.07,.05,.25,'triangle'],[500,.14,.05,.25,'triangle'],[650,.21,.08,.25,'triangle']],
    arnab:   [[700,0,.04,.15,'sine'],    [800,.06,.04,.15,'sine']],
    beruang: [[100,0,.40,.40,'sawtooth']],
    rusa:    [[350,0,.12,.25,'triangle'],[400,.14,.15,.25,'triangle']],
    kuda:    [[250,0,.05,.30,'sawtooth'],[300,.07,.05,.30,'sawtooth'],[250,.14,.05,.30,'sawtooth'],[350,.21,.10,.30,'sawtooth']],
    ayam:    [[800,0,.05,.20,'square'],  [600,.07,.05,.20,'square'],[800,.14,.08,.20,'square']]
  };

  function animal(id) {
    var pattern = ANIMAL_PATTERNS[id];
    if (!pattern) return;
    pattern.forEach(function (p) { playTone(p[0], p[1], p[2], p[3], p[4]); });
  }

  window.SoundFX = { correct: correct, wrong: wrong, click: click, celebrate: celebrate, start: start, animal: animal };
})();

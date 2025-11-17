document.addEventListener("DOMContentLoaded", () => {
  let puluhTop, saTop, puluhBottom, saBottom;
  let sudahPinjam = false;
  let floatingText = null;

  // ========================
  // 📘 QUIZ MODE VARIABLES
  // ========================
  let quizMode = false;
  let score = 0;
  let totalSoalan = 5;
  let currentSoalan = 0;

  // ambil parameter dari URL
  const url = new URLSearchParams(window.location.search);
  if (url.get("quiz") === "1") {
      quizMode = true;
      totalSoalan = Number(url.get("q")) || 5;

      // hide normal buttons
      const bCek = document.getElementById("btnCek");
      const bBaru = document.getElementById("btnBaru");
      if (bCek) bCek.style.display = "none";
      if (bBaru) bBaru.style.display = "none";
  }

  const puluhBox = document.getElementById("puluhTop");
  const saBox = document.getElementById("saTop");
  const puluhBottomBox = document.getElementById("puluhBottom");
  const saBottomBox = document.getElementById("saBottom");
  const feedback = document.getElementById("feedback");
  const numberPad = document.getElementById("numberPad");
  const hud = document.getElementById("hud");

  // ============================
  // 🧮 JANA SOALAN BARU
  // ============================
  function soalanBaru() {
    feedback.style.display = "none";
    feedback.textContent = "";
    sudahPinjam = false;

    if (quizMode) {
      currentSoalan++;
      if (currentSoalan > totalSoalan) {
        tamatQuiz();
        return;
      }

      // HUD UPDATE + show
      if (hud) {
        hud.style.display = "block";
        hud.textContent = `Soalan ${currentSoalan} / ${totalSoalan}`;
      }
    } else {
      if (hud) hud.style.display = "none";
    }

    const perluPinjam = Math.random() < 0.5;

    if (perluPinjam) {
      do {
        puluhTop = Math.floor(Math.random() * 8) + 2;
        puluhBottom = Math.floor(Math.random() * puluhTop);
        saBottom = Math.floor(Math.random() * 9) + 1;
        saTop = Math.floor(Math.random() * saBottom);
      } while (saTop >= saBottom);
    } else {
      do {
        puluhTop = Math.floor(Math.random() * 8) + 2;
        puluhBottom = Math.floor(Math.random() * puluhTop);
        saTop = Math.floor(Math.random() * 9) + 1;
        saBottom = Math.floor(Math.random() * saTop);
      } while (saTop < saBottom);
    }

    puluhBox.textContent = puluhTop;
    saBox.textContent = saTop;
    puluhBottomBox.textContent = puluhBottom;
    saBottomBox.textContent = saBottom;

    puluhBox.classList.remove("red", "green");
    saBox.classList.remove("red", "green", "preview");

    document.querySelectorAll(".dropzone").forEach(z => {
      z.textContent = "_";
      z.style.color = "#999";
      z.style.borderColor = "#333";
    });
  }

  soalanBaru();

  // ============================
  // QUIZ END → redirect result
  // ============================
  function tamatQuiz() {
    const bCek = document.getElementById("btnCek");
    const bBaru = document.getElementById("btnBaru");
    if (bCek) bCek.style.display = "inline-block";
    if (bBaru) bBaru.style.display = "inline-block";

    quizMode = false;
    if (hud) hud.style.display = "none";

    let betul = score;
    let salah = totalSoalan - score;
    let acc = Math.round((betul / totalSoalan) * 100);

    location.href = `quiz_result.html?betul=${betul}&salah=${salah}&acc=${acc}`;
  }

  // ============================
  // DRAG PINJAM (DESKTOP)
  // ============================
  puluhBox.addEventListener("dragstart", e => {
    if (sudahPinjam || saTop >= saBottom) {
      e.preventDefault();
      return;
    }

    floatingText = document.createElement("div");
    floatingText.className = "floating10";
    floatingText.textContent = "10+";
    document.body.appendChild(floatingText);

    const img = new Image();
    img.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
    e.dataTransfer.setDragImage(img, 0, 0);

    puluhBox.textContent = puluhTop - 1;
    puluhBox.classList.add("red");
  });

  window.addEventListener("dragover", e => {
    if (floatingText) {
      floatingText.style.left = e.pageX + 40 + "px";
      floatingText.style.top = e.pageY - 30 + "px";
    }
  });

  saBox.addEventListener("dragover", e => e.preventDefault());
  saBox.addEventListener("dragenter", e => {
    if (!sudahPinjam) {
      saBox.classList.add("preview");
      saBox.textContent = saTop + 10;
    }
  });

  saBox.addEventListener("dragleave", e => {
    if (!sudahPinjam) {
      saBox.classList.remove("preview");
      saBox.textContent = saTop;
    }
  });

  saBox.addEventListener("drop", e => {
    if (sudahPinjam) return;

    puluhTop -= 1;
    saTop += 10;
    sudahPinjam = true;

    puluhBox.textContent = puluhTop;
    saBox.textContent = saTop;

    saBox.classList.add("green");
    puluhBox.classList.add("red");
    saBox.classList.remove("preview");

    if (floatingText) floatingText.remove();
    floatingText = null;
  });

  puluhBox.addEventListener("dragend", () => {
    if (!sudahPinjam) {
      puluhBox.textContent = puluhTop;
      saBox.textContent = saTop;
      saBox.classList.remove("preview");
      puluhBox.classList.remove("red");
    }
    if (floatingText) floatingText.remove();
    floatingText = null;
  });

  // ============================
  // DROP ANSWER (DESKTOP) - unchanged
  // ============================
  const nums = document.querySelectorAll(".num");
  nums.forEach(num => {
    num.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", num.textContent);
    });
  });

  const drops = document.querySelectorAll(".dropzone");
  drops.forEach(drop => {
    drop.addEventListener("dragover", e => e.preventDefault());
    drop.addEventListener("drop", e => {
      e.preventDefault();
      const data = e.dataTransfer.getData("text/plain");
      drop.textContent = data;
      drop.style.color = "#000";
      drop.style.borderColor = "#4CAF50";

      // QUIZ MODE: auto-next only when both boxes filled
      if (quizMode) {
        const p = document.getElementById("ansPuluh").textContent.trim();
        const s = document.getElementById("ansSa").textContent.trim();
        const ready = /^[0-9]$/.test(p) && /^[0-9]$/.test(s);
        if (ready) setTimeout(() => cekJawapan(), 120);
      }
    });
  });

  // ============================
  // TOUCH SUPPORT: X-Function (centralized)
  // ============================
  // xTouchPlace handles touch interactions for number buttons (.num)
  function xTouchPlace(numText, touch) {
    // create floating element
    const floatEl = document.createElement("div");
    floatEl.className = "floating10";
    floatEl.textContent = numText;
    floatEl.style.position = "absolute";
    floatEl.style.left = (touch.pageX + 40) + "px";
    floatEl.style.top = (touch.pageY - 80) + "px";
    floatEl.style.zIndex = "9999";
    document.body.appendChild(floatEl);

    // helper to update float pos
    function moveTo(t) {
      floatEl.style.left = (t.pageX + 40) + "px";
      floatEl.style.top = (t.pageY - 80) + "px";
    }

    // previewing: highlight dropzone under touch
    function previewAt(t) {
      let elem = document.elementFromPoint(t.clientX, t.clientY);
      if (!elem) return null;
      const dz = elem.closest ? elem.closest(".dropzone") : null;
      // clear others preview
      document.querySelectorAll(".dropzone").forEach(z => {
        if (!z.textContent.trim()) z.textContent = "_";
        z.style.borderColor = "#333";
        z.style.background = "#fafafa";
      });
      if (dz) {
        dz.style.borderColor = "#4CAF50";
        dz.style.background = "#e6ffe6";
        dz.textContent = numText; // show preview
        dz.style.opacity = "0.6";
        return dz;
      }
      return null;
    }

    // touchmove handler
    function onMove(e) {
      if (!e.touches || e.touches.length === 0) return;
      const t = e.touches[0];
      moveTo(t);
      previewAt(t);
      e.preventDefault();
    }

    // touchend finalizer
    function onEnd(e) {
      // find final element
      const t = e.changedTouches[0];
      let elem = document.elementFromPoint(t.clientX, t.clientY);
      const dz = elem && elem.closest ? elem.closest(".dropzone") : null;

      if (dz) {
        // place number into dropzone
        dz.textContent = numText;
        dz.style.color = "#000";
        dz.style.borderColor = "#4CAF50";
        dz.style.background = "#fff";
      } else {
        // no dropzone — do nothing (floating fades)
      }

      // fade out floatEl then remove
      floatEl.style.transition = "opacity 0.25s ease, transform 0.25s ease";
      floatEl.style.opacity = "0";
      floatEl.style.transform = "scale(0.8)";
      setTimeout(() => {
        if (floatEl && floatEl.parentNode) floatEl.parentNode.removeChild(floatEl);
      }, 250);

      // cleanup previews on dropzones
      document.querySelectorAll(".dropzone").forEach(z => {
        z.style.borderColor = "#333";
        z.style.opacity = "1";
        z.classList.remove("previewing");
        z.style.background = "#fafafa";
      });

      // After placing, if quizMode then check both boxes
      if (quizMode) {
        const p = document.getElementById("ansPuluh").textContent.trim();
        const s = document.getElementById("ansSa").textContent.trim();
        const ready = /^[0-9]$/.test(p) && /^[0-9]$/.test(s);
        if (ready) {
          // small delay to allow UX
          setTimeout(() => cekJawapan(), 120);
        }
      }

      // remove listeners
      window.removeEventListener("touchmove", onMove, { passive: false });
      window.removeEventListener("touchend", onEnd, { passive: false });
    }

    // attach listeners
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd, { passive: false });
  }

  // Attach touchstart to all number buttons using xTouchPlace
  // (this replaces any older touch handlers for .num)
  document.querySelectorAll(".num").forEach(n => {
    n.addEventListener("touchstart", function(e) {
      e.preventDefault();
      const t = e.touches[0];
      const numText = this.textContent.trim();
      xTouchPlace(numText, t);
    }, { passive: false });
  });

  // ========= pinjam touch for puluhBox (borrow) =========
  // keep original borrowing touch logic but ensure compatibility with xTouchPlace above
  if ('ontouchstart' in window) {
    // remove draggable attr so desktop drag doesn't interfere on touch devices
    document.querySelectorAll('[draggable="true"]').forEach(el => el.removeAttribute('draggable'));
  }

  let pinjamTouchStart = null;

  puluhBox.addEventListener("touchstart", e => {
    if (sudahPinjam || saTop >= saBottom) return;
    pinjamTouchStart = e.touches[0];
    puluhBox.classList.add("red");

    floatingText = document.createElement("div");
    floatingText.className = "floating10";
    floatingText.textContent = "10+";
    document.body.appendChild(floatingText);
  });

  puluhBox.addEventListener("touchmove", e => {
    if (!pinjamTouchStart || !floatingText) return;
    e.preventDefault();

    const touch = e.touches[0];
    floatingText.style.left = touch.pageX + 60 + "px";
    floatingText.style.top = touch.pageY - 80 + "px";
    floatingText.style.zIndex = "9999";

    let elem = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!elem) {
      const dx = [0, -1, 1, -2, 2];
      for (const x of dx) {
        elem = document.elementFromPoint(touch.clientX + x, touch.clientY);
        if (elem) break;
      }
    }

    const saTarget = elem && (elem.id === "saTop" || elem.closest && elem.closest("#saTop"));
    if (saTarget && !sudahPinjam) {
      saBox.classList.add("preview");
      saBox.textContent = saTop + 10;
      floatingText.textContent = `10+${saTop}`;
    } else {
      saBox.classList.remove("preview");
      saBox.textContent = saTop;
      floatingText.textContent = "10+";
    }
  }, { passive: false });

  puluhBox.addEventListener("touchend", e => {
    if (!pinjamTouchStart) return;

    const touch = e.changedTouches[0];
    let elem = document.elementFromPoint(touch.clientX, touch.clientY);

    if (!elem) {
      const dx = [0, -1, 1, -2, 2];
      for (const x of dx) {
        elem = document.elementFromPoint(touch.clientX + x, touch.clientY);
        if (elem) break;
      }
    }

    const saTarget = elem && (elem.id === "saTop" || elem.closest && elem.closest("#saTop"));
    if (saTarget && !sudahPinjam) {
      puluhTop -= 1;
      saTop += 10;
      sudahPinjam = true;

      puluhBox.textContent = puluhTop;
      saBox.textContent = saTop;
      puluhBox.classList.add("red");
      saBox.classList.add("green");
      saBox.classList.remove("preview");
    } else {
      puluhBox.textContent = puluhTop;
      puluhBox.classList.remove("red");
      saBox.textContent = saTop;
      saBox.classList.remove("preview");
    }

    if (floatingText) {
      floatingText.remove();
      floatingText = null;
    }

    pinjamTouchStart = null;
  });

  // ============================
  // CEK JAWAPAN
  // ============================
  function cekJawapan() {
    const ansPuluh = document.getElementById("ansPuluh").textContent.trim();
    const ansSa = document.getElementById("ansSa").textContent.trim();

    let saResult = saTop - saBottom;
    let puluhResult = puluhTop - puluhBottom;

    if (!sudahPinjam && saTop < saBottom) {
      saResult = saTop + 10 - saBottom;
      puluhResult = puluhTop - 1 - puluhBottom;
    }

    const betul = (ansPuluh == puluhResult && ansSa == saResult);

    if (quizMode) {
      if (betul) score++;
      setTimeout(() => soalanBaru(), 260);
      return;
    }

    // ========= NORMAL MODE =========
    feedback.style.display = "block";

    if (betul) {
      feedback.textContent = "✅ Betul!";
      feedback.style.color = "green";
    } else {
      feedback.textContent = `❌ Salah! Jawapan: ${puluhResult}${saResult}`;
      feedback.style.color = "red";
    }
  }

  window.cekJawapan = cekJawapan;
  window.soalanBaru = soalanBaru;
});

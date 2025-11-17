document.addEventListener("DOMContentLoaded", () => {
  let puluhTop, saTop, puluhBottom, saBottom;
  let sudahPinjam = false;
  let floatingText = null;

  const puluhBox = document.getElementById("puluhTop");
  const saBox = document.getElementById("saTop");
  const puluhBottomBox = document.getElementById("puluhBottom");
  const saBottomBox = document.getElementById("saBottom");
  const feedback = document.getElementById("feedback");

  // ============================
  // 🧮 JANA SOALAN BARU
  // ============================
  function soalanBaru() {
    feedback.style.display = "none";
    numberPad.style.display = "block";
    sudahPinjam = false;
    feedback.textContent = "";
    feedback.style.color = "black";

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
  // 🖱️ DRAG START (DESKTOP)
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
    e.dataTransfer.setData("text/plain", "10+");
  });

  window.addEventListener("dragover", e => {
    if (!floatingText) return;
    floatingText.style.left = e.pageX + 40 + "px";
    floatingText.style.top = e.pageY - 30 + "px";
  });

  saBox.addEventListener("dragover", e => e.preventDefault());
  saBox.addEventListener("dragenter", e => {
    e.preventDefault();
    if (!sudahPinjam) {
      saBox.classList.add("preview");
      saBox.textContent = saTop + 10;
      if (floatingText) floatingText.textContent = `10+${saTop}`;
    }
  });

  saBox.addEventListener("dragleave", e => {
    e.preventDefault();
    if (!sudahPinjam) {
      saBox.classList.remove("preview");
      saBox.textContent = saTop;
      if (floatingText) floatingText.textContent = "10+";
    }
  });

  saBox.addEventListener("drop", e => {
    e.preventDefault();
    if (sudahPinjam) return;
    puluhTop -= 1;
    saTop += 10;
    sudahPinjam = true;

    puluhBox.textContent = puluhTop;
    saBox.textContent = saTop;
    puluhBox.classList.add("red");
    saBox.classList.add("green");
    saBox.classList.remove("preview");

    if (floatingText) floatingText.remove();
    floatingText = null;
  });

  puluhBox.addEventListener("dragend", () => {
    if (!sudahPinjam) {
      puluhBox.textContent = puluhTop;
      puluhBox.classList.remove("red");
      saBox.textContent = saTop;
      saBox.classList.remove("preview");
    }
    if (floatingText) {
      floatingText.remove();
      floatingText = null;
    }
  });

  // ============================
  // 🔢 DRAG & DROP JAWAPAN (DESKTOP)
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
    });
  });

  // ============================
  // ✅ SEMAK JAWAPAN
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

    // 🔥 HIDE numberPad, SHOW feedback
    numberPad.style.display = "none";
    feedback.style.display  = "block";

    if (ansPuluh == puluhResult && ansSa == saResult) {
      feedback.textContent = "✅ Betul! Hebat!";
      feedback.style.color = "green";
    } else {
      feedback.textContent = `❌ Salah! Jawapan sebenar ialah ${puluhResult}${saResult}`;
      feedback.style.color = "red";
    }
  }

  window.cekJawapan = cekJawapan;
  window.soalanBaru = soalanBaru;

  // ============================
  // 📱 SOKONGAN SENTUHAN (iPad/iPhone)
  // ============================
  if ('ontouchstart' in window) {
    document.querySelectorAll('[draggable="true"]').forEach(el => el.removeAttribute('draggable'));
  }

  // --- Pinjam (puluhTop → saTop) ---
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

    const saTarget = elem && (elem.id === "saTop" || elem.closest("#saTop"));
    if (saTarget && !sudahPinjam) {
      saBox.classList.add("preview");
      saBox.textContent = saTop + 10;
      floatingText.textContent = `10+${saTop}`;
    } else {
      saBox.classList.remove("preview");
      saBox.textContent = saTop;
      floatingText.textContent = "10+";
    }
  });

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

    const saTarget = elem && (elem.id === "saTop" || elem.closest("#saTop"));
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

  // --- Drag Jawapan (Touch + Floating Preview) ---
  const draggables = document.querySelectorAll(".num");
  let activeFloat = null;

  draggables.forEach(num => {
    num.addEventListener("touchstart", e => {
      e.preventDefault();
      num.classList.add("dragging");

      if (activeFloat) activeFloat.remove();
      activeFloat = document.createElement("div");
      activeFloat.className = "floating10";
      activeFloat.textContent = num.textContent;
      document.body.appendChild(activeFloat);

      const touch = e.touches[0];
      activeFloat.style.left = touch.pageX + 60 + "px";
      activeFloat.style.top = touch.pageY - 80 + "px";
      activeFloat.style.zIndex = "9999";
    });

    num.addEventListener("touchmove", e => {
      e.preventDefault();

      const touch = e.touches[0];
      const elem = document.elementFromPoint(touch.clientX, touch.clientY);
      const dropzone = elem?.closest(".dropzone");

      if (activeFloat) {
        activeFloat.style.left = touch.pageX + 60 + "px";
        activeFloat.style.top = touch.pageY - 80 + "px";
      }

      document.querySelectorAll(".dropzone").forEach(z => {
        z.style.borderColor = "#333";
        z.style.opacity = "1";
        z.classList.remove("previewing");
        if (!z.textContent.trim()) z.textContent = "_";
      });

      if (dropzone) {
        dropzone.style.borderColor = "#4CAF50";
        dropzone.style.background = "#e6ffe6";
        dropzone.textContent = num.textContent;
        dropzone.style.opacity = "0.6";
        dropzone.classList.add("previewing");
      }
    });

    num.addEventListener("touchend", e => {
      const touch = e.changedTouches[0];
      const elem = document.elementFromPoint(touch.clientX, touch.clientY);
      const dropzone = elem?.closest(".dropzone");

      if (dropzone) {
        dropzone.textContent = num.textContent;
        dropzone.style.color = "#000";
        dropzone.style.borderColor = "#4CAF50";
        dropzone.style.background = "#fff";
      }

      if (activeFloat) {
        activeFloat.style.transition = "opacity 0.3s ease";
        activeFloat.style.opacity = "0";
        setTimeout(() => {
          activeFloat.remove();
          activeFloat = null;
        }, 300);
      }

      document.querySelectorAll(".dropzone").forEach(z => {
        z.style.borderColor = "#333";
        z.style.opacity = "1";
        z.classList.remove("previewing");
        z.style.background = "#fafafa";
      });

      num.classList.remove("dragging");
    });
  });
});

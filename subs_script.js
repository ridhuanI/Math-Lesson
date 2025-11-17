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
      document.getElementById("btnCek").style.display = "none";
      document.getElementById("btnBaru").style.display = "none";
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

      // HUD UPDATE
      hud.style.display = "block";   // 🔥 WAJIB — TAMBAH INI
      hud.textContent = `Soalan ${currentSoalan} / ${totalSoalan}`;
    } else {
      hud.textContent = ""; // normal mode
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
    document.getElementById("btnCek").style.display = "inline-block";
    document.getElementById("btnBaru").style.display = "inline-block";

    quizMode = false;
    hud.textContent = "";

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
  // DROP ANSWER (DESKTOP)
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

      // 🔥 QUIZ MODE FIX: auto-next only when BOTH boxes filled
      if (quizMode) {
        const p = document.getElementById("ansPuluh").textContent.trim();
        const s = document.getElementById("ansSa").textContent.trim();

        const ready = /^[0-9]$/.test(p) && /^[0-9]$/.test(s);

        if (ready) {
          setTimeout(() => cekJawapan(), 120);
        }
      }

    });
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

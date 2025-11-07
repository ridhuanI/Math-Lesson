document.addEventListener("DOMContentLoaded", () => {
  let puluhTop, saTop, puluhBottom, saBottom;
  let sudahPinjam = false;
  let floatingText = null;

  const puluhBox = document.getElementById("puluhTop");
  const saBox = document.getElementById("saTop");
  const puluhBottomBox = document.getElementById("puluhBottom");
  const saBottomBox = document.getElementById("saBottom");
  const feedback = document.getElementById("feedback");

  // =====================
  //  🧮 JANA SOALAN BARU
  // =====================
  function soalanBaru() {
    sudahPinjam = false;
    feedback.textContent = "";
    feedback.style.color = "black";

    puluhTop = Math.floor(Math.random() * 8) + 2; // 2–9
    saTop = Math.floor(Math.random() * 9) + 1;
    puluhBottom = Math.floor(Math.random() * 8) + 1;
    saBottom = Math.floor(Math.random() * 9) + 1;

    const perluPinjam = Math.random() < 0.5;

    if (perluPinjam) {
      if (saTop >= saBottom) [saTop, saBottom] = [saBottom, saTop];
      const numTop = puluhTop * 10 + saTop;
      const numBottom = puluhBottom * 10 + saBottom;
      if (numTop < numBottom) puluhTop = puluhBottom + 1;
    } else {
      if (saTop < saBottom) [saTop, saBottom] = [saBottom, saTop];
      const numTop = puluhTop * 10 + saTop;
      const numBottom = puluhBottom * 10 + saBottom;
      if (numTop < numBottom) puluhTop = puluhBottom + 1;
    }

    puluhBox.textContent = puluhTop;
    saBox.textContent = saTop;
    puluhBottomBox.textContent = puluhBottom;
    saBottomBox.textContent = saBottom;

    puluhBox.classList.remove("red");
    saBox.classList.remove("green", "preview");

    document.querySelectorAll(".dropzone").forEach(z => {
      z.textContent = "_";
      z.style.color = "#999";
      z.style.borderColor = "#333";
    });
  }

  soalanBaru();

  // =====================
  //  🖱️ DRAG START
  // =====================
  puluhBox.addEventListener("dragstart", e => {
    // kalau dah pernah pinjam, stop terus
    if (sudahPinjam) {
      e.preventDefault();
      return;
    }

    // jika tak perlu pinjam (contoh: saTop >= saBottom), cegah terus sebelum ubah apa-apa
    if (saTop >= saBottom) {
      e.preventDefault();

      // 🔧 buang floating text kalau sempat dibuat
      if (floatingText) {
        floatingText.remove();
        floatingText = null;
      }

      // Optional: tunjuk cue visual ringkas
      puluhBox.style.background = "#ffd6d6";
      setTimeout(() => (puluhBox.style.background = "#fff"), 250);

      // pastikan nombor & warna tak berubah
      puluhBox.textContent = puluhTop;
      puluhBox.classList.remove("red");
      return;
    }

    // ✅ Perlu pinjam – proceed macam biasa
    floatingText = document.createElement("div");
    floatingText.className = "floating10";
    floatingText.textContent = "10+";
    document.body.appendChild(floatingText);

    // Hilangkan ghost image default
    const img = new Image();
    img.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
    e.dataTransfer.setDragImage(img, 0, 0);

    // Preview nilai kiri (puluh) berkurang dulu
    puluhBox.textContent = puluhTop - 1;
    puluhBox.classList.add("red");

    e.dataTransfer.setData("text/plain", "10+");
  });

  // =====================
  //  🖱️ DRAG MOVE
  // =====================
  window.addEventListener("dragover", e => {
    if (!floatingText) return;

    // offset ke kanan 40px dan ke atas 30px
    const offsetX = 40;
    const offsetY = -30;

    floatingText.style.left = e.pageX + offsetX + "px";
    floatingText.style.top = e.pageY + offsetY + "px";
  });

  // =====================
  //  🟩 HOVER & DROP LOGIC
  // =====================
  saBox.addEventListener("dragover", e => e.preventDefault());

  saBox.addEventListener("dragenter", e => {
    e.preventDefault();
    if (!sudahPinjam) {
      const saValue = parseInt(saBox.textContent);
      saBox.classList.add("preview");
      saBox.textContent = saValue + 10;
      if (floatingText) floatingText.textContent = `10+${saValue}`;
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

    if (floatingText) {
      floatingText.remove();
      floatingText = null;
    }
  });

  puluhBox.addEventListener("dragend", e => {
    if (!sudahPinjam) {
      puluhBox.textContent = puluhTop;
      puluhBox.classList.remove("red");
      saBox.textContent = saTop;
      saBox.classList.remove("preview");
      if (floatingText) floatingText.textContent = "10+";
    }
    if (floatingText) {
      floatingText.remove();
      floatingText = null;
    }
  });

  // =====================
  //  🔢 DRAG & DROP JAWAPAN
  // =====================
  const nums = document.querySelectorAll(".num");
  nums.forEach(num => {
    num.addEventListener("dragstart", e =>
      e.dataTransfer.setData("text/plain", num.textContent)
    );
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

  // =====================
  //  ✅ SEMAK JAWAPAN
  // =====================
  function cekJawapan() {
    const ansPuluh = document.getElementById("ansPuluh").textContent.trim();
    const ansSa = document.getElementById("ansSa").textContent.trim();

    let saResult = saTop - saBottom;
    let puluhResult = puluhTop - puluhBottom;

    if (!sudahPinjam && saTop < saBottom) {
      saResult = saTop + 10 - saBottom;
      puluhResult = puluhTop - 1 - puluhBottom;
    }

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

  // =====================
  //  📱 SOKONGAN SENTUHAN UNTUK TELEFON
  // =====================
  const draggables = document.querySelectorAll(".num");
  let activeNum = null;

  draggables.forEach(num => {
    // Bila mula sentuh
    num.addEventListener("touchstart", e => {
      activeNum = num;
      num.classList.add("dragging");
    });

    // Bila jari sedang gerak
    num.addEventListener("touchmove", e => {
      e.preventDefault();
      const touch = e.touches[0];
      const elem = document.elementFromPoint(touch.clientX, touch.clientY);
      const dropzone = elem?.closest(".dropzone");
      document.querySelectorAll(".dropzone").forEach(z => z.style.borderColor = "#333");
      if (dropzone) dropzone.style.borderColor = "#4CAF50";
    });

    // Bila jari lepas (drop)
    num.addEventListener("touchend", e => {
      const touch = e.changedTouches[0];
      const elem = document.elementFromPoint(touch.clientX, touch.clientY);
      const dropzone = elem?.closest(".dropzone");
      if (dropzone) {
        dropzone.textContent = num.textContent;
        dropzone.style.color = "#000";
        dropzone.style.borderColor = "#4CAF50";
      }
      num.classList.remove("dragging");
      activeNum = null;
    });
  });
});

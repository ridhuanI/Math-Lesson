document.addEventListener("DOMContentLoaded", () => {

  let puluhTop, saTop, puluhBottom, saBottom;
  let sudahBawa = false;

  const puluhBox = document.getElementById("puluhTop");
  const saBox = document.getElementById("saTop");
  const puluhBottomBox = document.getElementById("puluhBottom");
  const saBottomBox = document.getElementById("saBottom");
  const carryBox = document.getElementById("carryPuluh");
  const feedback = document.getElementById("feedback");

  // ======================================================
  // ALIGN CARRY BOX EXACT POSITION
  // ======================================================
  function alignCarryBox() {
    const puluhRect = puluhBox.getBoundingClientRect();
    const containerRect = document.getElementById("carryContainer").getBoundingClientRect();

    // center exactly above puluhTop
    carryBox.style.left =
      (puluhRect.x + puluhRect.width / 2 - containerRect.x - 20) + "px";
  }

  // ======================================================
  // GENERATE VALID QUESTION (< 100 RESULT)
  // ======================================================
  function soalanBaru() {
    sudahBawa = false;
    feedback.textContent = "";
    carryBox.innerHTML = "&nbsp;";
    carryBox.style.display = "none";

    while (true) {
      puluhTop = Math.floor(Math.random() * 9);
      puluhBottom = Math.floor(Math.random() * 9);
      saTop = Math.floor(Math.random() * 10);
      saBottom = Math.floor(Math.random() * 10);

      const saTotal = saTop + saBottom;
      const carry = saTotal >= 10 ? 1 : 0;
      const puluhTotal = puluhTop + puluhBottom + carry;

      if (puluhTotal < 10) break;
    }

    puluhBox.textContent = puluhTop;
    saBox.textContent = saTop;
    puluhBottomBox.textContent = puluhBottom;
    saBottomBox.textContent = saBottom;

    document.querySelectorAll(".dropzone").forEach(z => {
      z.textContent = "_";
      z.style.color = "#999";
      z.style.borderColor = "#333";
    });

    // align carry after layout update
    setTimeout(alignCarryBox, 50);
  }

  soalanBaru();


  // DRAG NUMBERS
  const nums = document.querySelectorAll(".num");
  nums.forEach(num => {
    num.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", num.textContent);
    });
  });

  // DROP TO ANSWER
  const drops = document.querySelectorAll(".dropzone");

  drops.forEach(drop => {
    drop.addEventListener("dragover", e => e.preventDefault());

    drop.addEventListener("drop", e => {
      e.preventDefault();

      const data = parseInt(e.dataTransfer.getData("text/plain"));
      drop.textContent = data;
      drop.style.color = "#000";
      drop.style.borderColor = "#4CAF50";

      // CARRY DETECT IMMEDIATELY
      if (drop.id === "ansSa") {
        const jumlahSa = saTop + saBottom;
        if (jumlahSa >= 10 && !sudahBawa) {
          sudahBawa = true;
          tunjukCarry();
        }
      }
    });
  });

  // CHECK ANSWER
  function cekJawapan() {
    const ansPuluh = document.getElementById("ansPuluh").textContent.trim();
    const ansSa = document.getElementById("ansSa").textContent.trim();

    let saSum = saTop + saBottom;
    let puluhSum = puluhTop + puluhBottom;
    let carry = 0;

    if (saSum >= 10) {
      carry = 1;
      saSum -= 10;
    }

    puluhSum += carry;

    if (ansPuluh == puluhSum && ansSa == saSum) {
      feedback.textContent = "✅ Betul! Hebat!";
      feedback.style.color = "green";
    } else {
      feedback.textContent = `❌ Salah! Jawapan sebenar ialah ${puluhSum}${saSum}`;
      feedback.style.color = "red";
    }
  }

  window.cekJawapan = cekJawapan;
  window.soalanBaru = soalanBaru;


  // ANIMASI CARRY +10
  function tunjukCarry() {
    const float = document.createElement("div");
    float.className = "floating10";
    float.textContent = "+10";
    document.body.appendChild(float);

    // START point = SA box
    const start = saBox.getBoundingClientRect();
    const end   = carryBox.getBoundingClientRect();

    let startX = start.x + 40;
    let startY = start.y - 10;

    let endX = end.x + 10;
    let endY = end.y - 10;

    float.style.left = startX + "px";
    float.style.top  = startY + "px";
    float.style.opacity = "1";

    // Duration
    const duration = 450;
    const startTime = performance.now();

    function animate(time) {
        const progress = Math.min((time - startTime) / duration, 1);

        // Smooth ease-out curve
        const ease = 1 - Math.pow(1 - progress, 3);

        // CURVED path (slight arc upward)
        const curveHeight = -35;  // lebih besar = lebih melengkung
        const currentX = startX + (endX - startX) * ease;
        const currentY =
            startY +
            (endY - startY) * ease +
            curveHeight * (1 - ease) * ease; // arc

        float.style.left = currentX + "px";
        float.style.top  = currentY + "px";

        // Fade & shrink when reaching
        float.style.opacity = 1 - progress;
        float.style.transform = `scale(${1 - progress * 0.3})`;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            float.remove();
            carryBox.style.display = "block";
            carryBox.textContent = "1";
            alignCarryBox();
        }
    }

    requestAnimationFrame(animate);
}

  // realign on resize
  window.addEventListener("resize", alignCarryBox);

});

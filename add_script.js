// ---------------------------
// add_script.js (patched)
// ---------------------------
document.addEventListener("DOMContentLoaded", () => {

    // QUIZ MODE FLAGS
    let quizMode = false;
    let totalQuestions = 0;
    let currentQ = 0;
    let scoreQ = 0;
    let quizOp = "";   // tambah / tolak / mix

    // =====================================================
    // ELEMENT REFS (declare early so quiz param code can use them)
    // =====================================================
    const hud = document.getElementById("hud");
    const numberPad = document.getElementById("numberPad");
    const feedback = document.getElementById("feedback");

    // QUIZ PARAM DETECTOR (after element refs exist)
    const params = new URLSearchParams(window.location.search);

    if (params.get("quiz") === "1") {
        quizMode = true;
        totalQuestions = Number(params.get("q")) || 10;
        quizOp = params.get("op") || "tambah";

        if (hud) hud.style.display = "block";
        if (feedback) feedback.style.display = "none";  // disable normal feedback panel

        // hide the manual buttons if they exist
        const cekBtn = document.querySelector('button[onclick="cekJawapan()"]');
        const newQBtn = document.querySelector('button[onclick="soalanBaru()"]');
        if (cekBtn) cekBtn.style.display = "none";
        if (newQBtn) newQBtn.style.display = "none";
    }

    // =====================================================
    // VARIABLE DECLARATIONS
    // =====================================================
    let puluhTop, saTop, puluhBottom, saBottom;
    let sudahBawa = false;

    const puluhBox        = document.getElementById("puluhTop");
    const saBox           = document.getElementById("saTop");
    const puluhBottomBox  = document.getElementById("puluhBottom");
    const saBottomBox     = document.getElementById("saBottom");
    const carryBox        = document.getElementById("carryPuluh");

    // =====================================================
    // ALIGN CARRY BOX EXACT POSITION
    // =====================================================
    function alignCarryBox() {
        if (!puluhBox || !carryBox) return;
        const puluhRect     = puluhBox.getBoundingClientRect();
        const containerRect = document.getElementById("carryContainer").getBoundingClientRect();

        carryBox.style.left =
            (puluhRect.x + puluhRect.width / 2 - containerRect.x - 20) + "px";
    }

    // =====================================================
    // GENERATE QUESTION (<100 RESULT)
    // =====================================================
    function soalanBaru() {
        if (quizMode) {
            currentQ++;

            if (currentQ > totalQuestions) {
                tamatQuiz();
                return;
            }

            updateHUD();
        }

        if (feedback) feedback.style.display = "none";
        if (numberPad) numberPad.style.display = "block";
        sudahBawa = false;
        if (feedback) feedback.textContent = "";
        if (carryBox) {
            carryBox.style.display = "none";
            carryBox.style.opacity = "0";
            carryBox.textContent = "";
        }

        while (true) {
            puluhTop     = Math.floor(Math.random() * 9);
            puluhBottom  = Math.floor(Math.random() * 9);
            saTop        = Math.floor(Math.random() * 10);
            saBottom     = Math.floor(Math.random() * 10);

            const saTotal    = saTop + saBottom;
            const carry      = saTotal >= 10 ? 1 : 0;
            const puluhTotal = puluhTop + puluhBottom + carry;

            if (puluhTotal < 10) break;
        }

        if (puluhBox) puluhBox.textContent       = puluhTop;
        if (saBox) saBox.textContent             = saTop;
        if (puluhBottomBox) puluhBottomBox.textContent = puluhBottom;
        if (saBottomBox) saBottomBox.textContent = saBottom;

        document.querySelectorAll(".dropzone").forEach(z => {
            z.textContent     = "_";
            z.style.color     = "#999";
            z.style.borderColor = "#333";
            z.style.background = "";
        });

        requestAnimationFrame(alignCarryBox);
    }

    function updateHUD() {
        if (!hud) return;
        hud.textContent = `Soalan ${currentQ} / ${totalQuestions}`;
    }

    function tamatQuiz() {
        const wrong = totalQuestions - scoreQ;
        const acc = Math.round((scoreQ / totalQuestions) * 100);

        // Redirect ke quiz_result.html
        location.href = `quiz_result.html?betul=${scoreQ}&salah=${wrong}&acc=${acc}`;
    }


    soalanBaru();


    // =====================================================
    // DESKTOP DRAG & DROP
    // =====================================================
    const nums  = document.querySelectorAll(".num");
    const drops = document.querySelectorAll(".dropzone");

    nums.forEach(num => {
        num.addEventListener("dragstart", e => {
            e.dataTransfer.setData("text/plain", num.textContent);
        });
    });

    drops.forEach(drop => {
        drop.addEventListener("dragover", e => e.preventDefault());

        drop.addEventListener("drop", e => {
            e.preventDefault();

            const raw = e.dataTransfer.getData("text/plain");
            const data = isNaN(parseInt(raw, 10)) ? raw : parseInt(raw, 10);

            drop.textContent     = data;
            drop.style.color     = "#000";
            drop.style.borderColor = "#4CAF50";

            if (drop.id === "ansSa") {
                const jumlahSa = saTop + saBottom;
                if (jumlahSa >= 10 && !sudahBawa) {
                    sudahBawa = true;
                    tunjukCarry();
                }
            }

            // ===== QUIZ MODE AUTO-CHECK AFTER EACH DROP =====
            if (quizMode) {
                const puluhFilled = document.getElementById("ansPuluh").textContent.trim() !== "_";
                const saFilled    = document.getElementById("ansSa").textContent.trim() !== "_";

                if (puluhFilled && saFilled) {
                    // run cekJawapan silently (it already handles quizMode branch)
                    cekJawapan();
                }
            }
        });
    });


    // =====================================================
    // CHECK ANSWER
    // =====================================================
    function cekJawapan() {

        const ansPuluh = document.getElementById("ansPuluh").textContent.trim();
        const ansSa    = document.getElementById("ansSa").textContent.trim();

        let saSum    = saTop + saBottom;
        let puluhSum = puluhTop + puluhBottom;
        let carry    = 0;

        if (saSum >= 10) {
            carry = 1;
            saSum -= 10;
        }

        puluhSum += carry;

        // ============================================
        // 🔥 QUIZ MODE OVERRIDE (NO FEEDBACK)
        // ============================================

        if (quizMode) {

            // Kira markah senyap
            if (ansPuluh == puluhSum && ansSa == saSum) {
                scoreQ++;
            }

            // Auto soalan baru
            setTimeout(() => {
                soalanBaru();
            }, 200);

            return; // STOP behaviour biasa!
        }

        // ============================================
        // NORMAL MODE (WITH FEEDBACK)
        // ============================================

        // Hide number pad, show feedback panel
        if (numberPad) numberPad.style.display = "none";
        if (feedback) feedback.style.display = "block";

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


    // =====================================================
    // SUPER SMOOTH CURVED +10 FLY ANIMATION
    // =====================================================
    function tunjukCarry() {

        if (!carryBox || !saBox) return;

        // Make carryBox visible (but invisible initially)
        carryBox.style.display = "block";
        carryBox.style.opacity = "0";
        alignCarryBox();

        const float = document.createElement("div");
        float.className = "floating10";
        float.textContent = "+10";
        document.body.appendChild(float);

        const start = saBox.getBoundingClientRect();
        let startX = start.x + start.width / 2;
        let startY = start.y + start.height / 2;

        const end = carryBox.getBoundingClientRect();
        let endX = end.x + end.width / 2;
        let endY = end.y + end.height / 2;

        float.style.left   = startX + "px";
        float.style.top    = startY + "px";
        float.style.opacity = "1";

        const duration  = 450;
        const startTime = performance.now();

        function animate(time) {
            const progress = Math.min((time - startTime) / duration, 1);
            const ease     = 1 - Math.pow(1 - progress, 3);

            const curveHeight = -35;
            const currentX = startX + (endX - startX) * ease;
            const currentY =
                startY +
                (endY - startY) * ease +
                curveHeight * (1 - ease) * ease;

            float.style.left     = currentX + "px";
            float.style.top      = currentY + "px";
            float.style.opacity  = 1 - progress;
            float.style.transform = `scale(${1 - progress * 0.3})`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                float.remove();
                carryBox.style.opacity = "1";
                carryBox.textContent   = "1";
            }
        }

        requestAnimationFrame(animate);
    }

// =====================================================
    // TOUCH SUPPORT (iPad / iPhone / Android)
    // Floating number preview (exact like subtraction)
    // =====================================================
    let previewFloat = null;

    nums.forEach(num => {

        // TOUCH START
        num.addEventListener("touchstart", e => {
            e.preventDefault();

            if (previewFloat) previewFloat.remove();

            previewFloat = document.createElement("div");
            previewFloat.className = "floating-preview";
            previewFloat.textContent = num.textContent;
            document.body.appendChild(previewFloat);

            const touch = e.touches[0];
            previewFloat.style.left = touch.pageX + "px";
            previewFloat.style.top  = touch.pageY + "px";

            num.style.opacity = "0.3";
        });

        // TOUCH MOVE
        num.addEventListener("touchmove", e => {
            e.preventDefault();
            if (!previewFloat) return;

            const touch = e.touches[0];
            previewFloat.style.left = touch.pageX + "px";
            previewFloat.style.top  = touch.pageY + "px";

            let elem = document.elementFromPoint(touch.clientX, touch.clientY);
            const dropzone = elem?.closest(".dropzone");

            document.querySelectorAll(".dropzone").forEach(z => {
                z.style.borderColor = "#333";
                z.style.opacity = "1";
            });

            if (dropzone) {
                dropzone.style.borderColor = "#4CAF50";
                dropzone.style.opacity = "0.6";
            }
        });

        // TOUCH END
        num.addEventListener("touchend", e => {
            const touch = e.changedTouches[0];
            let elem = document.elementFromPoint(touch.clientX, touch.clientY);
            const dropzone = elem?.closest(".dropzone");

            if (dropzone) {
                dropzone.textContent = num.textContent;
                dropzone.style.color = "#000";
                dropzone.style.borderColor = "#4CAF50";

                if (dropzone.id === "ansSa") {
                    const jumlahSa = saTop + saBottom;
                    if (jumlahSa >= 10 && !sudahBawa) {
                        sudahBawa = true;
                        tunjukCarry();
                    }
                }
            }

            if (previewFloat) {
                previewFloat.remove();
                previewFloat = null;
            }

            num.style.opacity = "1";

            document.querySelectorAll(".dropzone").forEach(z => {
                z.style.opacity    = "1";
                z.style.borderColor = "#333";
            });

            // touch: after placing a digit, auto-check for quiz
            if (quizMode) {
                const puluhFilled = document.getElementById("ansPuluh").textContent.trim() !== "_";
                const saFilled    = document.getElementById("ansSa").textContent.trim() !== "_";

                if (puluhFilled && saFilled) {
                    cekJawapan();
                }
            }
        });

    });

    window.addEventListener("resize", alignCarryBox);

});


document.addEventListener("DOMContentLoaded", () => {

    // =============================
    // VARIABLES
    // =============================
    let puluhTop, saTop, puluhBottom, saBottom;
    let sudahPinjam = false;
    let previewPuluhDeducted = false;

    let floatBorrow = null;
    let rafId = null;
    let targetPos = { x: 0, y: 0 };
    let currentPos = { x: 0, y: 0 };
    let isTouchBorrow = false;

    let quizMode = false;
    let score = 0;
    let totalSoalan = 5;
    let currentSoalan = 0;

    // =============================
    // QUIZ PARAM CHECK
    // =============================
    const url = new URLSearchParams(window.location.search);
    if (url.get("quiz") === "1") {
        quizMode = true;
        totalSoalan = Number(url.get("q")) || 5;

        const b1 = document.getElementById("btnCek");
        const b2 = document.getElementById("btnBaru");
        if (b1) b1.style.display = "none";
        if (b2) b2.style.display = "none";
    }

    // =============================
    // ELEMENTS
    // =============================
    const puluhBox = document.getElementById("puluhTop");
    const saBox = document.getElementById("saTop");
    const puluhBottomBox = document.getElementById("puluhBottom");
    const saBottomBox = document.getElementById("saBottom");
    const hud = document.getElementById("hud");
    const feedback = document.getElementById("feedback");

    // Disable draggable on touch
    if ("ontouchstart" in window) {
        document.querySelectorAll(".num, #puluhTop").forEach(el =>
            el.removeAttribute("draggable")
        );
    }

    // =============================
    // SAFE ELEMENT-FROM-POINT
    // =============================
    function elementFromPointSafe(x, y) {
        let el = document.elementFromPoint(x, y);
        if (el) return el;

        const d = [1, -1, 2, -2];
        for (let dx of d) {
            for (let dy of d) {
                el = document.elementFromPoint(x + dx, y + dy);
                if (el) return el;
            }
        }
        return null;
    }

    // =============================
    // HUD
    // =============================
    function setHUD(t) {
        if (!hud) return;
        hud.style.display = t ? "block" : "none";
        hud.textContent = t || "";
    }

    // =============================
    // RENDER NUMBERS
    // =============================
    function renderNumbers() {
        puluhBox.textContent = previewPuluhDeducted ? puluhTop - 1 : puluhTop;
        saBox.textContent = saTop;
        puluhBottomBox.textContent = puluhBottom;
        saBottomBox.textContent = saBottom;
    }

    // =============================
    // NEW QUESTION
    // =============================
    function soalanBaru() {

        feedback.style.display = "none";

        sudahPinjam = false;
        previewPuluhDeducted = false;

        // Reset colors
        puluhBox.classList.remove("red");
        saBox.classList.remove("green", "preview");
        puluhBox.style.color = "";
        saBox.style.color = "";

        if (quizMode) {
            currentSoalan++;
            if (currentSoalan > totalSoalan) {
                const betul = score;
                const salah = totalSoalan - score;
                const acc = Math.round((betul / totalSoalan) * 100);
                location.href =
                    `quiz_result.html?betul=${betul}&salah=${salah}&acc=${acc}`;
                return;
            }
            setHUD(`Soalan ${currentSoalan} / ${totalSoalan}`);
        } else setHUD("");

        let perluPinjam = Math.random() < 0.5;

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

        renderNumbers();

        document.querySelectorAll(".dropzone").forEach(d => {
            d.textContent = "_";
            d.style.color = "#999";
            d.style.borderColor = "#333";
        });
    }

    soalanBaru();

    // =============================
    // FLOAT BORROW LERP
    // =============================
    function rafLoop() {
        currentPos.x += (targetPos.x - currentPos.x) * 0.22;
        currentPos.y += (targetPos.y - currentPos.y) * 0.22;
        if (floatBorrow) {
            floatBorrow.style.left = currentPos.x + "px";
            floatBorrow.style.top = currentPos.y + "px";
        }
        rafId = requestAnimationFrame(rafLoop);
    }

    function startFloatBorrow(x, y) {
        if (floatBorrow) floatBorrow.remove();

        floatBorrow = document.createElement("div");
        floatBorrow.className = "floating10";
        floatBorrow.textContent = "10+";
        floatBorrow.style.position = "absolute";
        floatBorrow.style.zIndex = "99999";
        floatBorrow.style.pointerEvents = "none";

        floatBorrow.style.left = x + "px";
        floatBorrow.style.top = y + "px";

        document.body.appendChild(floatBorrow);

        currentPos = { x, y };
        targetPos = { x, y };

        setTimeout(() => floatBorrow.classList.add("active"), 5);

        if (!rafId) rafLoop();
    }

    function updateFloatPreview(sa) {
        if (floatBorrow) floatBorrow.textContent = "10+" + sa;
    }
    function updateFloatDefault() {
        if (floatBorrow) floatBorrow.textContent = "10+";
    }

    function stopFloat() {
        if (!floatBorrow) return;

        floatBorrow.classList.remove("active");
        const f = floatBorrow;
        floatBorrow = null;

        setTimeout(() => {
            try { f.remove(); } catch (e) {}
            cancelAnimationFrame(rafId);
            rafId = null;
        }, 120);
    }

    // =============================
    // BORROW — MOUSE
    // =============================
    puluhBox.addEventListener("mousedown", e => {

        if (sudahPinjam || !(saTop < saBottom)) return;

        previewPuluhDeducted = true;
        puluhBox.classList.add("red");
        renderNumbers();

        startFloatBorrow(e.pageX, e.pageY - 25);

        function onMove(ev) {
            targetPos.x = ev.pageX;
            targetPos.y = ev.pageY - 25;

            const hit = elementFromPointSafe(ev.clientX, ev.clientY);
            const hoverSa = hit && (hit.id === "saTop" || hit.closest?.("#saTop"));

            if (hoverSa) {
                saBox.classList.add("preview");
                saBox.textContent = saTop + 10;
                updateFloatPreview(saTop);
            } else {
                saBox.classList.remove("preview");
                saBox.textContent = saTop;
                updateFloatDefault();
            }
        }

        function onUp(ev) {
            const hit = elementFromPointSafe(ev.clientX, ev.clientY);
            const hoverSa = hit && (hit.id === "saTop" || hit.closest?.("#saTop"));

            if (hoverSa) {
                puluhTop -= 1;
                saTop += 10;
                sudahPinjam = true;

                puluhBox.classList.add("red");
                saBox.classList.add("green");
                saBox.textContent = saTop;

            } else {
                previewPuluhDeducted = false;
                puluhBox.classList.remove("red");
                saBox.classList.remove("preview");
                renderNumbers();
            }

            stopFloat();
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        }

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    });

    // =============================
    // BORROW — TOUCH
    // =============================
    puluhBox.addEventListener("touchstart", e => {

        if (sudahPinjam || !(saTop < saBottom)) return;

        isTouchBorrow = true;

        previewPuluhDeducted = true;
        puluhBox.classList.add("red");
        renderNumbers();

        let t = e.touches[0];
        startFloatBorrow(t.pageX, t.pageY - 30);

    }, { passive:false });

    puluhBox.addEventListener("touchmove", e => {

        if (!isTouchBorrow) return;
        e.preventDefault();

        let t = e.touches[0];
        targetPos.x = t.pageX;
        targetPos.y = t.pageY - 30;

        const hit = elementFromPointSafe(t.clientX, t.clientY);
        const hoverSa = hit && (hit.id === "saTop" || hit.closest?.("#saTop"));

        if (hoverSa) {
            saBox.classList.add("preview");
            saBox.textContent = saTop + 10;
            updateFloatPreview(saTop);
        } else {
            saBox.classList.remove("preview");
            saBox.textContent = saTop;
            updateFloatDefault();
        }

    }, { passive:false });

    puluhBox.addEventListener("touchend", e => {

        if (!isTouchBorrow) return;
        isTouchBorrow = false;

        let t = e.changedTouches[0];
        const hit = elementFromPointSafe(t.clientX, t.clientY);
        const hoverSa = hit && (hit.id === "saTop" || hit.closest?.("#saTop"));

        if (hoverSa) {
            puluhTop -= 1;
            saTop += 10;
            sudahPinjam = true;

            puluhBox.classList.add("red");
            saBox.classList.add("green");
            saBox.textContent = saTop;

        } else {
            previewPuluhDeducted = false;
            puluhBox.classList.remove("red");
            saBox.classList.remove("preview");
            renderNumbers();
        }

        stopFloat();

    });

    // ============================================
    // NUMBER PAD — ADDITION-STYLE ANIMATION MERGE
    // ============================================
    const nums = document.querySelectorAll(".num");
    const dropzones = document.querySelectorAll(".dropzone");

    nums.forEach(num => {

        // TOUCH START (floating preview + opacity feedback)
        num.addEventListener("touchstart", e => {

            e.preventDefault();

            const digit = num.textContent;
            const touch = e.touches[0];

            // Floating preview
            const float = document.createElement("div");
            float.className = "floating-preview";
            float.textContent = digit;
            float.style.position = "absolute";
            float.style.zIndex = "99999";
            float.style.pointerEvents = "none";
            float.style.left = touch.pageX + "px";
            float.style.top = (touch.pageY - 40) + "px";

            document.body.appendChild(float);

            num.style.opacity = "0.4";

            function moveHandler(ev) {
                const t = ev.touches[0];
                float.style.left = t.pageX + "px";
                float.style.top = (t.pageY - 40) + "px";

                dropzones.forEach(dz => {
                    const rect = dz.getBoundingClientRect();
                    const inside =
                        t.clientX >= rect.left &&
                        t.clientX <= rect.right &&
                        t.clientY >= rect.top &&
                        t.clientY <= rect.bottom;

                    dz.style.background = inside ? "#ffedc2" : "";
                    dz.style.borderColor = inside ? "#ff9900" : "#333";
                });
            }

            function endHandler(ev) {
                const t = ev.changedTouches[0];
                const hit = elementFromPointSafe(t.clientX, t.clientY);
                const dz = hit && hit.closest?.(".dropzone");

                if (dz) {
                    dz.textContent = digit;
                    dz.style.color = "#000";
                    dz.style.borderColor = "#4CAF50";
                    if (quizMode) autoNext();
                }

                float.remove();
                num.style.opacity = "1";

                dropzones.forEach(dz => {
                    dz.style.background = "";
                    dz.style.borderColor = "#333";
                });

                window.removeEventListener("touchmove", moveHandler);
                window.removeEventListener("touchend", endHandler);
            }

            window.addEventListener("touchmove", moveHandler, { passive:false });
            window.addEventListener("touchend", endHandler, { passive:true });

        }, { passive:false });

        // PC click pop animation (same as addition)
        num.addEventListener("mousedown", () => {
            num.style.transform = "scale(1.15)";
            num.style.transition = "transform 0.12s";
        });

        num.addEventListener("mouseup", () => {
            num.style.transform = "scale(1)";
        });

        num.addEventListener("mouseleave", () => {
            num.style.transform = "scale(1)";
        });

    });

    // =============================
    // AUTO NEXT
    // =============================
    function autoNext() {
        if (!quizMode) return;

        const p = document.getElementById("ansPuluh").textContent.trim();
        const s = document.getElementById("ansSa").textContent.trim();

        if (/^[0-9]$/.test(p) && /^[0-9]$/.test(s)) {
            setTimeout(() => cekJawapan(), 150);
        }
    }

    // =============================
    // CEK JAWAPAN
    // =============================
    window.cekJawapan = function() {

        const ansP = document.getElementById("ansPuluh").textContent.trim();
        const ansS = document.getElementById("ansSa").textContent.trim();

        let saRes = saTop - saBottom;
        let pulRes = puluhTop - puluhBottom;

        if (!sudahPinjam && saTop < saBottom) {
            saRes = saTop + 10 - saBottom;
            pulRes = puluhTop - 1 - puluhBottom;
        }

        const betul = (ansP == pulRes && ansS == saRes);

        if (quizMode) {
            if (betul) score++;
            setTimeout(() => soalanBaru(), 180);
            return;
        }

        feedback.style.display = "block";
        feedback.style.color = betul ? "green" : "red";
        feedback.textContent = betul ?
            "Betul!" :
            `Salah! Jawapan sebenar: ${pulRes}${saRes}`;
    };

    window.soalanBaru = soalanBaru;
});

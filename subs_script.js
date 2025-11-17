document.addEventListener("DOMContentLoaded", () => {

    let puluhTop, saTop, puluhBottom, saBottom;
    let sudahPinjam = false;

    let quizMode = false;
    let score = 0;
    let totalSoalan = 5;
    let currentSoalan = 0;

    const url = new URLSearchParams(window.location.search);
    if (url.get("quiz") === "1") {
        quizMode = true;
        totalSoalan = Number(url.get("q")) || 5;
        document.getElementById("btnCek").style.display = "none";
        document.getElementById("btnBaru").style.display = "none";
    }

    const puluhBox = document.getElementById("puluhTop");
    const saBox = document.getElementById("saTop");
    const puluhBottomBox = document.getElementById("puluhBottom");
    const saBottomBox = document.getElementById("saBottom");
    const hud = document.getElementById("hud");
    const feedback = document.getElementById("feedback");

    // ==========================================================
    //  JANA SOALAN BARU
    // ==========================================================
    function soalanBaru() {

        feedback.style.display = "none";
        sudahPinjam = false;

        if (quizMode) {
            currentSoalan++;
            if (currentSoalan > totalSoalan) {
                tamatQuiz();
                return;
            }
            hud.style.display = "block";
            hud.textContent = `Soalan ${currentSoalan} / ${totalSoalan}`;
        } else {
            hud.style.display = "none";
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

        document.querySelectorAll(".dropzone").forEach(z => {
            z.textContent = "_";
            z.style.color = "#999";
            z.style.borderColor = "#333";
        });

    }
    soalanBaru();

    // ==========================================================
    //  QUIZ TAMAT
    // ==========================================================
    function tamatQuiz() {
        document.getElementById("btnCek").style.display = "inline-block";
        document.getElementById("btnBaru").style.display = "inline-block";

        quizMode = false;
        hud.style.display = "none";

        let betul = score;
        let salah = totalSoalan - score;
        let acc = Math.round((betul / totalSoalan) * 100);

        location.href = `quiz_result.html?betul=${betul}&salah=${salah}&acc=${acc}`;
    }

    // ==========================================================
    //  BORROW SYSTEM (SEPARATED EVENT SYSTEM)
    // ==========================================================

    let floatingBorrow = null;
    let isTouchBorrow = false;

    // DESKTOP BORROW
    puluhBox.addEventListener("dragstart", e => {
        if (sudahPinjam || saTop >= saBottom) return;

        floatingBorrow = document.createElement("div");
        floatingBorrow.className = "floating10";
        floatingBorrow.textContent = "10+";
        document.body.appendChild(floatingBorrow);

        const img = new Image();
        img.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
        e.dataTransfer.setDragImage(img, 0, 0);

        puluhBox.textContent = puluhTop - 1;
    });

    window.addEventListener("dragover", e => {
        if (floatingBorrow) {
            floatingBorrow.style.left = e.pageX + "px";
            floatingBorrow.style.top = (e.pageY - 40) + "px";
        }
    });

    saBox.addEventListener("dragover", e => e.preventDefault());

    saBox.addEventListener("drop", () => {
        if (sudahPinjam) return;
        puluhTop -= 1;
        saTop += 10;
        sudahPinjam = true;

        puluhBox.textContent = puluhTop;
        saBox.textContent = saTop;

        floatingBorrow?.remove();
        floatingBorrow = null;
    });

    puluhBox.addEventListener("dragend", () => {
        if (!sudahPinjam) puluhBox.textContent = puluhTop;
        floatingBorrow?.remove();
        floatingBorrow = null;
    });

    // TOUCH BORROW
    puluhBox.addEventListener("touchstart", e => {
        if (sudahPinjam || saTop >= saBottom) return;
        isTouchBorrow = true;

        floatingBorrow = document.createElement("div");
        floatingBorrow.className = "floating10";
        floatingBorrow.textContent = "10+";
        floatingBorrow.style.position = "absolute";
        document.body.appendChild(floatingBorrow);
    }, { passive: false });

    puluhBox.addEventListener("touchmove", e => {
        if (!isTouchBorrow || !floatingBorrow) return;
        e.preventDefault();

        const t = e.touches[0];
        floatingBorrow.style.left = t.pageX + "px";
        floatingBorrow.style.top = (t.pageY - 50) + "px";

        let hit = document.elementFromPoint(t.clientX, t.clientY);
        if (hit?.id === "saTop") {
            saBox.textContent = saTop + 10;
        } else {
            saBox.textContent = saTop;
        }
    }, { passive: false });

    puluhBox.addEventListener("touchend", e => {
        if (!isTouchBorrow) return;
        isTouchBorrow = false;

        const t = e.changedTouches[0];
        let hit = document.elementFromPoint(t.clientX, t.clientY);

        if (hit?.id === "saTop" && !sudahPinjam) {
            puluhTop -= 1;
            saTop += 10;
            sudahPinjam = true;

            puluhBox.textContent = puluhTop;
            saBox.textContent = saTop;
        } else {
            saBox.textContent = saTop;
        }

        floatingBorrow?.remove();
        floatingBorrow = null;
    });

    // ==========================================================
    //  NUMBER PAD (SEPARATE SYSTEM)
    // ==========================================================

    // DESKTOP NUMBER PAD
    document.querySelectorAll(".num").forEach(n => {
        n.addEventListener("dragstart", e => {
            e.dataTransfer.setData("text/plain", n.textContent);
        });
    });

    document.querySelectorAll(".dropzone").forEach(dz => {

        dz.addEventListener("dragover", e => e.preventDefault());

        dz.addEventListener("drop", e => {
            e.preventDefault();

            const num = e.dataTransfer.getData("text/plain");
            placeNumber(dz, num);

            checkAuto();
        });
    });

    // TOUCH NUMBER PAD
    document.querySelectorAll(".num").forEach(n => {
        n.addEventListener("touchstart", e => {
            e.preventDefault();
            handleTouchNum(n.textContent, e.touches[0]);
        }, { passive: false });
    });

    function handleTouchNum(num, touch) {

        const float = document.createElement("div");
        float.className = "floating10";
        float.textContent = num;
        float.style.position = "absolute";
        float.style.zIndex = "9999";
        document.body.appendChild(float);

        function move(t) {
            float.style.left = (t.pageX) + "px";
            float.style.top = (t.pageY - 50) + "px";
        }

        move(touch);

        function onMove(e) {
            const t = e.touches[0];
            move(t);
            e.preventDefault();
        }

        function onEnd(e) {
            const t = e.changedTouches[0];
            let hit = document.elementFromPoint(t.clientX, t.clientY);
            const dz = hit?.closest(".dropzone");

            if (dz) placeNumber(dz, num);

            float.remove();

            checkAuto();

            window.removeEventListener("touchmove", onMove);
            window.removeEventListener("touchend", onEnd);
        }

        window.addEventListener("touchmove", onMove, { passive: false });
        window.addEventListener("touchend", onEnd, { passive: false });
    }

    // ==========================================================
    //  PLACE NUMBER + CHECK AUTO NEXT
    // ==========================================================
    function placeNumber(dz, num) {
        dz.textContent = num;
        dz.style.color = "#000";
        dz.style.borderColor = "#4CAF50";
    }

    function checkAuto() {
        if (!quizMode) return;

        const p = document.getElementById("ansPuluh").textContent.trim();
        const s = document.getElementById("ansSa").textContent.trim();

        if (/^[0-9]$/.test(p) && /^[0-9]$/.test(s)) {
            setTimeout(() => cekJawapan(), 150);
        }
    }

    // ==========================================================
    //  CHECK ANSWER
    // ==========================================================
    function cekJawapan() {

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
            setTimeout(() => soalanBaru(), 200);
            return;
        }

        // normal
        feedback.style.display = "block";
        feedback.textContent = betul ? "Betul!" : `Salah! ${pulRes}${saRes}`;
        feedback.style.color = betul ? "green" : "red";
    }

    window.cekJawapan = cekJawapan;
    window.soalanBaru = soalanBaru;

});

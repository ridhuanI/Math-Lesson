document.addEventListener("DOMContentLoaded", () => {
    let puluhTop, saTop, puluhBottom, saBottom;
    let sudahPinjam = false;

    let floating = null;

    // QUIZ VARIABLES
    let quizMode = false;
    let score = 0;
    let totalSoalan = 5;
    let currentSoalan = 0;

    // URL PARAM
    const url = new URLSearchParams(window.location.search);
    if (url.get("quiz") === "1") {
        quizMode = true;
        totalSoalan = Number(url.get("q")) || 5;

        document.getElementById("btnCek").style.display = "none";
        document.getElementById("btnBaru").style.display = "none";
    }

    // ELEMENTS
    const puluhBox = document.getElementById("puluhTop");
    const saBox = document.getElementById("saTop");
    const puluhBottomBox = document.getElementById("puluhBottom");
    const saBottomBox = document.getElementById("saBottom");
    const feedback = document.getElementById("feedback");
    const hud = document.getElementById("hud");

    // GENERATE QUESTION
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
            z.style.background = "#fafafa";
        });
    }
    soalanBaru();

    // QUIZ END
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

    // ------------------------------------------
    // PINJAM DESKTOP (dragstart → drop)
    // ------------------------------------------
    puluhBox.addEventListener("dragstart", e => {
        if (sudahPinjam || saTop >= saBottom) {
            e.preventDefault();
            return;
        }

        floating = document.createElement("div");
        floating.className = "floating10";
        floating.textContent = "10+";
        document.body.appendChild(floating);

        const img = new Image();
        img.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
        e.dataTransfer.setDragImage(img, 0, 0);

        puluhBox.textContent = puluhTop - 1;
        puluhBox.classList.add("red");
    });

    window.addEventListener("dragover", e => {
        if (floating) {
            floating.style.left = (e.pageX + 20) + "px";
            floating.style.top = (e.pageY - 50) + "px";
        }
    });

    saBox.addEventListener("dragover", e => e.preventDefault());
    saBox.addEventListener("dragenter", e => {
        if (!sudahPinjam) {
            saBox.classList.add("preview");
            saBox.textContent = saTop + 10;
        }
    });

    saBox.addEventListener("drop", () => {
        if (sudahPinjam) return;

        puluhTop -= 1;
        saTop += 10;
        sudahPinjam = true;

        puluhBox.textContent = puluhTop;
        saBox.textContent = saTop;

        puluhBox.classList.add("red");
        saBox.classList.add("green");

        saBox.classList.remove("preview");

        if (floating) floating.remove();
        floating = null;
    });

    puluhBox.addEventListener("dragend", () => {
        if (!sudahPinjam) {
            puluhBox.textContent = puluhTop;
            puluhBox.classList.remove("red");
            saBox.textContent = saTop;
            saBox.classList.remove("preview");
        }
        if (floating) floating.remove();
        floating = null;
    });

    // ------------------------------------------
    // TOUCH PINJAM (BORROW)
    // ------------------------------------------
    let pinjamTouch = false;

    puluhBox.addEventListener("touchstart", e => {
        if (sudahPinjam || saTop >= saBottom) return;

        pinjamTouch = true;

        floating = document.createElement("div");
        floating.className = "floating10";
        floating.textContent = "10+";
        floating.style.position = "absolute";
        floating.style.zIndex = "9999";
        document.body.appendChild(floating);

        puluhBox.classList.add("red");
    }, { passive: false });

    puluhBox.addEventListener("touchmove", e => {
        if (!pinjamTouch || !floating) return;
        e.preventDefault();

        const t = e.touches[0];
        floating.style.left = (t.pageX + 20) + "px";
        floating.style.top = (t.pageY - 50) + "px";

        let elem = document.elementFromPoint(t.clientX, t.clientY);
        if (elem && elem.id === "saTop") {
            saBox.classList.add("preview");
            saBox.textContent = saTop + 10;
        } else {
            saBox.classList.remove("preview");
            saBox.textContent = saTop;
        }
    }, { passive: false });

    puluhBox.addEventListener("touchend", e => {
        if (!pinjamTouch) return;
        pinjamTouch = false;

        const t = e.changedTouches[0];
        let elem = document.elementFromPoint(t.clientX, t.clientY);

        if (elem && elem.id === "saTop" && !sudahPinjam) {
            puluhTop -= 1;
            saTop += 10;
            sudahPinjam = true;

            puluhBox.textContent = puluhTop;
            saBox.textContent = saTop;
            saBox.classList.add("green");
        }

        puluhBox.classList.remove("red");
        saBox.classList.remove("preview");

        if (floating) floating.remove();
        floating = null;
    });

    // ------------------------------------------
    // TOUCH DRAG NUMBER PAD
    // ------------------------------------------
    function handleTouchNumber(numText, touch) {
        const float = document.createElement("div");
        float.className = "floating10";
        float.textContent = numText;
        float.style.position = "absolute";
        float.style.zIndex = "9999";
        document.body.appendChild(float);

        function move(t) {
            float.style.left = (t.pageX + 20) + "px";
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
            let elem = document.elementFromPoint(t.clientX, t.clientY);
            const dz = elem?.closest(".dropzone") || null;

            if (dz) {
                dz.textContent = numText;
                dz.style.color = "#000";
                dz.style.borderColor = "#4CAF50";
            }

            float.remove();

            if (quizMode) {
                const p = document.getElementById("ansPuluh").textContent.trim();
                const s = document.getElementById("ansSa").textContent.trim();
                const ready = /^[0-9]$/.test(p) && /^[0-9]$/.test(s);
                if (ready) setTimeout(() => cekJawapan(), 150);
            }

            window.removeEventListener("touchmove", onMove);
            window.removeEventListener("touchend", onEnd);
        }

        window.addEventListener("touchmove", onMove, { passive: false });
        window.addEventListener("touchend", onEnd, { passive: false });
    }

    document.querySelectorAll(".num").forEach(n => {
        n.addEventListener("touchstart", e => {
            e.preventDefault();
            handleTouchNumber(n.textContent.trim(), e.touches[0]);
        }, { passive: false });
    });

    // ------------------------------------------
    // DESKTOP DRAG NUMBER PAD
    // ------------------------------------------
    document.querySelectorAll(".num").forEach(num => {
        num.addEventListener("dragstart", e => {
            e.dataTransfer.setData("text/plain", num.textContent);
        });
    });

    document.querySelectorAll(".dropzone").forEach(drop => {
        drop.addEventListener("dragover", e => e.preventDefault());

        drop.addEventListener("drop", e => {
            e.preventDefault();
            const data = e.dataTransfer.getData("text/plain");
            drop.textContent = data;
            drop.style.color = "#000";
            drop.style.borderColor = "#4CAF50";

            if (quizMode) {
                const p = document.getElementById("ansPuluh").textContent.trim();
                const s = document.getElementById("ansSa").textContent.trim();
                const ready = /^[0-9]$/.test(p) && /^[0-9]$/.test(s);
                if (ready) setTimeout(() => cekJawapan(), 150);
            }
        });
    });

    // CEK JAWAPAN
    function cekJawapan() {
        const ansP = document.getElementById("ansPuluh").textContent.trim();
        const ansS = document.getElementById("ansSa").textContent.trim();

        let saResult = saTop - saBottom;
        let puluhResult = puluhTop - puluhBottom;

        if (!sudahPinjam && saTop < saBottom) {
            saResult = (saTop + 10) - saBottom;
            puluhResult = (puluhTop - 1) - puluhBottom;
        }

        const betul = (ansP == puluhResult && ansS == saResult);

        if (quizMode) {
            if (betul) score++;
            setTimeout(() => soalanBaru(), 250);
            return;
        }

        // NORMAL MODE
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

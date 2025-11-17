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

    /* ===========================================================
       JANA SOALAN
    ============================================================*/
    function soalanBaru() {

        sudahPinjam = false;
        feedback.style.display = "none";

        if (quizMode) {
            currentSoalan++;
            if (currentSoalan > totalSoalan) {
                let betul = score;
                let salah = totalSoalan - score;
                let acc = Math.round((betul / totalSoalan) * 100);

                location.href = `quiz_result.html?betul=${betul}&salah=${salah}&acc=${acc}`;
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

        document.querySelectorAll(".dropzone").forEach(d => {
            d.textContent = "_";
            d.style.color = "#999";
            d.style.borderColor = "#333";
        });
    }
    soalanBaru();

    /* ===========================================================
       BORROW DRAG (PC + TOUCH)
    ============================================================*/
    let floatBorrow = null;
    let isTouchBorrow = false;

    // Mouse borrow
    puluhBox.addEventListener("mousedown", e => {
        if (saTop >= saBottom || sudahPinjam) return;

        floatBorrow = document.createElement("div");
        floatBorrow.className = "floating10";
        floatBorrow.textContent = "10+";
        floatBorrow.style.position = "absolute";
        floatBorrow.style.zIndex = "99999";
        document.body.appendChild(floatBorrow);

        function move(ev) {
            floatBorrow.style.left = ev.pageX + "px";
            floatBorrow.style.top = (ev.pageY - 40) + "px";

            let hit = document.elementFromPoint(ev.clientX, ev.clientY);
            saBox.textContent = (hit?.id === "saTop") ? (saTop + 10) : saTop;
        }

        function up(ev) {
            let hit = document.elementFromPoint(ev.clientX, ev.clientY);

            if (hit?.id === "saTop") {
                puluhTop -= 1;
                saTop += 10;
                sudahPinjam = true;

                puluhBox.textContent = puluhTop;
                saBox.textContent = saTop;
            } else {
                saBox.textContent = saTop;
            }

            floatBorrow.remove();
            floatBorrow = null;

            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseup", up);
        }

        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
    });

    // Touch borrow
    puluhBox.addEventListener("touchstart", e => {
        if (saTop >= saBottom || sudahPinjam) return;

        isTouchBorrow = true;

        floatBorrow = document.createElement("div");
        floatBorrow.className = "floating10";
        floatBorrow.textContent = "10+";
        floatBorrow.style.position = "absolute";
        floatBorrow.style.zIndex = "99999";
        document.body.appendChild(floatBorrow);
    }, { passive:false });

    puluhBox.addEventListener("touchmove", e => {
        if (!isTouchBorrow) return;
        e.preventDefault();
        const t = e.touches[0];

        floatBorrow.style.left = t.pageX + "px";
        floatBorrow.style.top = (t.pageY - 50) + "px";

        let hit = document.elementFromPoint(t.clientX, t.clientY);
        saBox.textContent = (hit?.id === "saTop") ? (saTop + 10) : saTop;

    }, { passive:false });

    puluhBox.addEventListener("touchend", e => {
        if (!isTouchBorrow) return;
        isTouchBorrow = false;

        const t = e.changedTouches[0];
        let hit = document.elementFromPoint(t.clientX, t.clientY);

        if (hit?.id === "saTop") {
            puluhTop -= 1;
            saTop += 10;
            sudahPinjam = true;

            puluhBox.textContent = puluhTop;
            saBox.textContent = saTop;
        } else {
            saBox.textContent = saTop;
        }

        floatBorrow.remove();
        floatBorrow = null;
    });

    /* ===========================================================
       NUMBER PAD DRAG (PC + TOUCH)
    ============================================================*/
    function dropNumber(dz, num) {
        dz.textContent = num;
        dz.style.color  = "#000";
        dz.style.borderColor = "#4CAF50";
    }

    // PC drag
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
            dropNumber(dz, num);
            autoNext();
        });
    });

    // Touch drag
    document.querySelectorAll(".num").forEach(n => {
        n.addEventListener("touchstart", e => {
            e.preventDefault();

            const num = n.textContent;

            const float = document.createElement("div");
            float.className = "floating10";
            float.textContent = num;
            float.style.position = "absolute";
            float.style.zIndex = "99999";
            document.body.appendChild(float);

            function move(ev) {
                const t = ev.touches[0];
                float.style.left = t.pageX + "px";
                float.style.top  = (t.pageY - 50) + "px";
            }

            function end(ev) {
                const t = ev.changedTouches[0];
                let hit = document.elementFromPoint(t.clientX, t.clientY);
                let dz = hit?.closest(".dropzone");

                if (dz) dropNumber(dz, num);

                float.remove();
                autoNext();

                window.removeEventListener("touchmove", move);
                window.removeEventListener("touchend", end);
            }

            window.addEventListener("touchmove", move, { passive:false });
            window.addEventListener("touchend", end);
        }, { passive:false });
    });

    /* ===========================================================
       AUTO NEXT (QUIZ MODE)
    ============================================================*/
    function autoNext() {
        if (!quizMode) return;

        let p = document.getElementById("ansPuluh").textContent.trim();
        let s = document.getElementById("ansSa").textContent.trim();

        if (/^[0-9]$/.test(p) && /^[0-9]$/.test(s))
            setTimeout(() => cekJawapan(), 150);
    }

    /* ===========================================================
       CEK JAWAPAN
    ============================================================*/
    window.cekJawapan = function () {

        const ansP = document.getElementById("ansPuluh").textContent.trim();
        const ansS = document.getElementById("ansSa").textContent.trim();

        let saRes = saTop - saBottom;
        let pulRes = puluhTop - puluhBottom;

        if (!sudahPinjam && saTop < saBottom) {
            saRes = (saTop + 10) - saBottom;
            pulRes = (puluhTop - 1) - puluhBottom;
        }

        let betul = (ansP == pulRes && ansS == saRes);

        if (quizMode){
            if (betul) score++;
            setTimeout(() => soalanBaru(), 150);
            return;
        }

        feedback.style.display = "block";
        feedback.style.color = betul ? "green" : "red";
        feedback.textContent = betul ? "Betul!" : `Salah! Jawapan sebenar: ${pulRes}${saRes}`;
    }

    window.soalanBaru = soalanBaru;
});

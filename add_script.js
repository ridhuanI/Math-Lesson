document.addEventListener("DOMContentLoaded", () => {

    let puluhTop, saTop, puluhBottom, saBottom;
    let sudahBawa = false;

    const puluhBox = document.getElementById("puluhTop");
    const saBox = document.getElementById("saTop");
    const puluhBottomBox = document.getElementById("puluhBottom");
    const saBottomBox = document.getElementById("saBottom");
    const carryBox = document.getElementById("carryPuluh");
    const feedback = document.getElementById("feedback");

    // =====================================================
    // ALIGN CARRY BOX EXACT POSITION
    // =====================================================
    function alignCarryBox() {
        const puluhRect = puluhBox.getBoundingClientRect();
        const containerRect = document.getElementById("carryContainer").getBoundingClientRect();

        carryBox.style.left =
            (puluhRect.x + puluhRect.width / 2 - containerRect.x - 20) + "px";
    }

    // =====================================================
    // GENERATE QUESTION (<100 RESULT)
    // =====================================================
    function soalanBaru() {
        sudahBawa = false;
        feedback.textContent = "";
        carryBox.innerHTML = "&nbsp;";
        carryBox.style.display = "none";
        carryBox.style.opacity = "0";

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

        setTimeout(alignCarryBox, 30);
    }

    soalanBaru();

    // =====================================================
    // DESKTOP DRAG AND DROP
    // =====================================================
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

            const data = parseInt(e.dataTransfer.getData("text/plain"));
            drop.textContent = data;
            drop.style.color = "#000";
            drop.style.borderColor = "#4CAF50";

            if (drop.id === "ansSa") {
                const jumlahSa = saTop + saBottom;
                if (jumlahSa >= 10 && !sudahBawa) {
                    sudahBawa = true;
                    tunjukCarry();
                }
            }
        });
    });

    // =====================================================
    // CHECK ANSWER
    // =====================================================
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
            feedback.textContent =
                `❌ Salah! Jawapan sebenar ialah ${puluhSum}${saSum}`;
            feedback.style.color = "red";
        }
    }

    window.cekJawapan = cekJawapan;
    window.soalanBaru = soalanBaru;

    // =====================================================
    // SUPER SMOOTH CURVED +10 FLY ANIMATION
    // =====================================================
    function tunjukCarry() {

        // Make carryBox visible BUT invisible (so we can get coords)
        carryBox.style.display = "block";
        carryBox.style.opacity = "0";
        alignCarryBox();

        const float = document.createElement("div");
        float.className = "floating10";
        float.textContent = "+10";
        document.body.appendChild(float);

        // Start = SA center
        const start = saBox.getBoundingClientRect();
        let startX = start.x + start.width / 2;
        let startY = start.y + start.height / 2;

        // End = carryBox center
        const end = carryBox.getBoundingClientRect();
        let endX = end.x + end.width / 2;
        let endY = end.y + end.height / 2;

        float.style.left = startX + "px";
        float.style.top = startY + "px";
        float.style.opacity = "1";

        const duration = 450;
        const startTime = performance.now();

        function animate(time) {
            const progress = Math.min((time - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);

            const curveHeight = -35;
            const currentX = startX + (endX - startX) * ease;
            const currentY =
                startY +
                (endY - startY) * ease +
                curveHeight * (1 - ease) * ease;

            float.style.left = currentX + "px";
            float.style.top = currentY + "px";
            float.style.opacity = 1 - progress;
            float.style.transform = `scale(${1 - progress * 0.3})`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                float.remove();
                carryBox.style.opacity = "1";
                carryBox.textContent = "1";
            }
        }

        requestAnimationFrame(animate);
    }

    // =====================================================
    // TOUCH SUPPORT (iPad / iPhone / Android)
    // =====================================================

    let activeFloat = null;

    nums.forEach(num => {

        // TOUCH START
        num.addEventListener("touchstart", e => {
            e.preventDefault();

            if (activeFloat) activeFloat.remove();

            activeFloat = document.createElement("div");
            activeFloat.className = "floating-drag";
            activeFloat.textContent = num.textContent;
            document.body.appendChild(activeFloat);

            const touch = e.touches[0];
            activeFloat.style.opacity = "1";
            activeFloat.style.left = touch.pageX + "px";
            activeFloat.style.top = (touch.pageY - 50) + "px";

            num.style.opacity = "0.4";
        });

        // TOUCH MOVE
        num.addEventListener("touchmove", e => {
            e.preventDefault();
            if (!activeFloat) return;

            const touch = e.touches[0];
            activeFloat.style.left = touch.pageX + "px";
            activeFloat.style.top = (touch.pageY - 50) + "px";

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

            if (activeFloat) {
                activeFloat.style.opacity = "0";
                setTimeout(() => activeFloat?.remove(), 200);
                activeFloat = null;
            }

            document.querySelectorAll(".dropzone").forEach(z => {
                z.style.opacity = "1";
                z.style.borderColor = "#333";
            });

            num.style.opacity = "1";
        });

    });

    window.addEventListener("resize", alignCarryBox);

});

let currentQ = 0;
let totalQ = 0;
let correct = 0;
let wrong = 0;

let op;
let jawapanBetul;

const params = new URLSearchParams(window.location.search);
op = params.get("op");
totalQ = Number(params.get("q"));

const hud = document.getElementById("hud");
const box = document.getElementById("quizBox");
const feedback = document.getElementById("feedback");
const numberPad = document.getElementById("numberPad");

soalanBaru();

function soalanBaru() {
    currentQ++;
    if (currentQ > totalQ) return tamatQuiz();

    hud.textContent = `Soalan ${currentQ} / ${totalQ}`;

    let a = Math.floor(Math.random() * 9) + 1;
    let b = Math.floor(Math.random() * 9) + 1;

    if (op === "tambah") {
        jawapanBetul = a + b;
        box.innerHTML = `<h3>${a} + ${b}</h3><div id="jawapan" class="dropzone">?</div>`;
    }
    else if (op === "tolak") {
        if (b > a) [a, b] = [b, a];
        jawapanBetul = a - b;
        box.innerHTML = `<h3>${a} – ${b}</h3><div id="jawapan" class="dropzone">?</div>`;
    }
    
    }

    feedback.style.display = "none";
    numberPad.style.display = "block";
}

// Cara jawab melalui click number
document.querySelectorAll(".num").forEach(n => {
    n.addEventListener("click", () => {
        document.getElementById("jawapan").textContent = n.textContent;
        semak();
    });
});

function semak() {
    let userAns = Number(document.getElementById("jawapan").textContent);
    if (userAns === jawapanBetul) correct++;
    else wrong++;

    setTimeout(soalanBaru, 400);
}

function tamatQuiz() {
    numberPad.style.display = "none";
    feedback.style.display = "block";

    let acc = Math.round((correct / totalQ) * 100);

    feedback.innerHTML = `
        <h2>Tamat!</h2>
        <p>Betul: ${correct}</p>
        <p>Salah: ${wrong}</p>
        <p>Peratusan Betul: ${acc}%</p>
        <button onclick="location.href='index.html'">Menu</button>
    `;
}

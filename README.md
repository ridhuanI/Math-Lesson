# 🌟 Belajar Bersama!

A fun, interactive learning app for kids aged 4–8, built with vanilla HTML, CSS, and JavaScript. No frameworks, no dependencies — just open in a browser and play.

**Language:** Bahasa Melayu (Malay)

## Subjects

| Subject | Description |
|---|---|
| ➕ Matematik Tambah | Addition 1–9 with star visual aids and 4-choice answers |
| ➖ Matematik Tolak | Subtraction with always-positive results |
| 🔤 Huruf A–Z | Learn the alphabet with Malay words and emoji |
| ⭐ Mengira 1–10 | Count emoji objects and pick the right number |
| 🔷 Bentuk & Warna | Shapes and colours quiz with 3 modes (Bentuk / Warna / Campur) |
| 🐘 Haiwan | 15 animals — learn their Malay names |
| 🎯 Padankan Bentuk | Drag coloured shapes onto their gray silhouettes; 3 difficulty levels |
| 🎨 Warna | Dedicated colour page — match colour circles or swatches to names |

## Features

- **Quiz mode** — every subject supports a timed quiz (5–10 questions) with a star-rated result screen
- **Difficulty levels** — the drag & match game has Mudah / Sederhana / Sukar with decoy silhouettes
- **Sound effects** — synthesised via Web Audio API (no audio files needed)
- **Mascot** — a CSS face character that reacts to correct/wrong answers
- **Confetti** — appears on the result screen for 3-star scores
- **Touch & mouse** — drag & match works on mobile and desktop
- **Offline-ready** — pure static files, no server required

## Running Locally

```bash
# Any static file server works, e.g.:
npx serve .
# or
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

Or just open `index.html` directly in a browser (file://).

## Deploying

The app is pure static HTML/CSS/JS — deploy anywhere:

- **GitHub Pages**: Settings → Pages → Deploy from `main` branch / (root)
- **Netlify / Vercel**: drag and drop the folder

## File Structure

```
index.html              — Home screen (subject hub)
addition.html           — Addition subject
subtraction.html        — Subtraction subject
letters.html            — Alphabet subject
counting.html           — Counting subject
shapes.html             — Shapes & colours subject
animals.html            — Animals subject
drag_match.html         — Drag & match silhouette game
colours.html            — Dedicated colours subject

quiz_menu.html          — Pick a subject for quiz
quiz_select.html        — Pick number of questions
quiz_start.html         — Routes to correct subject page
quiz_result.html        — Shows score and stars

*_script.js             — Logic for each subject
sounds.js               — Web Audio API sound effects
mascot.js               — CSS mascot component
style.css               — All shared styles
```

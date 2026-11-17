# Texas Instruments Speak & Spell (1978) - Web & Agent Emulation

An authentic, production-grade emulation of the iconic **1978 Texas Instruments Speak & Spell** educational toy, built using skills from [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) (including `anthropics/frontend-design`, `anthropics/web-artifacts-builder`, `anthropics/canvas-design`, and modern Web Audio/CSS standards).

![Texas Instruments Speak & Spell](assets/preview.png)

---

## ⚡ Highlights & Authentic Hardware Fidelity

* **14-Segment Vacuum Fluorescent Display (VFD)**:
  * Full 8-character Futaba/TI tube simulation with signature turquoise phosphor bloom (`#2bffcd`), glass raster scanlines, and faint unlit filament traces.
  * Complete 14-segment alphanumeric character font for all letters A–Z, numbers 0–9, and punctuation.
* **TMS5100 / TMC0280 LPC-10 Speech Chip Emulation**:
  * **Authentic 1978 Voice (Mitch Carr - YouTube: [GbNuL4y-2eU](https://youtu.be/GbNuL4y-2eU))**: Direct procedural Web Audio impulse-train excitation ($F_0 \approx 125\text{ Hz}$) passing through a triple biquad lattice formant filter bank, matching the exact robotic vocal resonance of the vintage hardware.
  * **⚡ Cursed / Glitched Demonic Voice ("Totally Wrong Voice")**: Circuit-bent broken synthesizer mode featuring ultra-low $0.15\times$ pitch gargling, non-linear WaveShaper distortion, and detuned tritone alarms.
  * **System TTS Fallback**: Clean browser speech synthesis option.
  * Toggle between voice engines anytime via the **`VOICE SYNTH`** selector.
* **All 5 Original Game Modes**:
  1. **SPELL**: 10-word quiz round with attempt tracking (1st try = 1 pt, 2nd try = 0.5 pt), "That is correct", "Wrong, try again", spelling reveals, and end-of-round fanfare scoring.
  2. **MYSTERY WORD**: Hangman-style word guessing with blanks, strikes counter (up to 6 misses), and segment reveals.
  3. **SAY IT**: Flashcard pronunciation mode where the toy speaks the word, pauses for the player, and spells it out.
  4. **SECRET CODE**: The authentic Texas Instruments substitution cipher (+3 Caesar shift).
  5. **LETTER**: Educational phonics mode with 26 chromatic scale musical tones mapped to keys A–Z.
* **🔥 Offensive / Roast Edition ("Snark & Spell")**:
  * An adult novelty roast mode modeled after 1980s circuit-bent and novelty insult toys!
  * Toggleable via the physical **`ROAST MODE`** switch or **`ROAST`** keypad button.
  * Replaces polite encouragements with biting robotic insults ("Wrong, dumbass. Try again.", "Did you drop out of school?", "A miracle! That is correct.", "Total embarrassment. Score: 2").
  * Includes the **Group R (Roast Word Pack)** with over 30 classic comedic roast words (`LOSER`, `MORON`, `CLOWN`, `DOOFUS`, `FOOL`, `SLACKER`, `BOZO`, `AIRHEAD`, `CHUMP`, `BUFFOON`, `TROLL`, `NUMBSKUL`).
* **5 Difficulty Word Modules**:
  * Groups A, B, C, D, and R with over 190 words rigorously adhering to the 8-character display limitation.
* **Tested Against Historical MAME Emulation ([hh_snspell](https://archive.org/details/hh_snspell))**:
  * Verifies ROM state machine loops, 2-strike hint limits, 14-segment character mappings, and cipher reciprocity.
* **Circuit Bending Slider**:
  * Variable clock rate slider ($0.4\times$ to $2.0\times$) to reproduce the famous 1980s circuit-bent Speak & Spell synthesizer modifications used by electronic music legends (Kraftwerk, Depeche Mode).
* **Physical Keyboard Support**:
  * Type directly on your computer keyboard: <kbd>A</kbd>–<kbd>Z</kbd>, <kbd>Enter</kbd> (submit), <kbd>Backspace</kbd> (erase), <kbd>Space</kbd> (repeat), <kbd>Esc</kbd> (power toggle).

---

## 🚀 Quick Start

### 1. Launch the Local Web Emulator
Run the built-in, zero-dependency Python server:
```bash
python3 server.py 8080
```
Open **[http://localhost:8080](http://localhost:8080)** in your browser.

### 2. Run the Automated Test Suite
```bash
python3 test_speak_spell.py
```
Validates word lengths, dictionary integrity, cipher reciprocity, 14-segment glyph mappings, and web assets.

---

## 🌐 Deploying to GitHub Pages

The repository is configured with a `.nojekyll` file, PWA manifest, and SVG favicon for instant GitHub Pages deployment.

1. **Push to main**:
   ```bash
   git push -u origin main
   ```
2. **GitHub Pages Source**:
   - In GitHub $\to$ **Settings** $\to$ **Pages**.
   - Under **Build and deployment** $\to$ **Source**:
     - Select **Deploy from a branch** $\to$ Branch: `main` $\to$ `/ (root)`.
3. Your Speak & Spell emulator is live at:
   `https://RapidRawRich.github.io/SpeakSpeel/`

---

## 📂 Project Architecture

```text
SpeakSpeel/
├── .agents/
│   ├── plugins/
│   │   └── speak-spell/
│   │       └── plugin.json            # Antigravity plugin definition
│   ├── rules/
│   │   └── AGENTS.md                  # Emulation rules and DSP standards
│   └── skills/
│       ├── retro-speak-spell/         # Operations & game skill
│       ├── tms5100-lpc-audio/         # LPC speech synthesis skill
│       └── vfd-segment-display/       # 14-segment VFD rendering skill
├── css/
│   └── styles.css                     # Skeuomorphic 1978 TI casing & VFD CSS
├── js/
│   ├── app.js                         # Application orchestration & event listeners
│   ├── engine.js                      # Core 5-mode game state machine
│   ├── synth.js                       # TMS5100 LPC Web Audio speech & chime synth
│   ├── vfd.js                         # 14-segment VFD SVG renderer
│   └── words.js                       # Vocabulary banks (Groups A-D) & cipher
├── index.html                         # Main responsive interface
├── server.py                          # Zero-dependency local web server
├── test_speak_spell.py                # Automated unit tests
└── README.md
```

---

## 🎨 Skills from VoltAgent/awesome-agent-skills Incorporated

1. **`anthropics/frontend-design`**:
   - Custom skeuomorphic design mimicking the 1978 molded orange-red ABS casing, yellow handle grip, smoky acrylic VFD bezel, and 40-button flat membrane keypad.
2. **`anthropics/web-artifacts-builder`**:
   - Resilient single-page application architecture with zero external package vulnerabilities, offline readiness, and seamless responsive scaling.
3. **`anthropics/canvas-design`**:
   - Mathematical SVG path coordinates for 14-segment alphanumeric tubes, with optical unlit ghost filaments, glowing phosphor bloom, and CRT scanlines.
4. **Modern Web Audio & Engineering**:
   - Web Audio API graph combining peaking biquad formant filters, square wave arpeggios, and speech synthesis with circuit bending pitch shifts.
5. **`anthropics/webapp-testing`**:
   - Comprehensive test suite in `test_speak_spell.py` ensuring zero regressions across all modes.

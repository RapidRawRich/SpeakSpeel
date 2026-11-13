# Speak & Spell Retro Emulation Architecture Rules

When developing, extending, or maintaining the Texas Instruments Speak & Spell emulator:

1. **Authentic Hardware Fidelity**:
   - Strictly adhere to 1978 Texas Instruments industrial design (molded orange-red case, yellow handle insert, dark acrylic VFD lens, 40-key membrane keypad).
   - Display must respect the 8-character physical limitation of the original TMC0280 / Futaba vacuum fluorescent display. Words cannot exceed 8 characters.

2. **Acoustic and DSP Standards**:
   - Audio must emulate the 8kHz, 6-bit quantization of the TMS5100 LPC-10 speech chip with lattice formant filtering (F1: ~750Hz, F2: ~1450Hz, cut-off ~3800Hz).
   - All pitch modifications must preserve the authentic formant frequencies or scale them consistently with circuit-bending techniques.
   - Key clicks, victory arpeggios, and wrong buzzes must be generated with pure Web Audio oscillators (square/sawtooth) without external sound file bloat.

3. **Game Mechanics**:
   - Preserve the 5 canonical 1978 modes: SPELL, MYSTERY WORD, SAY IT, SECRET CODE, and LETTER.
   - Respect the 4 difficulty groups (A, B, C, D) and secret code shift (+3 Caesar cipher).
   - Keep zero external runtime dependencies so the project runs offline in any modern browser.

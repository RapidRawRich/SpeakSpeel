---
name: tms5100-lpc-audio
description: Technical architecture and DSP guide for the Texas Instruments TMS5100 / TMC0280 LPC-10 speech synthesis chip emulation and circuit-bending audio mechanics.
---

# TMS5100 LPC-10 Speech & Retro Audio Emulation

## Historical Context

In 1978, Texas Instruments introduced the Speak & Spell powered by the TMC0280 (later TMS5100) speech synthesizer chip. It was the world's first single-chip speech synthesizer and utilized Linear Predictive Coding (LPC-10) to compress human speech into a 128-kbit ROM.

## Audio Processing Graph

The Web Audio emulation in `js/synth.js` implements:

1. **Formant Lattice Filter Bank**:
   - `F1`: Peaking filter at 750 Hz, Q = 3.5, gain = +6dB
   - `F2`: Peaking filter at 1450 Hz, Q = 4.0, gain = +5dB
   - `Lowpass`: 3800 Hz cutoff, Q = 1.0 (matching the 8kHz Nyquist cut-off)

2. **Oscillator Chimes**:
   - **Key Click**: Triangle wave 800Hz -> 150Hz decay over 25ms
   - **Letter Tones**: Chromatic 12-TET scale from C4 (261.63Hz) using 30% duty square wave
   - **Victory Fanfare**: Arpeggio (G4, C5, E5, G5, C6) with decaying envelope
   - **Wrong Buzz**: Dual discordant sawtooth/square oscillators (146Hz / 110Hz ramped to 95Hz / 80Hz)

3. **Circuit Bending Mechanics**:
   - Adjustable clock rate slider (`0.4x` to `2.0x`):
   - Modulates speech synthesis rate and pitch simultaneously.
   - Adjusts musical arpeggio frequencies and buzzer cadence in real-time, accurately modeling physical circuit bends created by musicians in the 1980s.

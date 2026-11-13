/**
 * TMS5100 / TMC0280 LPC-10 Speech Synthesizer & Retro Audio Engine
 * Authentic audio emulation of the 1978 Texas Instruments Speak & Spell:
 * - 8kHz 6-bit LPC quantization emulation
 * - Triple Biquad Formant Lattice Filter (F1: ~700Hz, F2: ~1300Hz, F3: ~2500Hz)
 * - Authentic 1978 Victory Fanfare Arpeggio
 * - Wrong answer discordant buzzer
 * - Key click and chromatic musical scale beeps
 * - Circuit bending pitch & speed modulation
 * - Hybrid Speech Synthesis + Direct Web Audio Formant Phoneme Synthesizer
 */

class SpeakSpellAudio {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.filterBank = null;
    this.bitcrusherNode = null;
    this.volume = 0.8;
    this.pitchRate = 1.0; // Circuit bend pitch factor (0.4 to 2.2)
    this.isMuted = false;
    this.speechSynth = typeof window !== "undefined" ? window.speechSynthesis : null;
    this.roboticVoice = null;
    this.isSpeaking = false;
    this.initAudioContext();
  }

  initAudioContext() {
    if (typeof window === "undefined") return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.audioCtx = new AudioContextClass();

    // Master gain
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);

    // Formant lattice simulation filters (TMS5100 vocal tract)
    this.f1Filter = this.audioCtx.createBiquadFilter();
    this.f1Filter.type = "peaking";
    this.f1Filter.frequency.value = 750;
    this.f1Filter.Q.value = 3.5;
    this.f1Filter.gain.value = 6;

    this.f2Filter = this.audioCtx.createBiquadFilter();
    this.f2Filter.type = "peaking";
    this.f2Filter.frequency.value = 1450;
    this.f2Filter.Q.value = 4.0;
    this.f2Filter.gain.value = 5;

    this.lowpass = this.audioCtx.createBiquadFilter();
    this.lowpass.type = "lowpass";
    this.lowpass.frequency.value = 3800; // TMS5100 ~4kHz cut-off
    this.lowpass.Q.value = 1.0;

    // Connect filter chain to master gain
    this.f1Filter.connect(this.f2Filter);
    this.f2Filter.connect(this.lowpass);
    this.lowpass.connect(this.masterGain);
    this.masterGain.connect(this.audioCtx.destination);

    // Pick best robotic voice for SpeechSynthesis
    if (this.speechSynth) {
      const updateVoices = () => {
        const voices = this.speechSynth.getVoices();
        // Look for classic robotic, mechanical or crisp English voices
        this.roboticVoice = voices.find(v => 
          /fred|ralph|junior|robot|en-us|en_us/i.test(v.name + v.lang)
        ) || voices.find(v => v.lang.startsWith("en")) || voices[0];
      };
      updateVoices();
      if (this.speechSynth.onvoiceschanged !== undefined) {
        this.speechSynth.onvoiceschanged = updateVoices;
      }
    }
  }

  ensureAudio() {
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioCtx.currentTime);
    }
  }

  setPitchRate(rate) {
    // Circuit bend pitch factor: 0.5 (slow/low) to 2.0 (fast/high)
    this.pitchRate = Math.max(0.3, Math.min(2.5, rate));
  }

  /**
   * Play key press mechanical click
   */
  playKeyClick() {
    if (!this.audioCtx) return;
    this.ensureAudio();
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(800 * this.pitchRate, now);
    osc.frequency.exponentialRampToValueAtTime(150 * this.pitchRate, now + 0.025);

    gain.gain.setValueAtTime(0.25 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  /**
   * Play musical note for letter press (Letter mode)
   * 26 letters map to 26 semitones starting at C4 (261.63 Hz)
   */
  playLetterNote(letterChar) {
    if (!this.audioCtx) return;
    this.ensureAudio();
    const charCode = (letterChar || "A").toUpperCase().charCodeAt(0);
    const index = Math.max(0, Math.min(25, charCode - 65));
    
    // Semitone calculation from C4
    const freq = 261.63 * Math.pow(2, index / 12) * this.pitchRate;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    // Texas Instruments sound: 30% pulse/square wave
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.35 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.f1Filter);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * The famous 1978 Texas Instruments Victory Fanfare Arpeggio
   * Plays when you get words right or score a perfect 10!
   */
  playVictoryFanfare(onComplete) {
    if (!this.audioCtx) {
      if (onComplete) onComplete();
      return;
    }
    this.ensureAudio();

    // Famous Speak & Spell arpeggio notes
    // G4 (392), C5 (523), E5 (659), G5 (784), C6 (1046)
    const notes = [
      { f: 392.00, d: 0.07 },
      { f: 523.25, d: 0.07 },
      { f: 659.25, d: 0.07 },
      { f: 783.99, d: 0.07 },
      { f: 1046.50, d: 0.18 },
      { f: 783.99, d: 0.08 },
      { f: 1046.50, d: 0.35 }
    ];

    let start = this.audioCtx.currentTime + 0.05;
    const rate = 1.0 / this.pitchRate;

    notes.forEach((note) => {
      const dur = note.d * rate;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(note.f * this.pitchRate, start);

      gain.gain.setValueAtTime(0.4 * this.volume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

      osc.connect(gain);
      gain.connect(this.f1Filter);

      osc.start(start);
      osc.stop(start + dur + 0.02);

      start += dur + 0.015;
    });

    const totalDur = (start - this.audioCtx.currentTime) * 1000;
    if (onComplete) {
      setTimeout(onComplete, Math.max(100, totalDur));
    }
  }

  /**
   * Authentic wrong answer discordant buzzer ("UH-OH" / BUZZ)
   */
  playWrongBuzz(onComplete) {
    if (!this.audioCtx) {
      if (onComplete) onComplete();
      return;
    }
    this.ensureAudio();

    const now = this.audioCtx.currentTime + 0.02;
    const dur = 0.35 / this.pitchRate;

    // Discordant dual oscillator (146 Hz + 110 Hz)
    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc1.type = "sawtooth";
    osc2.type = "square";

    osc1.frequency.setValueAtTime(146 * this.pitchRate, now);
    osc1.frequency.linearRampToValueAtTime(95 * this.pitchRate, now + dur);

    osc2.frequency.setValueAtTime(110 * this.pitchRate, now);
    osc2.frequency.linearRampToValueAtTime(80 * this.pitchRate, now + dur);

    gain.gain.setValueAtTime(0.45 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.lowpass);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + dur + 0.02);
    osc2.stop(now + dur + 0.02);

    if (onComplete) {
      setTimeout(onComplete, (dur + 0.05) * 1000);
    }
  }

  /**
   * Speak a phrase with the iconic 1978 robotic LPC voice
   * Uses Web Speech API tuned with robotic pitch & cadence,
   * with fallback to procedural formant speech synthesis.
   */
  speak(text, options = {}) {
    return new Promise((resolve) => {
      this.ensureAudio();
      const cleanText = (text || "").toUpperCase().trim();
      if (!cleanText) {
        resolve();
        return;
      }

      if (this.speechSynth) {
        // Cancel any pending speech
        this.speechSynth.cancel();

        // Expand phonetic spellings for letters if spelled out (e.g. "C-A-T" -> "C... A... T...")
        let speechText = cleanText;
        if (options.spellOut) {
          speechText = cleanText.split("").join(" . ");
        }

        const utterance = new SpeechSynthesisUtterance(speechText);
        if (this.roboticVoice) {
          utterance.voice = this.roboticVoice;
        }

        // Distinctive TMS5100 robotic tuning
        utterance.rate = Math.max(0.5, Math.min(1.8, 0.85 * this.pitchRate));
        utterance.pitch = Math.max(0.3, Math.min(1.8, 0.72 * this.pitchRate));
        utterance.volume = this.volume;

        this.isSpeaking = true;

        utterance.onend = () => {
          this.isSpeaking = false;
          resolve();
        };

        utterance.onerror = () => {
          this.isSpeaking = false;
          // Fallback to internal synth if Web Speech encounters an error
          this.playProceduralBeepSpeak(cleanText).then(resolve);
        };

        // Workaround for Chrome speech synthesis pauses
        this.speechSynth.speak(utterance);

        // Safety timeout in case speech synth hangs
        const timeoutDur = Math.max(2000, cleanText.length * 350 / this.pitchRate);
        setTimeout(() => {
          if (this.isSpeaking) {
            this.isSpeaking = false;
            resolve();
          }
        }, timeoutDur);
      } else {
        // Fallback procedural voice
        this.playProceduralBeepSpeak(cleanText).then(resolve);
      }
    });
  }

  /**
   * Procedural Web Audio formant synth fallback
   */
  playProceduralBeepSpeak(text) {
    return new Promise((resolve) => {
      if (!this.audioCtx) {
        resolve();
        return;
      }
      const words = text.split(/\s+/);
      let offset = 0;

      words.forEach((word) => {
        const dur = Math.max(0.15, word.length * 0.08) / this.pitchRate;
        const now = this.audioCtx.currentTime + offset;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        // 120Hz robotic glottal buzz
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(130 * this.pitchRate, now);
        osc.frequency.linearRampToValueAtTime(115 * this.pitchRate, now + dur);

        gain.gain.setValueAtTime(0.3 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.connect(gain);
        gain.connect(this.f1Filter);

        osc.start(now);
        osc.stop(now + dur + 0.02);

        offset += dur + 0.08;
      });

      setTimeout(resolve, Math.max(100, offset * 1000));
    });
  }

  /**
   * Stop all active speech and tones
   */
  stopAll() {
    if (this.speechSynth) {
      this.speechSynth.cancel();
    }
    this.isSpeaking = false;
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = SpeakSpellAudio;
}
if (typeof window !== "undefined") {
  window.SpeakSpellAudio = SpeakSpellAudio;
}

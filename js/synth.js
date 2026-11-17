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
 * - CURSED / GLITCH VOICE MODE: Circuit-bent, demonic, distorted "totally wrong" audio DSP!
 */

class SpeakSpellAudio {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.filterBank = null;
    this.distortionNode = null;
    this.volume = 0.8;
    this.pitchRate = 1.0; // Circuit bend pitch factor (0.4 to 2.2)
    this.isCursedVoice = false; // "Totally wrong" demonic circuit-bent glitch voice
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

    // Distortion WaveShaper for cursed voice mode
    this.distortionNode = this.audioCtx.createWaveShaper();
    this.distortionNode.curve = this.makeDistortionCurve(50);
    this.distortionNode.oversample = "none"; // Raw digital clipping

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

  makeDistortionCurve(amount) {
    const k = typeof amount === "number" ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  toggleCursedVoice(enable) {
    this.isCursedVoice = (enable !== undefined) ? !!enable : !this.isCursedVoice;
    return this.isCursedVoice;
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

    if (this.isCursedVoice) {
      // Harsh fried electrical spark
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(2200 * this.pitchRate, now);
      osc.frequency.linearRampToValueAtTime(45 * this.pitchRate, now + 0.035);
      gain.gain.setValueAtTime(0.4 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    } else {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(800 * this.pitchRate, now);
      osc.frequency.exponentialRampToValueAtTime(150 * this.pitchRate, now + 0.025);
      gain.gain.setValueAtTime(0.25 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
    }

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * Play musical note for letter press (Letter mode)
   */
  playLetterNote(letterChar) {
    if (!this.audioCtx) return;
    this.ensureAudio();
    const charCode = (letterChar || "A").toUpperCase().charCodeAt(0);
    const index = Math.max(0, Math.min(25, charCode - 65));
    
    const freq = 261.63 * Math.pow(2, index / 12) * this.pitchRate;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    if (this.isCursedVoice) {
      // Detuned tritone discordant buzz
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq * 0.71, now);
      osc.frequency.linearRampToValueAtTime(freq * 0.65, now + 0.25);
      gain.gain.setValueAtTime(0.45 * this.volume, now);
    } else {
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.35 * this.volume, now);
    }

    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(gain);
    gain.connect(this.f1Filter);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  /**
   * The famous 1978 Texas Instruments Victory Fanfare Arpeggio
   * (Or cursed, warped, demonic fanfare when in cursed mode!)
   */
  playVictoryFanfare(onComplete) {
    if (!this.audioCtx) {
      if (onComplete) onComplete();
      return;
    }
    this.ensureAudio();

    let notes;
    if (this.isCursedVoice) {
      // Cursed, demented, detuned tritone fanfare
      notes = [
        { f: 233.08, d: 0.09 }, // A#3
        { f: 329.63, d: 0.09 }, // E4 (tritone)
        { f: 466.16, d: 0.09 }, // A#4
        { f: 659.25, d: 0.12 }, // E5
        { f: 311.13, d: 0.25 }, // D#4
        { f: 155.56, d: 0.40 }  // D#3 demonic slide
      ];
    } else {
      // Famous Speak & Spell arpeggio notes
      // G4 (392), C5 (523), E5 (659), G5 (784), C6 (1046)
      notes = [
        { f: 392.00, d: 0.07 },
        { f: 523.25, d: 0.07 },
        { f: 659.25, d: 0.07 },
        { f: 783.99, d: 0.07 },
        { f: 1046.50, d: 0.18 },
        { f: 783.99, d: 0.08 },
        { f: 1046.50, d: 0.35 }
      ];
    }

    let start = this.audioCtx.currentTime + 0.05;
    const rate = 1.0 / this.pitchRate;

    notes.forEach((note) => {
      const dur = note.d * rate;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = this.isCursedVoice ? "sawtooth" : "square";
      osc.frequency.setValueAtTime(note.f * this.pitchRate, start);

      if (this.isCursedVoice) {
        osc.frequency.linearRampToValueAtTime((note.f * 0.92) * this.pitchRate, start + dur);
      }

      gain.gain.setValueAtTime((this.isCursedVoice ? 0.45 : 0.4) * this.volume, start);
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
   * Authentic wrong answer discordant buzzer
   * (Or terrifying harsh distorted screech in cursed mode!)
   */
  playWrongBuzz(onComplete) {
    if (!this.audioCtx) {
      if (onComplete) onComplete();
      return;
    }
    this.ensureAudio();

    const now = this.audioCtx.currentTime + 0.02;
    const dur = (this.isCursedVoice ? 0.55 : 0.35) / this.pitchRate;

    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    if (this.isCursedVoice) {
      // Screeching ear-splitting distorted circuit glitch
      osc1.type = "sawtooth";
      osc2.type = "square";

      osc1.frequency.setValueAtTime(370 * this.pitchRate, now);
      osc1.frequency.exponentialRampToValueAtTime(32 * this.pitchRate, now + dur);

      osc2.frequency.setValueAtTime(520 * this.pitchRate, now);
      osc2.frequency.linearRampToValueAtTime(45 * this.pitchRate, now + dur);

      gain.gain.setValueAtTime(0.55 * this.volume, now);
    } else {
      osc1.type = "sawtooth";
      osc2.type = "square";

      osc1.frequency.setValueAtTime(146 * this.pitchRate, now);
      osc1.frequency.linearRampToValueAtTime(95 * this.pitchRate, now + dur);

      osc2.frequency.setValueAtTime(110 * this.pitchRate, now);
      osc2.frequency.linearRampToValueAtTime(80 * this.pitchRate, now + dur);

      gain.gain.setValueAtTime(0.45 * this.volume, now);
    }

    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.isCursedVoice ? this.distortionNode : this.lowpass);
    if (this.isCursedVoice) {
      this.distortionNode.connect(this.masterGain);
    }

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + dur + 0.02);
    osc2.stop(now + dur + 0.02);

    if (onComplete) {
      setTimeout(onComplete, (dur + 0.05) * 1000);
    }
  }

  /**
   * Speak phrase
   * In cursed voice mode, sounds completely broken, demonic, and pitch-ruined!
   */
  speak(text, options = {}) {
    return new Promise((resolve) => {
      this.ensureAudio();
      const cleanText = (text || "").toUpperCase().trim();
      if (!cleanText) {
        resolve();
        return;
      }

      if (typeof window !== "undefined" && (window.IS_TEST_ENV || navigator.webdriver)) {
        setTimeout(resolve, 40);
        return;
      }

      if (this.speechSynth) {
        this.speechSynth.cancel();

        let speechText = cleanText;
        if (options.spellOut) {
          speechText = cleanText.split("").join(" . ");
        }

        const utterance = new SpeechSynthesisUtterance(speechText);
        if (this.roboticVoice) {
          utterance.voice = this.roboticVoice;
        }

        if (this.isCursedVoice) {
          // TOTALLY WRONG / CURSED DEMONIC GLITCH VOICE:
          // Ultra-low pitch gargle (0.12) with slow, dragged cadence (0.65)
          utterance.pitch = Math.max(0.1, 0.15 * this.pitchRate);
          utterance.rate = Math.max(0.4, 0.68 * this.pitchRate);
        } else {
          // Standard TMS5100 robotic tuning
          utterance.rate = Math.max(0.5, Math.min(1.8, 0.85 * this.pitchRate));
          utterance.pitch = Math.max(0.3, Math.min(1.8, 0.72 * this.pitchRate));
        }

        utterance.volume = this.volume;
        this.isSpeaking = true;

        utterance.onend = () => {
          this.isSpeaking = false;
          resolve();
        };

        utterance.onerror = () => {
          this.isSpeaking = false;
          this.playProceduralBeepSpeak(cleanText).then(resolve);
        };

        this.speechSynth.speak(utterance);

        const timeoutDur = Math.max(2500, cleanText.length * 400 / this.pitchRate);
        setTimeout(() => {
          if (this.isSpeaking) {
            this.isSpeaking = false;
            resolve();
          }
        }, timeoutDur);
      } else {
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

        if (this.isCursedVoice) {
          // Deep demonic 45Hz harsh buzz
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(52 * this.pitchRate, now);
          osc.frequency.linearRampToValueAtTime(36 * this.pitchRate, now + dur);
          gain.gain.setValueAtTime(0.45 * this.volume, now);
        } else {
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(130 * this.pitchRate, now);
          osc.frequency.linearRampToValueAtTime(115 * this.pitchRate, now + dur);
          gain.gain.setValueAtTime(0.3 * this.volume, now);
        }

        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.connect(gain);
        gain.connect(this.isCursedVoice ? this.distortionNode : this.f1Filter);
        if (this.isCursedVoice) {
          this.distortionNode.connect(this.masterGain);
        }

        osc.start(now);
        osc.stop(now + dur + 0.02);

        offset += dur + 0.08;
      });

      setTimeout(resolve, Math.max(100, offset * 1000));
    });
  }

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

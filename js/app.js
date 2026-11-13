/**
 * Main Application Orchestrator
 * Connects the VFD display, TMS5100 LPC sound synthesizer, Speak & Spell game engine,
 * and handles UI clicks, touch events, and physical keyboard inputs.
 */

document.addEventListener("DOMContentLoaded", () => {
  const vfdContainer = document.getElementById("vfd-container");
  const bendSlider = document.getElementById("bend-slider");
  const bendDisplay = document.getElementById("bend-display");
  const volSlider = document.getElementById("volume-slider");
  const volDisplay = document.getElementById("vol-display");

  // Level Badges
  const levelBadges = {
    A: document.getElementById("badge-A"),
    B: document.getElementById("badge-B"),
    C: document.getElementById("badge-C"),
    D: document.getElementById("badge-D")
  };

  // Initialize components
  const display = new VFDDisplay(vfdContainer, 8);
  const audio = new SpeakSpellAudio();
  const engine = new SpeakSpellEngine(display, audio, window.SPEAK_SPELL_WORDS);

  // Sync Level Badge UI
  function updateLevelBadges() {
    for (const [lvl, badge] of Object.entries(levelBadges)) {
      if (badge) {
        if (lvl === engine.currentLevel) {
          badge.classList.add("active");
        } else {
          badge.classList.remove("active");
        }
      }
    }
  }

  // Hook into engine cycleLevel to sync badge
  const origCycleLevel = engine.cycleLevel.bind(engine);
  engine.cycleLevel = function() {
    origCycleLevel();
    updateLevelBadges();
  };

  // Click & Touch Handlers for all membrane buttons
  const keys = document.querySelectorAll(".key");
  keys.forEach((keyBtn) => {
    const keyName = keyBtn.dataset.key;

    const pressHandler = (e) => {
      e.preventDefault();
      keyBtn.classList.add("pressed");

      if (keyName === "DEMO") {
        playDemoSequence();
      } else {
        engine.handleKey(keyName);
      }
    };

    const releaseHandler = () => {
      keyBtn.classList.remove("pressed");
    };

    keyBtn.addEventListener("mousedown", pressHandler);
    keyBtn.addEventListener("mouseup", releaseHandler);
    keyBtn.addEventListener("mouseleave", releaseHandler);

    keyBtn.addEventListener("touchstart", pressHandler, { passive: false });
    keyBtn.addEventListener("touchend", releaseHandler);
    keyBtn.addEventListener("touchcancel", releaseHandler);
  });

  // Physical Computer Keyboard Integration
  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT") return;

    const key = e.key;
    let targetKeyName = null;

    if (/^[a-zA-Z']$/.test(key)) {
      targetKeyName = key.toUpperCase();
    } else if (key === "Enter") {
      targetKeyName = "ENTER";
    } else if (key === "Backspace" || key === "Delete") {
      targetKeyName = "ERASE";
    } else if (key === " " || key === "Spacebar") {
      targetKeyName = "REPEAT";
      e.preventDefault();
    } else if (key === "Escape") {
      targetKeyName = engine.isPowerOn ? "OFF" : "ON";
    }

    if (targetKeyName) {
      // Animate visual key press on UI
      const buttonEl = document.querySelector(`.key[data-key="${targetKeyName}"]`);
      if (buttonEl) {
        buttonEl.classList.add("pressed");
        setTimeout(() => buttonEl.classList.remove("pressed"), 120);
      }
      engine.handleKey(targetKeyName);
    }
  });

  // Circuit Bending Pitch Slider
  if (bendSlider) {
    bendSlider.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      audio.setPitchRate(val);
      if (bendDisplay) {
        bendDisplay.textContent = `${val.toFixed(2)}x`;
      }
    });
  }

  // Volume Slider
  if (volSlider) {
    volSlider.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      audio.setVolume(val);
      if (volDisplay) {
        volDisplay.textContent = `${Math.round(val * 100)}%`;
      }
    });
  }

  // Demo Voice / Jingle sequence
  async function playDemoSequence() {
    if (!engine.isPowerOn) {
      engine.powerOn();
      return;
    }
    audio.ensureAudio();
    display.render("DEMO    ", 0);
    await audio.playVictoryFanfare();
    await audio.speak("TEXAS INSTRUMENTS SPEAK AND SPELL");
    await audio.speak("THAT IS CORRECT. YOU WIN!");
    display.render("SPELL   ", 0);
  }

  // Power on automatically with gentle prompt
  setTimeout(() => {
    display.render("PRESS ON", -1);
  }, 300);

  // Expose engine to window for console experimentation and debugging
  window.speakSpell = {
    display,
    audio,
    engine,
    words: window.SPEAK_SPELL_WORDS
  };
});

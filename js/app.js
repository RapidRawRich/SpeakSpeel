/**
 * Main Application Orchestrator
 * Connects the VFD display, TMS5100 LPC sound synthesizer, Speak & Spell game engine,
 * and handles UI clicks, touch events, physical keyboard inputs, and Roast Mode.
 */

document.addEventListener("DOMContentLoaded", () => {
  const vfdContainer = document.getElementById("vfd-container");
  const bendSlider = document.getElementById("bend-slider");
  const bendDisplay = document.getElementById("bend-display");
  const volSlider = document.getElementById("volume-slider");
  const volDisplay = document.getElementById("vol-display");
  const roastToggleBtn = document.getElementById("roast-toggle-btn");
  const roastIndicator = document.getElementById("roast-indicator");

  // Level Badges
  const levelBadges = {
    A: document.getElementById("badge-A"),
    B: document.getElementById("badge-B"),
    C: document.getElementById("badge-C"),
    D: document.getElementById("badge-D"),
    R: document.getElementById("badge-R")
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

  // Sync Roast Mode UI
  function updateRoastUI() {
    const isRoast = engine.isRoastMode;
    if (roastIndicator) {
      roastIndicator.textContent = isRoast ? "ACTIVE" : "OFF";
      if (isRoast) {
        roastIndicator.classList.add("on");
      } else {
        roastIndicator.classList.remove("on");
      }
    }
    if (roastToggleBtn) {
      if (isRoast) {
        roastToggleBtn.classList.add("active");
        roastToggleBtn.textContent = "🔥 ROAST ACTIVE";
      } else {
        roastToggleBtn.classList.remove("active");
        roastToggleBtn.textContent = "🔥 ROAST MODE";
      }
    }
    const roastKey = document.querySelector('.key[data-key="ROAST"]');
    if (roastKey) {
      if (isRoast) {
        roastKey.classList.add("active-roast");
      } else {
        roastKey.classList.remove("active-roast");
      }
    }
  }

  // Hook into engine cycleLevel to sync badge
  const origCycleLevel = engine.cycleLevel.bind(engine);
  engine.cycleLevel = function() {
    origCycleLevel();
    updateLevelBadges();
  };

  // Hook into engine toggleRoastMode to sync UI
  const origToggleRoast = engine.toggleRoastMode.bind(engine);
  engine.toggleRoastMode = function() {
    origToggleRoast();
    updateRoastUI();
    updateLevelBadges();
  };

  // Toggle button event listener
  if (roastToggleBtn) {
    roastToggleBtn.addEventListener("click", () => {
      engine.toggleRoastMode();
    });
  }

  // Click & Touch Handlers for all membrane buttons
  const keys = document.querySelectorAll(".key");
  keys.forEach((keyBtn) => {
    const keyName = keyBtn.dataset.key;

    const pressHandler = (e) => {
      e.preventDefault();
      keyBtn.classList.add("pressed");

      if (keyName === "ROAST") {
        engine.toggleRoastMode();
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

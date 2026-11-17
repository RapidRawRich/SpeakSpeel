/**
 * Texas Instruments Speak & Spell Game Engine & State Machine
 * Faithful implementation of all 5 original 1978 game modes:
 * - SPELL (10-word quiz with scoring, retry logic, and fanfare)
 * - MYSTERY WORD (Word guessing / hangman with strike counter)
 * - SAY IT (Spoken pronunciation and spelling reveal)
 * - SECRET CODE (Caesar cipher substitution encoder/decoder)
 * - LETTER (Phonetics and 26-tone musical scale)
 * - MODULE / LEVEL (Difficulty Groups A, B, C, D, and R)
 * Plus the hilarious, retro-styled ROAST / OFFENSIVE novelty edition!
 */

class SpeakSpellEngine {
  constructor(display, audio, wordsData) {
    this.display = display;
    this.audio = audio;
    this.words = wordsData || (typeof window !== "undefined" ? window.SPEAK_SPELL_WORDS : null);

    // Power & Mode States
    this.isPowerOn = false;
    this.isRoastMode = false;
    this.currentMode = "SPELL"; // 'SPELL', 'MYSTERY', 'SAY_IT', 'SECRET_CODE', 'LETTER'
    this.currentLevel = "A"; // 'A', 'B', 'C', 'D', 'R'

    // SPELL Mode State
    this.spellRound = 0;
    this.spellMaxRounds = 10;
    this.spellScore = 0;
    this.spellCurrentWord = "";
    this.spellAttempt = 1; // 1 or 2
    this.spellWordsList = [];

    // MYSTERY WORD State
    this.mysteryWord = "";
    this.mysteryGuessed = [];
    this.mysteryStrikes = 0;
    this.mysteryMaxStrikes = 6;

    // SAY IT State
    this.sayItIndex = 0;
    this.sayItWord = "";

    // Input Buffer
    this.inputBuffer = "";
    this.isBusy = false;
  }

  /**
   * Power Toggle
   */
  powerOn() {
    this.isPowerOn = true;
    this.isBusy = true;
    this.audio.ensureAudio();
    this.audio.stopAll();

    // Authentic boot sequence: flash display and announce
    this.display.render("SPELL   ", 0);
    this.display.flash(2, 100, async () => {
      await this.audio.playVictoryFanfare();
      if (this.isRoastMode) {
        await this.audio.speak(this.words.ROAST_PHRASES.BOOT);
      }
      this.isBusy = false;
      this.startSpellMode();
    });
  }

  powerOff() {
    this.isPowerOn = false;
    this.isBusy = false;
    this.audio.stopAll();
    this.display.clear();
    this.display.stopCursorBlink();
    this.inputBuffer = "";
  }

  /**
   * Toggle Roast / Offensive Mode
   */
  toggleRoastMode() {
    if (!this.isPowerOn) return;
    this.audio.stopAll();
    this.isBusy = false;
    this.isRoastMode = !this.isRoastMode;
    this.audio.toggleCursedVoice(this.isRoastMode);
    this.audio.playKeyClick();

    if (this.isRoastMode) {
      this.display.render("ROAST ON", -1);
      this.audio.speak(this.words.ROAST_PHRASES.BOOT).then(() => {
        this.setMode(this.currentMode);
      });
    } else {
      this.display.render("ROASTOFF", -1);
      this.audio.speak("POLITE MODE RESTORED.").then(() => {
        this.setMode(this.currentMode);
      });
    }
  }

  /**
   * Difficulty Group / Cartridge Selection
   */
  cycleLevel() {
    if (!this.isPowerOn) return;
    this.audio.stopAll();
    this.isBusy = false;
    const levels = ["A", "B", "C", "D", "R"];
    const currIdx = levels.indexOf(this.currentLevel);
    this.currentLevel = levels[(currIdx + 1) % levels.length];

    const label = this.currentLevel === "R" ? "ROAST   " : `GROUP  ${this.currentLevel}`;
    this.display.render(label, -1);
    this.audio.playKeyClick();
    const spoken = this.currentLevel === "R" ? "Roast Expansion Pack" : `Group ${this.currentLevel}`;
    this.audio.speak(spoken).then(() => {
      this.setMode(this.currentMode);
    });
  }

  /**
   * Mode Selection
   */
  setMode(mode) {
    if (!this.isPowerOn) return;
    this.audio.stopAll();
    this.isBusy = false;
    this.currentMode = mode;
    this.inputBuffer = "";
    this.audio.playKeyClick();

    switch (mode) {
      case "SPELL":
        this.startSpellMode();
        break;
      case "MYSTERY":
        this.startMysteryMode();
        break;
      case "SAY_IT":
        this.startSayItMode();
        break;
      case "SECRET_CODE":
        this.startSecretCodeMode();
        break;
      case "LETTER":
        this.startLetterMode();
        break;
    }
  }

  /* ----------------------------------------------------
   * 1. SPELL MODE (Classic 10-word quiz)
   * ---------------------------------------------------- */
  startSpellMode() {
    this.currentMode = "SPELL";
    this.spellRound = 0;
    this.spellScore = 0;
    this.inputBuffer = "";

    // Pick 10 random words from current difficulty level
    const pool = [...this.words[this.currentLevel]];
    this.shuffle(pool);
    this.spellWordsList = pool.slice(0, this.spellMaxRounds);

    this.display.render("SPELL   ", 0);
    this.nextSpellWord();
  }

  async nextSpellWord() {
    if (this.spellRound >= this.spellMaxRounds) {
      this.finishSpellRound();
      return;
    }

    this.isBusy = true;
    this.spellCurrentWord = this.spellWordsList[this.spellRound];
    this.spellAttempt = 1;
    this.inputBuffer = "";
    this.display.render("_       ", 0);

    let promptText;
    if (this.isRoastMode) {
      const prompts = this.words.ROAST_PHRASES.PROMPTS;
      const tmpl = prompts[Math.floor(Math.random() * prompts.length)];
      promptText = tmpl.replace("%s", this.spellCurrentWord);
    } else {
      promptText = (this.spellRound === 0) 
        ? `SPELL ${this.spellCurrentWord}` 
        : `NOW SPELL ${this.spellCurrentWord}`;
    }

    await this.audio.speak(promptText);
    if (!this.isPowerOn || this.currentMode !== "SPELL") return;
    this.display.render(this.inputBuffer ? this.inputBuffer : "_       ", this.inputBuffer.length);
    this.isBusy = false;
  }

  async handleSpellEnter() {
    if (this.isBusy || !this.inputBuffer) return;
    this.isBusy = true;

    const userWord = this.inputBuffer.trim().toUpperCase();
    const isCorrect = (userWord === this.spellCurrentWord);

    if (isCorrect) {
      // Award point (1 on 1st attempt, 0.5 on 2nd)
      this.spellScore += (this.spellAttempt === 1 ? 1 : 0.5);

      this.display.render(this.spellCurrentWord, -1);
      this.display.flash(2, 90);
      await this.audio.playVictoryFanfare();

      let praise;
      if (this.isRoastMode) {
        const correctList = this.words.ROAST_PHRASES.CORRECT;
        praise = correctList[Math.floor(Math.random() * correctList.length)];
      } else {
        praise = "THAT IS CORRECT";
      }
      await this.audio.speak(praise);

      this.spellRound++;
      this.isBusy = false;
      this.nextSpellWord();
    } else {
      // Incorrect answer
      this.display.flash(2, 80);
      await this.audio.playWrongBuzz();

      if (this.spellAttempt === 1) {
        // First retry
        this.spellAttempt = 2;
        this.inputBuffer = "";
        this.display.render("_       ", 0);

        let insult;
        if (this.isRoastMode) {
          const list = this.words.ROAST_PHRASES.WRONG_1;
          insult = list[Math.floor(Math.random() * list.length)];
        } else {
          insult = "WRONG. TRY AGAIN.";
        }
        await this.audio.speak(insult);
        this.isBusy = false;
      } else {
        // Second miss: reveal answer
        this.display.render(this.spellCurrentWord, -1);

        if (this.isRoastMode) {
          const list = this.words.ROAST_PHRASES.WRONG_2;
          const tmpl = list[Math.floor(Math.random() * list.length)];
          const spelledOut = this.spellCurrentWord.split("").join(" . ");
          const roastMsg = tmpl.replace("%s", this.spellCurrentWord).replace("%s", spelledOut);
          await this.audio.speak(roastMsg);
        } else {
          await this.audio.speak(
            `THAT IS INCORRECT. THE CORRECT SPELLING OF ${this.spellCurrentWord} IS`,
            { spellOut: false }
          );
          // Spell out the word letter-by-letter
          await this.audio.speak(this.spellCurrentWord, { spellOut: true });
        }

        this.spellRound++;
        this.isBusy = false;
        this.nextSpellWord();
      }
    }
  }

  async finishSpellRound() {
    this.isBusy = true;
    const finalScore = Math.round(this.spellScore);
    const scoreStr = `SCORE ${finalScore}`;
    this.display.render(scoreStr, -1);

    if (this.isRoastMode) {
      if (finalScore === 10) {
        await this.audio.playVictoryFanfare();
        await this.audio.speak(this.words.ROAST_PHRASES.PERFECT_SCORE);
      } else if (finalScore >= 6) {
        await this.audio.playVictoryFanfare();
        await this.audio.speak(this.words.ROAST_PHRASES.GOOD_SCORE.replace("%d", finalScore));
      } else {
        await this.audio.speak(this.words.ROAST_PHRASES.BAD_SCORE.replace("%d", finalScore));
      }
    } else {
      if (finalScore === 10) {
        await this.audio.playVictoryFanfare();
        await this.audio.speak("YOU WIN! PERFECT SCORE!");
      } else if (finalScore >= 6) {
        await this.audio.playVictoryFanfare();
        await this.audio.speak(`YOUR SCORE IS ${finalScore} OUT OF 10. GOOD JOB!`);
      } else {
        await this.audio.speak(`NEXT TIME, WRITE IT DOWN! YOUR SCORE IS ${finalScore}`);
      }
    }

    this.isBusy = false;
  }

  /* ----------------------------------------------------
   * 2. MYSTERY WORD MODE (Hangman)
   * ---------------------------------------------------- */
  startMysteryMode() {
    this.currentMode = "MYSTERY";
    this.isBusy = true;
    this.inputBuffer = "";
    this.mysteryGuessed = [];
    this.mysteryStrikes = 0;
    this.mysteryWordFinished = false;

    const pool = this.words[this.currentLevel] || this.words.A;
    this.mysteryWord = pool[Math.floor(Math.random() * pool.length)];

    this.display.render("MYSTERY ", -1);
    const prompt = this.isRoastMode 
      ? this.words.ROAST_PHRASES.MYSTERY_PROMPT 
      : "MYSTERY WORD. GUESS A LETTER.";

    this.audio.speak(prompt).then(() => {
      this.renderMysteryDisplay();
      this.isBusy = false;
    });
  }

  renderMysteryDisplay() {
    let displayStr = "";
    let won = true;

    for (const ch of this.mysteryWord) {
      if (this.mysteryGuessed.includes(ch)) {
        displayStr += ch;
      } else {
        displayStr += "-";
        won = false;
      }
    }

    this.display.render(displayStr, -1);
    return won;
  }

  async handleMysteryLetter(letter) {
    if (this.mysteryWordFinished) {
      this.startMysteryMode();
      return;
    }
    if (this.isBusy) return;
    if (this.mysteryGuessed.includes(letter)) {
      this.audio.playKeyClick();
      return;
    }

    this.isBusy = true;
    this.mysteryGuessed.push(letter);

    if (this.mysteryWord.includes(letter)) {
      this.audio.playLetterNote(letter);
      const isComplete = this.renderMysteryDisplay();

      if (isComplete) {
        this.mysteryWordFinished = true;
        this.display.flash(2, 90);
        await this.audio.playVictoryFanfare();
        const msg = this.isRoastMode
          ? this.words.ROAST_PHRASES.MYSTERY_WIN.replace("%s", this.mysteryWord)
          : `YOU WIN! THE MYSTERY WORD IS ${this.mysteryWord}`;
        await this.audio.speak(msg);
        this.isBusy = false;
        return;
      }
    } else {
      this.mysteryStrikes++;
      await this.audio.playWrongBuzz();

      if (this.mysteryStrikes >= this.mysteryMaxStrikes) {
        this.mysteryWordFinished = true;
        this.display.render(this.mysteryWord, -1);
        const msg = this.isRoastMode
          ? this.words.ROAST_PHRASES.MYSTERY_LOSE.replace("%s", this.mysteryWord)
          : `THAT IS INCORRECT. THE MYSTERY WORD IS ${this.mysteryWord}`;
        await this.audio.speak(msg);
        this.isBusy = false;
        return;
      } else {
        if (this.isRoastMode) {
          const list = this.words.ROAST_PHRASES.MYSTERY_WRONG;
          await this.audio.speak(list[Math.floor(Math.random() * list.length)]);
        } else {
          await this.audio.speak(`WRONG. ${this.mysteryMaxStrikes - this.mysteryStrikes} CHANCES LEFT.`);
        }
      }
    }

    this.isBusy = false;
  }

  /* ----------------------------------------------------
   * 3. SAY IT MODE
   * ---------------------------------------------------- */
  startSayItMode() {
    this.currentMode = "SAY_IT";
    this.sayItIndex = 0;
    this.nextSayItWord();
  }

  async nextSayItWord() {
    const pool = this.words[this.currentLevel];
    this.sayItWord = pool[Math.floor(Math.random() * pool.length)];
    this.isBusy = true;

    this.display.render(this.sayItWord, -1);
    const prefix = this.isRoastMode ? "SAY IT, IF YOU CAN. " : "SAY IT. ";
    await this.audio.speak(`${prefix}${this.sayItWord}`);
    if (!this.isPowerOn || this.currentMode !== "SAY_IT") return;

    // Wait 2.2 seconds to allow player to speak
    await new Promise((res) => setTimeout(res, 2200));
    if (!this.isPowerOn || this.currentMode !== "SAY_IT") return;

    // Pronounce again and spell it out
    await this.audio.speak(this.sayItWord);
    if (!this.isPowerOn || this.currentMode !== "SAY_IT") return;
    await this.audio.speak(this.sayItWord, { spellOut: true });
    if (!this.isPowerOn || this.currentMode !== "SAY_IT") return;
    await this.audio.speak(this.sayItWord);
    if (!this.isPowerOn || this.currentMode !== "SAY_IT") return;

    this.isBusy = false;
  }

  /* ----------------------------------------------------
   * 4. SECRET CODE MODE (Caesar cipher encoder/decoder)
   * ---------------------------------------------------- */
  startSecretCodeMode() {
    this.currentMode = "SECRET_CODE";
    this.inputBuffer = "";
    this.display.render("CODE    ", 0);
    this.audio.speak(this.isRoastMode ? "SECRET CODE. TOO COMPLEX FOR YOU." : "SECRET CODE");
  }

  handleSecretCodeInput(letter) {
    if (!this.isPowerOn || this.isBusy) return;
    this.audio.playKeyClick();

    if (this.inputBuffer.length < 8) {
      this.inputBuffer += letter;
      const encoded = this.words.encodeSecretCode(this.inputBuffer);
      this.display.render(encoded, encoded.length);
      this.audio.playLetterNote(letter);
    }
  }

  async handleSecretCodeEnter() {
    if (!this.inputBuffer) return;
    this.isBusy = true;
    const encoded = this.words.encodeSecretCode(this.inputBuffer);
    await this.audio.speak(`CODE IS ${encoded}`);
    await this.audio.speak(`WORD IS ${this.inputBuffer}`);
    this.isBusy = false;
  }

  /* ----------------------------------------------------
   * 5. LETTER MODE (Alphabet & Phonics)
   * ---------------------------------------------------- */
  startLetterMode() {
    this.currentMode = "LETTER";
    this.inputBuffer = "";
    this.display.render("LETTER  ", -1);
    this.audio.speak(this.isRoastMode ? "TRY TO IDENTIFY A LETTER." : "PRESS A LETTER");
  }

  handleLetterModeInput(letter) {
    if (!this.isPowerOn || this.isBusy) return;
    this.display.render(letter.padEnd(8, " "), 0);
    this.audio.playLetterNote(letter);
    this.audio.speak(letter);
  }

  /* ----------------------------------------------------
   * Global Input Routing (Keypad & Keyboard)
   * ---------------------------------------------------- */
  handleKey(keyName) {
    if (!this.isPowerOn && keyName !== "ON") {
      return;
    }

    const upperKey = keyName.toUpperCase();

    // Power Buttons
    if (upperKey === "ON") {
      this.powerOn();
      return;
    }
    if (upperKey === "OFF") {
      this.powerOff();
      return;
    }

    // Roast Mode Toggle
    if (upperKey === "ROAST" || upperKey === "ROAST_MODE" || upperKey === "SASS") {
      this.toggleRoastMode();
      return;
    }

    // Mode Buttons
    if (upperKey === "SPELL") {
      this.setMode("SPELL");
      return;
    }
    if (upperKey === "MYSTERY" || upperKey === "MYSTERY WORD") {
      this.setMode("MYSTERY");
      return;
    }
    if (upperKey === "SAY_IT" || upperKey === "SAY IT") {
      this.setMode("SAY_IT");
      return;
    }
    if (upperKey === "SECRET_CODE" || upperKey === "SECRET CODE") {
      this.setMode("SECRET_CODE");
      return;
    }
    if (upperKey === "LETTER") {
      this.setMode("LETTER");
      return;
    }
    if (upperKey === "MODULE" || upperKey === "LEVEL") {
      this.cycleLevel();
      return;
    }

    // Erase / Backspace Key
    if (upperKey === "ERASE" || upperKey === "BACKSPACE" || upperKey === "DELETE") {
      this.handleErase();
      return;
    }

    // Repeat Key
    if (upperKey === "REPEAT") {
      this.handleRepeat();
      return;
    }

    // Enter / Submit Key
    if (upperKey === "ENTER") {
      this.handleEnter();
      return;
    }

    // Alphanumeric Keys (A through Z, 0 through 9, and Apostrophe)
    if (/^[A-Z0-9']$/.test(upperKey)) {
      this.handleLetter(upperKey);
    }
  }

  handleLetter(letter) {
    if (this.currentMode === "SPELL") {
      // If voice is currently speaking prompt, typing interrupts it
      if (this.audio.isSpeaking) {
        this.audio.stopAll();
        this.isBusy = false;
      }
      if (this.isBusy) return;

      this.audio.playKeyClick();
      if (this.inputBuffer.length < 8) {
        this.inputBuffer += letter;
        this.display.render(this.inputBuffer, this.inputBuffer.length);
      }
    } else if (this.currentMode === "MYSTERY") {
      if (this.audio.isSpeaking) {
        this.audio.stopAll();
        this.isBusy = false;
      }
      this.handleMysteryLetter(letter);
    } else if (this.currentMode === "SECRET_CODE") {
      this.handleSecretCodeInput(letter);
    } else if (this.currentMode === "LETTER") {
      this.handleLetterModeInput(letter);
    }
  }

  handleErase() {
    if (this.audio.isSpeaking) {
      this.audio.stopAll();
      this.isBusy = false;
    }
    if (this.isBusy) return;
    this.audio.playKeyClick();

    if (this.inputBuffer.length > 0) {
      this.inputBuffer = this.inputBuffer.slice(0, -1);
      if (this.currentMode === "SECRET_CODE") {
        const enc = this.words.encodeSecretCode(this.inputBuffer);
        this.display.render(enc || "CODE    ", enc.length);
      } else {
        const displayStr = this.inputBuffer || "_";
        this.display.render(displayStr, this.inputBuffer.length);
      }
    }
  }

  handleRepeat() {
    if (this.isBusy) return;
    this.audio.playKeyClick();

    if (this.currentMode === "SPELL") {
      if (this.spellCurrentWord) {
        const text = this.isRoastMode ? `PAY ATTENTION. SPELL ${this.spellCurrentWord}` : `SPELL ${this.spellCurrentWord}`;
        this.audio.speak(text);
      }
    } else if (this.currentMode === "MYSTERY") {
      this.audio.speak(this.isRoastMode ? "HURRY UP AND GUESS A LETTER." : "MYSTERY WORD. GUESS A LETTER.");
    } else if (this.currentMode === "SAY_IT") {
      if (this.sayItWord) {
        this.audio.speak(this.sayItWord);
      }
    } else if (this.currentMode === "SECRET_CODE") {
      this.audio.speak("SECRET CODE");
    }
  }

  handleEnter() {
    if (this.currentMode === "SPELL") {
      this.handleSpellEnter();
    } else if (this.currentMode === "SAY_IT") {
      this.nextSayItWord();
    } else if (this.currentMode === "SECRET_CODE") {
      this.handleSecretCodeEnter();
    } else if (this.currentMode === "MYSTERY") {
      // In mystery mode, enter starts a new word if round ended
      this.startMysteryMode();
    }
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = SpeakSpellEngine;
}
if (typeof window !== "undefined") {
  window.SpeakSpellEngine = SpeakSpellEngine;
}

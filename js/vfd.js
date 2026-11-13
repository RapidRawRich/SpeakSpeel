/**
 * 14-Segment Vacuum Fluorescent Display (VFD) Engine
 * Authentically emulates the 8-character VFD display of the 1978 Texas Instruments Speak & Spell.
 *
 * Segment layout:
 *        -- a --
 *      |\   |   /|
 *      f h  i  j b
 *      |  \ | /  |
 *      --g1-+-g2--
 *      |  / | \  |
 *      e k  l  m c
 *      |/   |   \|
 *        -- d --   (dp)
 */

class VFDDisplay {
  constructor(containerElement, charCount = 8) {
    this.container = containerElement;
    this.charCount = charCount;
    this.chars = [];
    this.text = "".padStart(charCount, " ");
    this.cursorPos = -1;
    this.cursorVisible = false;
    this.blinkInterval = null;
    
    // 14-segment lookup table for ASCII
    this.segmentMap = {
      " ": [],
      "A": ["a", "b", "c", "e", "f", "g1", "g2"],
      "B": ["a", "b", "c", "d", "i", "l", "g2"],
      "C": ["a", "d", "e", "f"],
      "D": ["a", "b", "c", "d", "i", "l"],
      "E": ["a", "d", "e", "f", "g1", "g2"],
      "F": ["a", "e", "f", "g1"],
      "G": ["a", "c", "d", "e", "f", "g2"],
      "H": ["b", "c", "e", "f", "g1", "g2"],
      "I": ["a", "d", "i", "l"],
      "J": ["b", "c", "d", "e"],
      "K": ["e", "f", "g1", "j", "m"],
      "L": ["d", "e", "f"],
      "M": ["b", "c", "e", "f", "h", "j"],
      "N": ["b", "c", "e", "f", "h", "m"],
      "O": ["a", "b", "c", "d", "e", "f"],
      "P": ["a", "b", "e", "f", "g1", "g2"],
      "Q": ["a", "b", "c", "d", "e", "f", "m"],
      "R": ["a", "b", "e", "f", "g1", "g2", "m"],
      "S": ["a", "c", "d", "f", "g1", "g2"],
      "T": ["a", "i", "l"],
      "U": ["b", "c", "d", "e", "f"],
      "V": ["e", "f", "k", "j"],
      "W": ["b", "c", "e", "f", "k", "m"],
      "X": ["h", "j", "k", "m"],
      "Y": ["h", "j", "l"],
      "Z": ["a", "d", "j", "k"],
      "0": ["a", "b", "c", "d", "e", "f"],
      "1": ["b", "c"],
      "2": ["a", "b", "d", "e", "g1", "g2"],
      "3": ["a", "b", "c", "d", "g2"],
      "4": ["b", "c", "f", "g1", "g2"],
      "5": ["a", "c", "d", "f", "g1", "g2"],
      "6": ["a", "c", "d", "e", "f", "g1", "g2"],
      "7": ["a", "b", "c"],
      "8": ["a", "b", "c", "d", "e", "f", "g1", "g2"],
      "9": ["a", "b", "c", "d", "f", "g1", "g2"],
      "-": ["g1", "g2"],
      "_": ["d"],
      "=": ["g1", "g2", "d"],
      "?": ["a", "b", "g2", "l"],
      "!": ["b", "c", "dp"],
      "/": ["k", "j"],
      "\\": ["h", "m"],
      "+": ["g1", "g2", "i", "l"],
      "*": ["g1", "g2", "i", "l", "h", "j", "k", "m"],
      "'": ["i"],
      "\"": ["f", "b"],
      ".": ["dp"],
      ">": ["h", "k"],
      "<": ["j", "m"]
    };

    this.init();
  }

  init() {
    this.container.innerHTML = "";
    this.chars = [];
    
    const wrapper = document.createElement("div");
    wrapper.className = "vfd-grid";
    
    for (let i = 0; i < this.charCount; i++) {
      const charEl = this.createCharElement(i);
      this.chars.push(charEl);
      wrapper.appendChild(charEl.element);
    }
    
    this.container.appendChild(wrapper);
    this.startCursorBlink();
  }

  createCharElement(index) {
    const el = document.createElement("div");
    el.className = "vfd-char";
    el.dataset.index = index;

    // SVG 14-segment definition
    // ViewBox: 0 0 60 90
    // Coords carefully positioned for authentic 14-segment look
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 64 96");
    svg.setAttribute("class", "vfd-svg");

    // Segment coordinate paths
    const segments = {
      a:  "M 14 8  L 50 8  L 45 14 L 19 14 Z",
      b:  "M 51 10 L 57 16 L 53 46 L 47 43 L 49 14 Z",
      c:  "M 47 53 L 53 50 L 49 82 L 43 80 L 45 53 Z",
      d:  "M 19 82 L 45 82 L 50 88 L 14 88 Z",
      e:  "M 11 50 L 17 53 L 19 80 L 13 82 L 9 76 Z",
      f:  "M 13 14 L 19 10 L 17 43 L 11 46 L 9 20 Z",
      g1: "M 15 48 L 18 45 L 30 45 L 30 51 L 18 51 Z",
      g2: "M 34 48 L 34 45 L 46 45 L 49 48 L 46 51 L 34 51 Z",
      h:  "M 20 18 L 29 39 L 26 41 L 16 20 Z",
      i:  "M 30 16 L 34 16 L 34 42 L 30 42 Z",
      j:  "M 44 20 L 35 39 L 38 41 L 47 18 Z",
      k:  "M 26 55 L 29 57 L 20 78 L 16 76 Z",
      l:  "M 30 54 L 34 54 L 34 80 L 30 80 Z",
      m:  "M 38 55 L 35 57 L 44 76 L 47 78 Z",
      dp: "M 54 84 A 3 3 0 1 1 54 90 A 3 3 0 1 1 54 84 Z"
    };

    const segmentNodes = {};

    for (const [key, pathD] of Object.entries(segments)) {
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", pathD);
      path.setAttribute("class", `vfd-seg vfd-seg-${key}`);
      svg.appendChild(path);
      segmentNodes[key] = path;
    }

    el.appendChild(svg);

    return {
      element: el,
      segments: segmentNodes,
      currentChar: " "
    };
  }

  setChar(index, char, showCursor = false) {
    if (index < 0 || index >= this.charCount) return;
    const charObj = this.chars[index];
    const upper = (char || " ").toUpperCase();
    charObj.currentChar = upper;

    let activeSegments = this.segmentMap[upper] || [];

    // If cursor is on this position and cursor is active, light up bottom segment 'd'
    if (showCursor) {
      if (!activeSegments.includes("d")) {
        activeSegments = [...activeSegments, "d"];
      }
    }

    for (const [segName, segNode] of Object.entries(charObj.segments)) {
      if (activeSegments.includes(segName)) {
        segNode.classList.add("lit");
      } else {
        segNode.classList.remove("lit");
      }
    }
  }

  render(text, cursorPos = -1) {
    this.text = text || "";
    this.cursorPos = cursorPos;
    
    // Format text left-aligned or padded to 8 chars
    const padded = this.text.padEnd(this.charCount, " ").substring(0, this.charCount);

    for (let i = 0; i < this.charCount; i++) {
      const isCursorAt = (i === this.cursorPos && this.cursorVisible);
      this.setChar(i, padded[i], isCursorAt);
    }
  }

  startCursorBlink() {
    if (this.blinkInterval) clearInterval(this.blinkInterval);
    this.blinkInterval = setInterval(() => {
      this.cursorVisible = !this.cursorVisible;
      if (this.cursorPos >= 0) {
        this.render(this.text, this.cursorPos);
      }
    }, 450);
  }

  stopCursorBlink() {
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
      this.blinkInterval = null;
    }
    this.cursorVisible = false;
  }

  clear() {
    this.text = "".padEnd(this.charCount, " ");
    this.cursorPos = -1;
    this.render(this.text);
  }

  flash(times = 2, speed = 120, callback) {
    let count = 0;
    const originalText = this.text;
    const timer = setInterval(() => {
      count++;
      if (count % 2 === 1) {
        for (let i = 0; i < this.charCount; i++) {
          this.setChar(i, " ");
        }
      } else {
        this.render(originalText, this.cursorPos);
      }

      if (count >= times * 2) {
        clearInterval(timer);
        this.render(originalText, this.cursorPos);
        if (callback) callback();
      }
    }, speed);
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = VFDDisplay;
}
if (typeof window !== "undefined") {
  window.VFDDisplay = VFDDisplay;
}

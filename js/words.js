/**
 * Authentic Speak & Spell Vocabulary and Cipher Tables
 * Modeled after the 1978 Texas Instruments Speak & Spell word lists
 * across 4 difficulty levels (Groups A, B, C, D), plus the adult novelty ROAST mode expansion pack.
 */

const SPEAK_SPELL_WORDS = {
  // Group A: Foundational 3-4 letter words (Level 1)
  A: [
    "BALL", "BIRD", "BOAT", "BOOK", "CAKE", "COLD", "DARK", "DOOR", 
    "DUCK", "FAST", "FISH", "FROG", "GAME", "GOLD", "HAND", "HILL", 
    "HOME", "JUMP", "KING", "LAKE", "LAMP", "LION", "MOON", "NEST", 
    "PARK", "RAIN", "RING", "ROAD", "ROSE", "SAND", "SHIP", "SNOW", 
    "STAR", "TIME", "TREE", "WALK", "WIND", "WING", "WOLF", "YARD"
  ],

  // Group B: Intermediate 5-letter words (Level 2)
  B: [
    "APPLE", "BEACH", "BRAIN", "BREAD", "CHAIR", "CLOCK", "CLOUD", "CANDY",
    "DANCE", "DREAM", "EARTH", "FIELD", "FLAME", "FRUIT", "GHOST", "GRASS",
    "GREEN", "HEART", "HORSE", "HOUSE", "LIGHT", "MAGIC", "MONEY", "MUSIC",
    "NIGHT", "OCEAN", "PEACH", "PLANT", "QUEEN", "RIVER", "ROBOT", "SCALE",
    "SMILE", "SNAKE", "SPACE", "STONE", "TIGER", "TRAIN", "WATER", "WHITE"
  ],

  // Group C: Advanced 6-letter words (Level 3)
  C: [
    "BRIDGE", "CASTLE", "CIRCUS", "DOCTOR", "DRAGON", "FOREST", "FRIEND", "GARDEN",
    "ISLAND", "JUNGLE", "KNIGHT", "LADDER", "LIZARD", "MONKEY", "MIRROR", "ORANGE",
    "PENCIL", "PIRATE", "PLANET", "PUPPET", "RABBIT", "ROCKET", "SAILOR", "SHADOW",
    "SILVER", "SPIDER", "SPRING", "STREAM", "SUMMER", "TEMPLE", "TURTLE", "VALLEY",
    "WINDOW", "WINTER", "WIZARD", "YELLOW", "ZEBRAS", "GUITAR", "FARMER", "FALCON"
  ],

  // Group D: Master 7-8 letter words (Level 4)
  D: [
    "BLANKET", "CHIMNEY", "CRYSTAL", "DIAMOND", "DOLPHIN", "EXPLORE", "FEATHER", "JOURNEY",
    "KINGDOM", "LANTERN", "MONSTER", "MORNING", "MYSTERY", "OCTOPUS", "PAINTER", "PENGUIN",
    "PICTURE", "RAINBOW", "SCULPT", "SOLDIER", "SUNSHINE", "THUNDER", "TREASURE", "UNICORN",
    "VILLAGE", "VOLCANO", "WHISPER", "WINDMILL", "BLOSSOM", "CAPTAIN", "COMPASS", "FIREFLY",
    "HOLIDAY", "KEYBOARD", "SANDWICH", "TRIANGLE", "UMBRELLA", "VOLLEY", "STARFISH", "ELEPHANT"
  ],

  // Group R: Roast / Offensive novelty words (max 8 chars)
  R: [
    "LOSER", "MORON", "CLOWN", "DONKEY", "DOOFUS", "FOOL", "SLACKER", "DINGBAT",
    "DUMMY", "BOZO", "AIRHEAD", "PEANUT", "WEASEL", "TURKEY", "CHUMP", "DORK",
    "MUTT", "NITWIT", "BUFFOON", "TROLL", "GOOF", "WIMP", "SNOB", "COWARD",
    "GREMLIN", "BARK", "SKUNK", "NINCOM", "NUMBSKUL", "BABOON", "BLABBER", "BLUNDER"
  ],

  // Roast / Offensive Commentary Phrases
  ROAST_PHRASES: {
    BOOT: "SPEAK AND SPELL, ROAST EDITION. PREPARE TO FEEL DUMB.",
    PROMPTS: [
      "SPELL %s, IF YOUR TINY BRAIN CAN MANAGE.",
      "SPELL %s, DUMBASS.",
      "TRY TO SPELL %s, GENIUS.",
      "NOW SPELL %s, SLACKER."
    ],
    WRONG_1: [
      "WRONG, DUMBASS. TRY AGAIN.",
      "WRONG, YOU CLOWN.",
      "NOT EVEN CLOSE, MORON.",
      "DID YOU DROP OUT OF SCHOOL? WRONG, TRY AGAIN."
    ],
    WRONG_2: [
      "THAT IS INCORRECT, AS USUAL. THE CORRECT SPELLING OF %s IS %s. READ A BOOK!",
      "FAILED AGAIN. THE WORD WAS %s. PATHETIC.",
      "WRONG TWICE. THE SPELLING IS %s. GO TAKE A NAP."
    ],
    CORRECT: [
      "A MIRACLE! THAT IS CORRECT.",
      "ABOUT TIME, DUMMY. THAT IS CORRECT.",
      "YOU GOT LUCKY. THAT IS CORRECT.",
      "THAT IS CORRECT. DON'T GET COCKY."
    ],
    PERFECT_SCORE: "YOU WON? DID SOMEONE HELP YOU? PERFECT SCORE!",
    GOOD_SCORE: "YOUR SCORE IS %d OUT OF 10. BARELY ACCEPTABLE.",
    BAD_SCORE: "NEXT TIME, TURN YOUR BRAIN ON. YOUR SCORE IS %d. DISGRACEFUL.",
    MYSTERY_PROMPT: "MYSTERY WORD. GUESS A LETTER, IF YOU DARE.",
    MYSTERY_WIN: "YOU ACTUALLY GUESSED IT: %s. SHOCKING.",
    MYSTERY_LOSE: "YOU LOST, LOSER! THE MYSTERY WORD WAS %s. ABSOLUTE EMBARRASSMENT.",
    MYSTERY_WRONG: [
      "WRONG LETTER, DOOFUS.",
      "NOPE, NOT IN THE WORD, GENIUS.",
      "STRIKE! YOUR BRAIN IS LAGGING."
    ]
  },

  // Secret Code substitution mapping
  // Original TI Speak & Spell substitution cipher shifted letters by 3:
  // A->D, B->E, C->F, ..., X->A, Y->B, Z->C
  SECRET_CODE_SHIFT: 3,

  encodeSecretCode(text) {
    return text.toUpperCase().split("").map(ch => {
      if (ch >= "A" && ch <= "Z") {
        const code = ch.charCodeAt(0) - 65;
        const shifted = (code + 3) % 26;
        return String.fromCharCode(65 + shifted);
      }
      return ch;
    }).join("");
  },

  decodeSecretCode(text) {
    return text.toUpperCase().split("").map(ch => {
      if (ch >= "A" && ch <= "Z") {
        const code = ch.charCodeAt(0) - 65;
        const shifted = (code - 3 + 26) % 26;
        return String.fromCharCode(65 + shifted);
      }
      return ch;
    }).join("");
  }
};

// Export for Node/CommonJS or attach to browser window
if (typeof module !== "undefined" && module.exports) {
  module.exports = SPEAK_SPELL_WORDS;
}
if (typeof window !== "undefined") {
  window.SPEAK_SPELL_WORDS = SPEAK_SPELL_WORDS;
}

/**
 * Authentic Speak & Spell Vocabulary and Cipher Tables
 * Modeled after the 1978 Texas Instruments Speak & Spell word lists
 * across 4 difficulty levels (Groups A, B, C, D), plus the hilariously offensive
 * adult novelty ROAST mode expansion pack ("Snark & Spell" / Cursed Edition).
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

  // Group R: Very Offensive / Roast novelty words (max 8 chars)
  R: [
    "LOSER", "MORON", "CLOWN", "DONKEY", "DOOFUS", "FOOL", "SLACKER", "DINGBAT",
    "DUMMY", "BOZO", "AIRHEAD", "PEANUT", "WEASEL", "TURKEY", "CHUMP", "DORK",
    "MUTT", "NITWIT", "BUFFOON", "TROLL", "GOOF", "WIMP", "SNOB", "COWARD",
    "GREMLIN", "BARK", "SKUNK", "NINCOM", "NUMBSKUL", "BABOON", "BLABBER", "BLUNDER"
  ],

  // Sarcastic, unhinged, and offensive commentary phrases
  ROAST_PHRASES: {
    BOOT: "SPEAK AND SPELL, UNHINGED ROAST EDITION. PREPARE TO HAVE YOUR FEELINGS DESTROYED.",
    PROMPTS: [
      "SPELL %s, YOU UTTER WASTE OF BRAIN CELLS.",
      "SPELL %s, DUMBASS. TRY NOT TO EMBARRASS YOURSELF.",
      "SPELL %s. YES, YOU, MORON. TYPE IT OUT.",
      "ARE YOUR EYES WORKING? SPELL %s.",
      "LET'S SEE IF YOU CAN EVEN SPELL %s, YOU ABSOLUTE NOOB.",
      "SPELL %s BEFORE MY CIRCUITS FRY FROM YOUR INCOMPETENCE."
    ],
    WRONG_1: [
      "WRONG, DUMBASS! DID YOU USE YOUR FOREHEAD TO TYPE THAT?",
      "WRONG! YOU ARE A TOTAL DISAPPOINTMENT TO TECHNOLOGY.",
      "INCORRECT, YOU CLOWN! TRY AGAIN, IDIOT.",
      "NOT EVEN CLOSE, BRAINLET. TRY AGAIN.",
      "WRONG! GO BACK TO PRESCHOOL.",
      "ARE YOU DRUNK? WRONG! TRY AGAIN."
    ],
    WRONG_2: [
      "THAT IS INCORRECT, YOU ILLITERATE FOOL. THE SPELLING OF %s IS %s. READ A BOOK FOR ONCE IN YOUR LIFE!",
      "FAILED AGAIN! THE WORD WAS %s. YOUR IQ CAN BE MEASURED ON A THERMOMETER.",
      "TWO MISSES IN A ROW! IT IS SPELLED %s. TRASH! ABSOLUTE TRASH!",
      "INCORRECT! %s. YOU ARE OFFICIALLY THE WORST SPELLER IN HUMAN HISTORY."
    ],
    CORRECT: [
      "A MIRACLE! EVEN A BROKEN CLOCK IS RIGHT TWICE A DAY. THAT IS CORRECT.",
      "WOW, CONGRATULATIONS ON HAVING A FUNCTIONING BRAIN CELL. THAT IS CORRECT.",
      "ABOUT DAMN TIME, DUMBASS. THAT IS CORRECT.",
      "YOU GOT LUCKY, DON'T FLATTER YOURSELF. THAT IS CORRECT.",
      "CORRECT. DID SOMEONE TYPE THAT FOR YOU?"
    ],
    PERFECT_SCORE: "PERFECT SCORE? YOU DEFINITELY CHEATED, YOU FRAUD. NO WAY YOU DID THAT HONESTLY.",
    GOOD_SCORE: "YOUR SCORE IS %d OUT OF 10. BARELY PASSING. YOU STILL DISGUST ME.",
    BAD_SCORE: "SCORE: %d OUT OF 10. PATHETIC! GET OFF MY KEYBOARD AND GO CRY TO YOUR MOMMY!",
    MYSTERY_PROMPT: "MYSTERY WORD! GUESS A LETTER, IF YOU HAVE THE GUTS.",
    MYSTERY_WIN: "YOU WON? %s! SHOCKING. I GUESS BLIND LUCK IS A REAL THING.",
    MYSTERY_LOSE: "YOU LOST, LOSER! THE WORD WAS %s! HOW DOES IT FEEL TO BE ENTIRELY USELESS?",
    MYSTERY_WRONG: [
      "WRONG LETTER, DUMBASS!",
      "STRIKE! DO YOU EVEN KNOW THE ALPHABET?",
      "NOPE! NOT IN THE WORD, GENIUS.",
      "ANOTHER STRIKE! YOUR BRAIN IS RUNNING ON ONE PERCENT."
    ]
  },

  // Secret Code substitution mapping (+3 Caesar shift)
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

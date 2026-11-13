---
name: retro-speak-spell
description: Operate, inspect, and extend the Texas Instruments Speak & Spell (1978) emulation system. Use when running the emulator, adding new words/cartridge modules, running tests, or controlling game modes.
---

# Retro Speak & Spell Skill

Provides comprehensive instructions for managing, running, testing, and modifying the authentic 1978 Texas Instruments Speak & Spell emulator.

## Starting the Server

To launch the local web emulator:
```bash
python3 server.py [port]
```
Default port is 8080. If busy, the server automatically finds the next available port.

## Running the Automated Test Suite

Run unit tests to verify vocabulary integrity, cipher reciprocity, and 14-segment mappings:
```bash
python3 test_speak_spell.py
```

## Adding New Word Modules / Expansion Packs

Edit `js/words.js` to add custom word lists or cartridges:
- Ensure words are uppercase strings.
- **Critical rule**: Words must not exceed 8 characters due to the physical 8-digit VFD limit.
- Difficulty categories:
  - `A`: 3-4 letters
  - `B`: 5 letters
  - `C`: 6 letters
  - `D`: 7-8 letters

## Game Modes Supported

- `SPELL`: 10-word quiz round with attempt tracking (1st try: 1 pt, 2nd try: 0.5 pt) and victory fanfare.
- `MYSTERY WORD`: Classic word-guessing game with up to 6 strikes and dynamic segment reveals.
- `SAY IT`: Pronunciation practice mode with delayed spelling reveal.
- `SECRET CODE`: Substitution cipher (+3 Caesar shift) encoder and decoder.
- `LETTER`: Educational phonics mode with 26 chromatic musical tones.

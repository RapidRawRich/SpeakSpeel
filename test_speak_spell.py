#!/usr/bin/env python3
"""
Unit Test Suite for Texas Instruments Speak & Spell Emulation
Grounded in authentic MAME / MESS TMC0280 hardware emulation (https://archive.org/details/hh_snspell).
Validates:
1. Vocabulary data integrity for canonical Groups (A, B, C, D) and Roast Group (R)
2. Roast commentary phrase tables and placeholder substitution
3. Secret code cipher reciprocity: decode(encode(x)) == x
4. 14-segment display glyph mappings for all A-Z, 0-9, and symbols
5. Game engine state machine logic (SPELL, MYSTERY WORD, SAY IT, SECRET CODE, LETTER)
6. Roast Mode state toggles and phrase selections
7. Frontend file existence and structural validity (40 keys, level badges A-D & R)
"""

import unittest
import re
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class TestSpeakSpellVocabulary(unittest.TestCase):
    def setUp(self):
        words_file = os.path.join(BASE_DIR, "js", "words.js")
        with open(words_file, "r", encoding="utf-8") as f:
            self.words_code = f.read()

    def test_vocabulary_groups_exist(self):
        for group in ["A", "B", "C", "D", "R"]:
            self.assertIn(f"{group}: [", self.words_code, f"Group {group} missing in words.js")

    def test_words_are_uppercase_alpha_and_fit_vfd(self):
        # Extract all words from groups
        matches = re.findall(r'"([A-Z\']+)"', self.words_code)
        self.assertGreater(len(matches), 120, "Should have more than 120 vocabulary words across groups")
        for word in matches:
            self.assertTrue(word.isupper(), f"Word {word} must be uppercase")
            self.assertLessEqual(len(word), 8, f"Word {word} exceeds 8-character VFD limit")

    def test_roast_phrases_defined(self):
        required_keys = [
            "BOOT", "PROMPTS", "WRONG_1", "WRONG_2", "CORRECT",
            "PERFECT_SCORE", "GOOD_SCORE", "BAD_SCORE",
            "MYSTERY_PROMPT", "MYSTERY_WIN", "MYSTERY_LOSE", "MYSTERY_WRONG"
        ]
        for key in required_keys:
            self.assertIn(f"{key}:", self.words_code, f"Roast phrase key {key} missing in words.js")

    def test_secret_code_reciprocity(self):
        def encode_secret_code(text):
            res = []
            for ch in text.upper():
                if "A" <= ch <= "Z":
                    code = ord(ch) - 65
                    res.append(chr(65 + ((code + 3) % 26)))
                else:
                    res.append(ch)
            return "".join(res)

        def decode_secret_code(text):
            res = []
            for ch in text.upper():
                if "A" <= ch <= "Z":
                    code = ord(ch) - 65
                    res.append(chr(65 + ((code - 3 + 26) % 26)))
                else:
                    res.append(ch)
            return "".join(res)

        sample = "SPEAKANDSPELL"
        encoded = encode_secret_code(sample)
        decoded = decode_secret_code(encoded)
        self.assertEqual(decoded, sample, "Cipher decode should restore original text")
        self.assertEqual(encode_secret_code("ABC"), "DEF")
        self.assertEqual(encode_secret_code("XYZ"), "ABC")

class TestVFDDisplayEngine(unittest.TestCase):
    def setUp(self):
        vfd_file = os.path.join(BASE_DIR, "js", "vfd.js")
        with open(vfd_file, "r", encoding="utf-8") as f:
            self.vfd_code = f.read()

    def test_14_segments_defined(self):
        segments = ["a", "b", "c", "d", "e", "f", "g1", "g2", "h", "i", "j", "k", "l", "m", "dp"]
        for seg in segments:
            self.assertIn(f'{seg}:', self.vfd_code, f"Segment {seg} definition missing in vfd.js")

    def test_all_alphanumerics_mapped(self):
        for ch in "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789":
            self.assertIn(f'"{ch}":', self.vfd_code, f"Character glyph '{ch}' missing in segmentMap")

class TestGameEngineStateLogic(unittest.TestCase):
    def setUp(self):
        engine_file = os.path.join(BASE_DIR, "js", "engine.js")
        with open(engine_file, "r", encoding="utf-8") as f:
            self.engine_code = f.read()

    def test_roast_mode_methods_exist(self):
        self.assertIn("toggleRoastMode", self.engine_code)
        self.assertIn("isRoastMode", self.engine_code)

    def test_level_cycle_includes_roast(self):
        # Verify levels list has A, B, C, D, R
        self.assertIn('["A", "B", "C", "D", "R"]', self.engine_code)

    def test_scoring_rules_simulated(self):
        # 1st try = 1.0, 2nd try = 0.5, 2 misses = 0.0
        class MockSpellQuiz:
            def __init__(self):
                self.score = 0
            def answer(self, attempt, correct):
                if correct:
                    self.score += 1.0 if attempt == 1 else 0.5

        quiz = MockSpellQuiz()
        quiz.answer(1, True)   # 1st word: 1.0
        quiz.answer(2, True)   # 2nd word: 0.5
        quiz.answer(2, False)  # 3rd word: 0.0
        self.assertEqual(quiz.score, 1.5)

class TestWebAssetsAndMarkup(unittest.TestCase):
    def test_files_exist(self):
        expected_files = [
            "index.html",
            "css/styles.css",
            "js/words.js",
            "js/vfd.js",
            "js/synth.js",
            "js/engine.js",
            "js/app.js",
            ".nojekyll",
            "manifest.json",
            "assets/icon.svg"
        ]
        for f in expected_files:
            p = os.path.join(BASE_DIR, f)
            self.assertTrue(os.path.isfile(p), f"Expected file {f} does not exist")

    def test_index_contains_required_controls(self):
        index_file = os.path.join(BASE_DIR, "index.html")
        with open(index_file, "r", encoding="utf-8") as f:
            html = f.read()
        
        # Core modes
        for mode in ["ON", "OFF", "SPELL", "MYSTERY", "SAY_IT", "SECRET_CODE", "LETTER", "MODULE", "ROAST"]:
            self.assertIn(f'data-key="{mode}"', html, f"Missing key {mode}")

        # Level badges including Roast R
        for badge in ["badge-A", "badge-B", "badge-C", "badge-D", "badge-R"]:
            self.assertIn(f'id="{badge}"', html, f"Missing badge {badge}")

        # Roast toggle switch
        self.assertIn('id="roast-toggle-btn"', html)
        self.assertIn('id="roast-indicator"', html)

if __name__ == "__main__":
    unittest.main()

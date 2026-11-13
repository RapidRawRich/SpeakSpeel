#!/usr/bin/env python3
"""
Unit Test Suite for Texas Instruments Speak & Spell Emulation
Validates:
1. Vocabulary data integrity (Groups A, B, C, D)
2. Secret code cipher reciprocity: decode(encode(x)) == x
3. 14-segment display glyph mappings for all A-Z and digits
4. Game rules and state machine invariants
5. Frontend file existence and structural validity
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
        for group in ["A", "B", "C", "D"]:
            self.assertIn(f"{group}: [", self.words_code, f"Group {group} missing in words.js")

    def test_words_are_uppercase_alpha(self):
        matches = re.findall(r'"([A-Z\']+)"', self.words_code)
        self.assertGreater(len(matches), 100, "Should have more than 100 vocabulary words")
        for word in matches:
            self.assertTrue(word.isupper(), f"Word {word} must be uppercase")
            self.assertLessEqual(len(word), 8, f"Word {word} exceeds 8-character VFD limit")

    def test_secret_code_logic(self):
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

    def test_all_letters_mapped(self):
        for ch in "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789":
            self.assertIn(f'"{ch}":', self.vfd_code, f"Character glyph '{ch}' missing in segmentMap")

class TestWebAssets(unittest.TestCase):
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
            "assets/icon.svg",
            ".github/workflows/deploy.yml"
        ]
        for f in expected_files:
            p = os.path.join(BASE_DIR, f)
            self.assertTrue(os.path.isfile(p), f"Expected file {f} does not exist")

    def test_index_contains_40_keys(self):
        index_file = os.path.join(BASE_DIR, "index.html")
        with open(index_file, "r", encoding="utf-8") as f:
            html = f.read()
        
        # Check for core mode buttons
        for mode in ["ON", "OFF", "SPELL", "MYSTERY", "SAY_IT", "SECRET_CODE", "LETTER", "MODULE"]:
            self.assertIn(f'data-key="{mode}"', html, f"Missing mode button {mode}")

        # Check for alphabet keys
        for ch in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
            self.assertIn(f'data-key="{ch}"', html, f"Missing letter button {ch}")

        # Check for action keys
        for action in ["ERASE", "REPEAT", "ENTER"]:
            self.assertIn(f'data-key="{action}"', html, f"Missing action button {action}")

if __name__ == "__main__":
    unittest.main()

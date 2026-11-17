#!/usr/bin/env python3
"""
Automated Headless Chrome UI & DOM Test Runner
Launches real headless Google Chrome, runs the interactive browser DOM test suite (test_ui_runner.html),
validates all button clicks, VFD segment lighting, roast mode toggles, and captures proof screenshots.
"""

import subprocess
import os
import sys
import time
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TEST_HTML = os.path.join(BASE_DIR, "test_ui_runner.html")
NORMAL_SCREENSHOT = os.path.join(BASE_DIR, "assets", "screenshot_normal.png")
ROAST_SCREENSHOT = os.path.join(BASE_DIR, "assets", "screenshot_roast.png")

def run_headless_ui_tests():
    print("============================================================")
    print(" Executing Real Headless Chrome DOM & UI Test Suite")
    print("============================================================")

    if not os.path.exists(CHROME_PATH):
        print(f"Error: Google Chrome not found at {CHROME_PATH}")
        sys.exit(1)

    url = f"file://{TEST_HTML}"

    # Command to run Chrome headless with virtual time budget and dump DOM output
    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--allow-file-access-from-files",
        "--virtual-time-budget=6000",
        f"--screenshot={NORMAL_SCREENSHOT}",
        "--window-size=1000,1200",
        "--dump-dom",
        url
    ]

    print(f"Launching Chrome against {url}...")
    start_time = time.time()
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    elapsed = time.time() - start_time
    print(f"Execution finished in {elapsed:.2f}s (Exit code: {proc.returncode})")

    dom = proc.stdout
    
    # Parse log lines from dumped DOM
    log_matches = re.findall(r'<div class="(pass|fail)">([^<]+)</div>', dom)
    
    if not log_matches:
        print("Warning: No test divs found in DOM. Inspecting raw output...")
        print(proc.stderr[:1000])
        print(dom[:1000])
        sys.exit(1)

    print("\n--- UI TEST EXECUTION LOGS ---")
    pass_count = 0
    fail_count = 0

    for status, line in log_matches:
        if status == "pass":
            pass_count += 1
            print(f"  {line}")
        else:
            fail_count += 1
            print(f"  FAILED: {line}")

    print("------------------------------------------------------------")
    print(f"Total UI Tests: {pass_count + fail_count} | Passed: {pass_count} | Failed: {fail_count}")

    if os.path.exists(NORMAL_SCREENSHOT):
        size_kb = os.path.getsize(NORMAL_SCREENSHOT) / 1024
        print(f"UI Proof Screenshot saved: {NORMAL_SCREENSHOT} ({size_kb:.1f} KB)")

    if fail_count > 0:
        print("UI TEST SUITE FAILED!")
        sys.exit(1)
    else:
        print("ALL HEADLESS CHROME UI TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_headless_ui_tests()

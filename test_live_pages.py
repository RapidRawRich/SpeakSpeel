import subprocess
import os
import sys
import time

CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
LIVE_URL = "https://rapidrawrich.github.io/SpeakSpeel/"
SCREENSHOT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "screenshot_live_pages.png")

cmd = [
    CHROME_PATH,
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--user-data-dir=/tmp/chrome_live_test",
    f"--screenshot={SCREENSHOT_PATH}",
    "--window-size=1200,1000",
    "--dump-dom",
    LIVE_URL
]

print(f"Testing live deployment at {LIVE_URL} with real Chrome...")
proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
print(f"Exit code: {proc.returncode}")

dom = proc.stdout
print(f"DOM length fetched: {len(dom)} bytes")

# Check essential DOM elements on the live site
checks = [
    ("vfd-container", "VFD container present"),
    ("Speak &amp; Spell", "Header branding present"),
    ("roast-toggle-btn", "Roast Mode button present"),
    ("voice-engine-select", "Voice Engine selector present"),
    ("data-key=\"ON\"", "ON key button present"),
    ("data-key=\"SPELL\"", "SPELL key button present")
]

all_passed = True
for needle, desc in checks:
    if needle in dom:
        print(f"  ✓ PASS: {desc}")
    else:
        print(f"  ✗ FAIL: {desc}")
        all_passed = False

if os.path.exists(SCREENSHOT_PATH):
    size_kb = os.path.getsize(SCREENSHOT_PATH) / 1024
    print(f"Live Screenshot captured: {SCREENSHOT_PATH} ({size_kb:.1f} KB)")

if not all_passed:
    sys.exit(1)
print("\nLIVE GITHUB PAGES SITE VERIFIED WORKING 100%!")

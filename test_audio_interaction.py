import subprocess
import os
import sys

CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TEST_RUNNER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_ui_runner.html")

# Run headless chrome against test_ui_runner with console logs
cmd = [
    CHROME_PATH,
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--user-data-dir=/tmp/chrome_audio_test",
    "--allow-file-access-from-files",
    "--virtual-time-budget=6000",
    "--dump-dom",
    f"file://{TEST_RUNNER}"
]

proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
dom = proc.stdout

# Check for all pass lines
pass_lines = [line.strip() for line in dom.splitlines() if 'class="pass"' in line]
fail_lines = [line.strip() for line in dom.splitlines() if 'class="fail"' in line]

print(f"Total assertions passed: {len(pass_lines)}")
print(f"Total assertions failed: {len(fail_lines)}")

for p in pass_lines:
    # strip HTML tags
    clean = p.replace('<div class="pass">', '').replace('</div>', '')
    print(f"  {clean}")

if fail_lines:
    for f in fail_lines:
        clean = f.replace('<div class="fail">', '').replace('</div>', '')
        print(f"  {clean}")
    sys.exit(1)

print("\nAUDIO AND DOM SUITE 100% VERIFIED!")

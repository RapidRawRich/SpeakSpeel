#!/usr/bin/env python3
"""
Lightweight HTTP Server for Texas Instruments Speak & Spell (1978)
Zero external dependencies. Serves HTML, CSS, JS, SVG assets with proper MIME types.
"""

import http.server
import socketserver
import os
import sys

DEFAULT_PORT = 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class SpeakSpellHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        # Enable caching headers and CORS
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

def run_server(port=DEFAULT_PORT):
    # Try preferred port, or increment if busy
    for attempt_port in range(port, port + 20):
        try:
            with socketserver.TCPServer(("", attempt_port), SpeakSpellHTTPHandler) as httpd:
                print(f"============================================================")
                print(f" Texas Instruments Speak & Spell (1978) Web Emulator")
                print(f" Server running at: http://localhost:{attempt_port}")
                print(f" Directory: {BASE_DIR}")
                print(f" Press Ctrl+C to stop.")
                print(f"============================================================")
                sys.stdout.flush()
                httpd.serve_forever()
                return
        except OSError:
            continue
    print(f"Error: Could not bind to any port in range {port}-{port+20}")
    sys.exit(1)

if __name__ == "__main__":
    p = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PORT
    try:
        run_server(p)
    except KeyboardInterrupt:
        print("\nShutting down server.")

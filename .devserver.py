#!/usr/bin/env python3
"""Local-only static server for QA verification. Disables caching so edits
are always reflected immediately. Not part of the shipped site."""
import http.server
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Clear-Site-Data", '"cache"')
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8877
    http.server.test(HandlerClass=NoCacheHandler, port=port)

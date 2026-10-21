"""Static file server plus a /dl/<slug>/<file> download endpoint.

Serves index.html and media/ like `python -m http.server`, and additionally
streams any dataset media file with Content-Disposition: attachment - local
mirror files first, otherwise proxied from the Skillry CDN. This gives the
page real "download mp4" buttons without a desktop shell.

    python scripts/serve.py [port]     # default 8791
"""
import json
import re
import sys
import urllib.request
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent.parent
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 Chrome/130.0 Safari/537.36"}

FILE_KIND = {
    "poster.webp": "poster",
    "remake_poster.webp": "remake_poster",
    "card.mp4": "card",
    "remake_card.mp4": "remake_card",
    "original.mp4": "original",
    "remake.mp4": "remake",
}
SLUG_RE = re.compile(r"[\w-]+")

ENTRIES = {v["slug"]: v for v in json.loads(
    (ROOT / "data/videos.enriched.json").read_text(encoding="utf-8"))}


DIST = ROOT / "web" / "dist"
DIST_INDEX = DIST / "index.html"


class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        p = unquote(urlparse(path).path)
        if DIST_INDEX.exists() and not p.startswith(("/media/", "/data/")):
            cand = DIST / p.lstrip("/")
            if cand.is_file():
                return str(cand)
            root_cand = ROOT / p.lstrip("/")
            if p not in ("/", "") and root_cand.is_file():
                return str(root_cand)
            return str(DIST_INDEX)
        return str(ROOT / p.lstrip("/"))

    def do_HEAD(self):
        path = unquote(urlparse(self.path).path)
        m = re.fullmatch(r"/dl/([\w-]+)/([\w.-]+)", path)
        if path.rstrip("/") == "/dl/ping":
            self.send_response(204)
            self.end_headers()
        elif m:
            self.serve_download(m.group(1), m.group(2), head=True)
        else:
            super().do_HEAD()

    def do_GET(self):
        path = unquote(urlparse(self.path).path)
        m = re.fullmatch(r"/dl/([\w-]+)/([\w.-]+)", path)
        if path.rstrip("/") == "/dl/ping":
            self.send_response(204)
            self.end_headers()
        elif m:
            self.serve_download(m.group(1), m.group(2))
        else:
            super().do_GET()

    def serve_download(self, slug, fname, head=False):
        if not SLUG_RE.fullmatch(slug) or fname not in FILE_KIND:
            self.send_error(404)
            return
        local = ROOT / "media" / slug / fname
        if local.exists():
            self.send_headers(slug, fname, local.stat().st_size)
            if not head:
                self.stream(open(local, "rb"))
            return
        entry = ENTRIES.get(slug)
        url = entry and entry["urls"].get(FILE_KIND[fname])
        if not url:
            self.send_error(404)
            return
        try:
            req = urllib.request.Request(
                url, method="HEAD" if head else "GET", headers=UA)
            resp = urllib.request.urlopen(req, timeout=120)
        except Exception:
            self.send_error(502, "upstream fetch failed")
            return
        self.send_headers(slug, fname,
                          int(resp.headers.get("Content-Length") or 0))
        if not head:
            self.stream(resp)

    def send_headers(self, slug, fname, length):
        ctype = "video/mp4" if fname.endswith(".mp4") else "image/webp"
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        if length:
            self.send_header("Content-Length", str(length))
        self.send_header("Content-Disposition",
                         f'attachment; filename="{slug}-{fname}"')
        self.end_headers()

    def stream(self, source):
        try:
            with source:
                while chunk := source.read(1 << 16):
                    self.wfile.write(chunk)
        except (BrokenPipeError, ConnectionResetError):
            pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8791
    server = ThreadingHTTPServer(
        ("127.0.0.1", port), partial(Handler, directory=str(ROOT)))
    print(f"serving {ROOT} on http://localhost:{port} (Ctrl+C to stop)")
    server.serve_forever()

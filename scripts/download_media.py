"""Mirror Skillry media into ./media so the site and local archive work offline.

Downloads poster.webps, card previews, and full original/remake mp4s for each
entry in data/videos.enriched.json. Resumable: existing files with matching
size are skipped. Writes media/local-manifest.js so index.html can prefer
local files.

Usage:
    python scripts/download_media.py                 # everything
    python scripts/download_media.py --kinds original poster
    python scripts/download_media.py --limit 20      # first N entries
"""
import argparse
import json
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MEDIA = ROOT / "media"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 Chrome/130.0 Safari/537.36"}

KIND_FILES = {
    "poster": "poster.webp",
    "remake_poster": "remake_poster.webp",
    "card": "card.mp4",
    "remake_card": "remake_card.mp4",
    "original": "original.mp4",
    "remake": "remake.mp4",
}


def fetch_one(slug, kind, url, dest):
    if dest.exists():
        try:
            req = urllib.request.Request(url, method="HEAD", headers=UA)
            remote_len = int(urllib.request.urlopen(req, timeout=15)
                             .headers.get("Content-Length") or 0)
            if remote_len and dest.stat().st_size == remote_len:
                return slug, kind, "skip"
        except Exception:
            if dest.stat().st_size > 0:
                return slug, kind, "skip"
    tmp = dest.with_suffix(dest.suffix + ".part")
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=120) as r, open(tmp, "wb") as f:
        while chunk := r.read(1 << 20):
            f.write(chunk)
    tmp.rename(dest)
    return slug, kind, "ok"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--kinds", nargs="*", default=list(KIND_FILES),
                    choices=list(KIND_FILES))
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--workers", type=int, default=8)
    args = ap.parse_args()

    entries = json.loads(
        (ROOT / "data/videos.enriched.json").read_text(encoding="utf-8"))
    if args.limit:
        entries = entries[:args.limit]

    tasks = []
    for v in entries:
        for kind in args.kinds:
            url = v["urls"].get(kind)
            if not url:
                continue
            dest = MEDIA / v["slug"] / KIND_FILES[kind]
            tasks.append((v["slug"], kind, url, dest))

    print(f"{len(tasks)} files to check/download")
    manifest = {}
    done = fail = 0
    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        futs = {}
        for slug, kind, url, dest in tasks:
            dest.parent.mkdir(parents=True, exist_ok=True)
            futs[ex.submit(fetch_one, slug, kind, url, dest)] = (slug, kind)
        for fut in as_completed(futs):
            slug, kind = futs[fut]
            try:
                s, k, status = fut.result()
                manifest.setdefault(s, {})[k] = KIND_FILES[k]
                done += 1
                if done % 50 == 0:
                    print(f"  {done}/{len(tasks)} ({fail} failed)", flush=True)
            except Exception as e:
                fail += 1
                print(f"  FAIL {slug} {kind}: {e}", flush=True)

    # Include files already on disk from previous runs.
    for d in MEDIA.iterdir() if MEDIA.exists() else []:
        if not d.is_dir():
            continue
        for kind, fname in KIND_FILES.items():
            if (d / fname).exists():
                manifest.setdefault(d.name, {})[kind] = fname

    (MEDIA / "local-manifest.js").write_text(
        "window.LOCAL_MEDIA = " + json.dumps(manifest) + ";\n",
        encoding="utf-8")
    (MEDIA / "local-manifest.json").write_text(
        json.dumps(manifest), encoding="utf-8")
    print(f"done: {done} ok/skipped, {fail} failed, "
          f"{len(manifest)} slugs in manifest")
    sys.exit(1 if fail else 0)


if __name__ == "__main__":
    main()

"""Merge the awesome-opus5-5-videos dataset with scraped Skillry media URLs.

Reads data/videos.json (upstream dataset) and data/media_urls.json
(scraped card-preview URLs from skillry.dev), writes data/videos.enriched.json
and data.js (window.OPUS_DATA) consumed by index.html.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CDN = "https://media.skillry.dev/opus-5-5/"

videos = json.loads((ROOT / "data/videos.json").read_text(encoding="utf-8"))
media = json.loads((ROOT / "data/media_urls.json").read_text(encoding="utf-8"))

entries = []
for v in videos:
    slug = v["slug"]
    files = media.get(slug, [])

    def pick(prefix):
        return next((CDN + slug + "/" + f for f in files if f.startswith(prefix)), None)

    urls = {
        "poster": v["poster_url"],
        # Full-length files use hashless names; only present for remade entries.
        "original": CDN + slug + "/original.mp4" if v["has_remake"] else None,
        "remake": CDN + slug + "/remake.mp4" if v["has_remake"] else None,
        # Card previews and the remake poster carry a content hash; scraped.
        "card": pick("original-card"),
        "remake_card": pick("remake-card"),
        "remake_poster": pick("remake."),
    }
    entries.append({
        "slug": slug,
        "title": v.get("title"),
        "author": v["author"],
        "author_url": v["author_url"],
        "post_url": v["post_url"],
        "category": v["category"],
        "tech": v["tech_tags"],
        "prompt": v["prompt"],
        "prompt_partial": v["prompt_partial"],
        "added": v["added"],
        "has_remake": v["has_remake"],
        "urls": urls,
    })

(ROOT / "data/videos.enriched.json").write_text(
    json.dumps(entries, ensure_ascii=False, indent=1), encoding="utf-8")
(ROOT / "data.js").write_text(
    "window.OPUS_DATA = " + json.dumps(entries, ensure_ascii=False) + ";\n",
    encoding="utf-8")
print(f"{len(entries)} entries -> data.js, data/videos.enriched.json")

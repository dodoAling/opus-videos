"""Translate prompt/title fields into zh and write data/videos.zh.json.

Uses the local Argos Translate en->zh model (no network, no key).
Resumable: existing slugs in the output file are skipped.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'data' / 'videos.enriched.json'
DST = ROOT / 'data' / 'videos.zh.json'

from argostranslate import translate


def main() -> None:
    entries = json.loads(SRC.read_text(encoding='utf-8'))
    out = {}
    if DST.exists():
        out = json.loads(DST.read_text(encoding='utf-8'))

    todo = [e for e in entries if e['slug'] not in out]
    print(f'total {len(entries)}, done {len(out)}, todo {len(todo)}', flush=True)

    for i, e in enumerate(todo, 1):
        rec = {}
        try:
            if e.get('title'):
                rec['title_zh'] = translate.translate(e['title'], 'en', 'zh')
            if e.get('prompt'):
                rec['prompt_zh'] = translate.translate(e['prompt'], 'en', 'zh')
        except Exception as ex:
            print(f"  [{i}/{len(todo)}] FAIL {e['slug']}: {ex}", flush=True)
            continue
        out[e['slug']] = rec
        if i % 20 == 0 or i == len(todo):
            DST.write_text(json.dumps(out, ensure_ascii=False, indent=1),
                           encoding='utf-8')
            print(f'  [{i}/{len(todo)}] saved, last {e["slug"]}', flush=True)

    DST.write_text(json.dumps(out, ensure_ascii=False, indent=1),
                   encoding='utf-8')
    print(f'done -> {DST} ({len(out)} entries)')


if __name__ == '__main__':
    sys.exit(main())

import type { Entry, Manifest, MediaKind } from './types';

export const KIND_FILE: Record<MediaKind, string> = {
  poster: 'poster.webp',
  remake_poster: 'remake_poster.webp',
  card: 'card.mp4',
  remake_card: 'remake_card.mp4',
  original: 'original.mp4',
  remake: 'remake.mp4',
};

export async function loadData(): Promise<{ entries: Entry[]; manifest: Manifest }> {
  const [entries, manifest] = await Promise.all([
    fetch('data/videos.enriched.json').then(r => {
      if (!r.ok) throw new Error('数据集加载失败：' + r.status);
      return r.json() as Promise<Entry[]>;
    }),
    fetch('media/local-manifest.json')
      .then(r => (r.ok ? (r.json() as Promise<Manifest>) : {}))
      .catch(() => ({})),
  ]);
  return { entries, manifest };
}

/**
 * serve.py 的 /dl 下载代理探测结果：命中时下载按钮直接存盘，
 * 否则退回本地文件或远程地址。
 */
export let DL_BASE: string | null = null;
export function probeDl() {
  fetch('dl/ping', { method: 'HEAD' })
    .then(r => { if (r.status === 204) DL_BASE = 'dl/'; })
    .catch(() => {});
}

export function mediaSrc(v: Entry, manifest: Manifest, kind: MediaKind): string | null {
  const local = manifest[v.slug];
  if (local && local[kind]) return 'media/' + v.slug + '/' + KIND_FILE[kind];
  return v.urls[kind];
}

export function dlHref(v: Entry, manifest: Manifest, kind: MediaKind): string | null {
  if (DL_BASE) return DL_BASE + v.slug + '/' + KIND_FILE[kind];
  return mediaSrc(v, manifest, kind);
}

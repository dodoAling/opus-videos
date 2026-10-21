import { useCallback, useState } from 'react';

export type Lang = 'zh' | 'en';

const zh = {
  brand: 'Opus 素材库',
  libSection: '库',
  allItems: '全部素材',
  catSection: '分类',
  techSection: '技术',
  exportOps: '导出运营状态',
  searchPh: '搜索 prompt / 作者 / slug…',
  countsTpl: '{n} 条 · {v} 条含视频',
  onlyVideo: '仅看视频',
  onlyFull: '仅完整 prompt',
  sortNew: '最新收录',
  sortOld: '最早收录',
  dense: '紧凑',
  cozy: '舒适',
  exportFiltered: '导出筛选 JSON',
  copyPrompt: '复制 prompt',
  details: '详情',
  badgeLocal: '本地',
  badgeNoVideo: '仅原帖',
  tipMarkPick: '标为备选',
  tipDownload: '下载视频',
  original: '原版',
  remake: '重制版',
  fullscreen: '全屏',
  dlMp4: '下载 mp4',
  prevTip: '上一条 ←',
  nextTip: '下一条 →',
  closeTip: '关闭',
  noHosted: '此条目无托管视频，请到原帖观看。',
  partialNote: '注：作者只公开了部分 prompt',
  copyShare: '复制分享文案',
  cover: '封面',
  origPost: '原帖',
  notePh: '备注：改编思路、拟发布账号、文案草稿…',
  metaSlug: 'slug',
  metaAdded: '收录',
  metaTech: '技术',
  shareTpl: '{title}作者 {author} 用 Claude Opus 5.5 生成的代码动画\n\nPrompt：{prompt}\n\n原帖：{post}',
  loadFail: '数据加载失败',
  loadFailHint: '若直接双击打开了页面，请先运行 python scripts/serve.py 再访问 http://localhost:8791。',
  retry: '重试',
  emptyTitle: '没有匹配的素材',
  emptyHint: '试试放宽筛选或换个关键词。',
  queueTitle: '下载队列',
  queueClear: '清空',
  qDl: '下载中',
  qDone: '完成',
  qErr: '失败',
  qWait: '等待',
  toastCopied: 'prompt 已复制',
  toastShare: '分享文案已复制',
  toastNoFile: '该条目没有可下载文件',
  toastOpened: '已在新标签打开，Ctrl+S 保存',
  toastQueued: '已加入下载队列',
  toastUnpick: '已取消备选',
  toastPick: '已加入备选',
  toastExported: '已导出 {n} 条',
  toastCopyFail: '复制失败，请手动复制',
};

const en: Record<keyof typeof zh, string> = {
  brand: 'Opus Vault',
  libSection: 'LIBRARY',
  allItems: 'All videos',
  catSection: 'CATEGORY',
  techSection: 'TECH',
  exportOps: 'Export ops state',
  searchPh: 'Search prompt / author / slug…',
  countsTpl: '{n} items · {v} with video',
  onlyVideo: 'Has video',
  onlyFull: 'Full prompt',
  sortNew: 'Newest',
  sortOld: 'Oldest',
  dense: 'Compact',
  cozy: 'Comfort',
  exportFiltered: 'Export filtered JSON',
  copyPrompt: 'Copy prompt',
  details: 'Details',
  badgeLocal: 'Local',
  badgeNoVideo: 'Post only',
  tipMarkPick: 'Mark as picked',
  tipDownload: 'Download video',
  original: 'Original',
  remake: 'Remake',
  fullscreen: 'Fullscreen',
  dlMp4: 'Download mp4',
  prevTip: 'Previous ←',
  nextTip: 'Next →',
  closeTip: 'Close',
  noHosted: 'No hosted video for this entry — watch it on the original post.',
  partialNote: 'Note: the author only shared part of the prompt.',
  copyShare: 'Copy share text',
  cover: 'Cover',
  origPost: 'Post',
  notePh: 'Notes: adaptation ideas, target account, caption draft…',
  metaSlug: 'slug',
  metaAdded: 'added',
  metaTech: 'tech',
  shareTpl: '{title}AI-coded animation by {author}, made with Claude Opus 5.5\n\nPrompt: {prompt}\n\nPost: {post}',
  loadFail: 'Failed to load data',
  loadFailHint: 'If you opened the page via file://, run python scripts/serve.py and visit http://localhost:8791.',
  retry: 'Retry',
  emptyTitle: 'No matching items',
  emptyHint: 'Loosen the filters or try another keyword.',
  queueTitle: 'Download queue',
  queueClear: 'Clear',
  qDl: 'Downloading',
  qDone: 'Done',
  qErr: 'Failed',
  qWait: 'Queued',
  toastCopied: 'Prompt copied',
  toastShare: 'Share text copied',
  toastNoFile: 'No downloadable file for this entry',
  toastOpened: 'Opened in a new tab — press Ctrl+S to save',
  toastQueued: 'Added to download queue',
  toastUnpick: 'Removed from picks',
  toastPick: 'Added to picks',
  toastExported: 'Exported {n} items',
  toastCopyFail: 'Copy failed — please copy manually',
};

const dicts: Record<Lang, Record<keyof typeof zh, string>> = { zh, en };

export type StrKey = keyof typeof zh;
export type TFunc = (k: StrKey, vars?: Record<string, string | number>) => string;

export function useLang() {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('opus-lang');
    if (saved === 'zh' || saved === 'en') return saved;
    return navigator.language.startsWith('zh') ? 'zh' : 'en';
  });
  const setLang = useCallback((l: Lang) => {
    localStorage.setItem('opus-lang', l);
    setLangState(l);
  }, []);
  const t = useCallback<TFunc>((key, vars) => {
    let s = dicts[lang][key];
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
    return s;
  }, [lang]);
  return { lang, setLang, t };
}

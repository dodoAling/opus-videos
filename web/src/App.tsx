import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Film } from 'lucide-react';
import { DL_BASE, KIND_FILE, dlHref, loadData, probeDl } from './api';
import DetailModal from './components/DetailModal';
import QueuePanel from './components/QueuePanel';
import Rail from './components/Rail';
import TopBar from './components/TopBar';
import VideoCard from './components/VideoCard';
import { useLang } from './i18n';
import { useOps } from './ops';
import type { Entry, Manifest, MediaKind, OpsStatus, QueueItem } from './types';
import { toast } from './ui';

type View = 'all' | OpsStatus;
const PAGE = 48;

export default function App() {
  const { lang, setLang, t } = useLang();
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [manifest, setManifest] = useState<Manifest>({});
  const [error, setError] = useState('');
  const { ops, setStatus, setNote, exportOps } = useOps();

  const [view, setView] = useState<View>('all');
  const [cats, setCats] = useState<Set<string>>(new Set());
  const [techs, setTechs] = useState<Set<string>>(new Set());
  const [q, setQ] = useState('');
  const [onlyVideo, setOnlyVideo] = useState(false);
  const [onlyFull, setOnlyFull] = useState(false);
  const [sort, setSort] = useState<'new' | 'old'>('new');
  const [dense, setDense] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [qOpen, setQOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const sentinelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    setError('');
    loadData()
      .then(({ entries, manifest }) => { setEntries(entries); setManifest(manifest); })
      .catch(e => setError(e.message));
  }, []);

  useEffect(() => {
    load();
    probeDl();
    const h = (e: Event) => setToastMsg((e as CustomEvent).detail);
    window.addEventListener('app-toast', h);
    return () => window.removeEventListener('app-toast', h);
  }, [load]);

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = t('brand');
  }, [lang, t]);

  useEffect(() => {
    if (!toastMsg) return;
    const tm = setTimeout(() => setToastMsg(''), 1800);
    return () => clearTimeout(tm);
  }, [toastMsg]);

  const toggle = (set: Set<string>) => (k: string) => {
    const next = new Set(set);
    next.has(k) ? next.delete(k) : next.add(k);
    return next;
  };
  const toggleCat = (c: string) => setCats(toggle(cats)(c));
  const toggleTech = (tg: string) => setTechs(toggle(techs)(tg));

  const filtered = useMemo(() => {
    if (!entries) return [];
    const needle = q.trim().toLowerCase();
    const list = entries.filter(v => {
      if (view !== 'all' && ops[v.slug]?.status !== view) return false;
      if (cats.size && !cats.has(v.category)) return false;
      if (techs.size && !v.tech.some(tg => techs.has(tg))) return false;
      if (onlyVideo && !v.has_remake) return false;
      if (onlyFull && v.prompt_partial) return false;
      if (needle) {
        const hay = `${v.prompt} ${v.prompt_zh || ''} ${v.author} ${v.slug} ${v.title || ''} ${v.title_zh || ''}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    list.sort((a, b) => sort === 'new' ? b.added.localeCompare(a.added) : a.added.localeCompare(b.added));
    return list;
  }, [entries, ops, view, cats, techs, q, onlyVideo, onlyFull, sort]);

  useEffect(() => { setShown(PAGE); }, [view, cats, techs, q, onlyVideo, onlyFull, sort]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(es => {
      if (es[0].isIntersecting) setShown(s => s + PAGE);
    });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  const enqueue = useCallback((v: Entry, kind: MediaKind) => {
    const href = dlHref(v, manifest, kind);
    const fname = `${v.slug}-${KIND_FILE[kind]}`;
    if (!href) { toast(t('toastNoFile')); return; }
    if (!DL_BASE && /^https?:/.test(href)) {
      window.open(href, '_blank');
      toast(t('toastOpened'));
      return;
    }
    setQueue(qq => [...qq, { slug: v.slug, kind, fname, href, state: 'wait' }]);
    toast(t('toastQueued'));
  }, [manifest, t]);

  useEffect(() => {
    const item = queue.find(i => i.state === 'wait');
    if (!item || queue.some(i => i.state === 'dl')) return;
    setQueue(qq => qq.map(i => i === item ? { ...i, state: 'dl' } : i));
    (async () => {
      try {
        const r = await fetch(item.href);
        if (!r.ok) throw new Error(String(r.status));
        const blob = await r.blob();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = item.fname;
        a.click();
        URL.revokeObjectURL(a.href);
        setQueue(qq => qq.map(i => i === item ? { ...i, state: 'done' } : i));
      } catch {
        setQueue(qq => qq.map(i => i === item ? { ...i, state: 'err' } : i));
      }
    })();
  }, [queue]);

  const markPick = useCallback((v: Entry) => {
    const cur = ops[v.slug]?.status;
    setStatus(v.slug, cur === 'pick' ? undefined : 'pick');
    toast(t(cur === 'pick' ? 'toastUnpick' : 'toastPick'));
  }, [ops, setStatus, t]);

  const onExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(filtered, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `opus-videos-${filtered.length}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast(t('toastExported', { n: filtered.length }));
  }, [filtered, t]);

  const openEntry = openIdx != null ? filtered[openIdx] : null;
  const navModal = useCallback((dir: 1 | -1) => {
    setOpenIdx(i => i == null ? i : (i + dir + filtered.length) % filtered.length);
  }, [filtered.length]);

  const videoCount = useMemo(() => filtered.filter(v => v.has_remake).length, [filtered]);

  return (
    <div className="shell">
      <Rail entries={entries || []} ops={ops} view={view} setView={setView}
        cats={cats} toggleCat={toggleCat} techs={techs} toggleTech={toggleTech}
        exportOps={exportOps} lang={lang} t={t} />

      <div className="main">
        <TopBar q={q} setQ={setQ} total={filtered.length}
          videoCount={videoCount}
          onlyVideo={onlyVideo} setOnlyVideo={setOnlyVideo}
          onlyFull={onlyFull} setOnlyFull={setOnlyFull}
          sort={sort} setSort={setSort} dense={dense} setDense={setDense}
          onExport={onExport} lang={lang} setLang={setLang} t={t} />

        {error && (
          <div className="center-state">
            <AlertTriangle size={36} />
            <h2>{t('loadFail')}</h2>
            <p>{error}. {t('loadFailHint')}</p>
            <button className="btn" onClick={load}>{t('retry')}</button>
          </div>
        )}
        {!error && !entries && (
          <div className="grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div className="skel-card" key={i}>
                <div className="skel m" />
                <div className="skel l" />
                <div className="skel l short" />
              </div>
            ))}
          </div>
        )}
        {!error && entries && filtered.length === 0 && (
          <div className="center-state">
            <Film size={36} />
            <h2>{t('emptyTitle')}</h2>
            <p>{t('emptyHint')}</p>
          </div>
        )}
        {entries && filtered.length > 0 && (
          <div className={`grid${dense ? ' dense' : ''}`}>
            {filtered.slice(0, shown).map(v => (
              <VideoCard key={v.slug} v={v} manifest={manifest}
                status={ops[v.slug]?.status}
                onOpen={() => setOpenIdx(filtered.indexOf(v))}
                onMark={() => markPick(v)}
                onDownload={() => enqueue(v, v.urls.original ? 'original' : 'card')}
                lang={lang} t={t} />
            ))}
          </div>
        )}
        <div ref={sentinelRef} style={{ height: 1 }} />
      </div>

      {openEntry && (
        <DetailModal v={openEntry} manifest={manifest}
          status={ops[openEntry.slug]?.status}
          note={ops[openEntry.slug]?.note || ''}
          onStatus={s => setStatus(openEntry.slug, s)}
          onNote={n => setNote(openEntry.slug, n)}
          onDownload={kind => enqueue(openEntry, kind)}
          onClose={() => setOpenIdx(null)}
          onNav={navModal} idx={openIdx!} total={filtered.length}
          lang={lang} t={t} />
      )}

      <QueuePanel items={queue} open={qOpen} setOpen={setQOpen}
        clear={() => setQueue(qq => qq.filter(i => i.state === 'wait' || i.state === 'dl'))} t={t} />
      <div className={`toast${toastMsg ? ' show' : ''}`}>{toastMsg}</div>
    </div>
  );
}

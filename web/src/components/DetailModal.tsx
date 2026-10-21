import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Bookmark, CheckCircle2, ChevronLeft, ChevronRight, CircleSlash, Copy, Download, Maximize2, Share2, X } from 'lucide-react';
import { mediaSrc } from '../api';
import type { Lang, TFunc } from '../i18n';
import { catLabel, statusLabel, techLabel } from '../labels';
import type { Entry, Manifest, MediaKind, OpsStatus } from '../types';
import { copyText } from '../ui';

type Props = {
  v: Entry;
  manifest: Manifest;
  status?: OpsStatus;
  note: string;
  onNote: (s: string) => void;
  onStatus: (s?: OpsStatus) => void;
  onClose: () => void;
  onNav: (dir: 1 | -1) => void;
  onDownload: (kind: MediaKind) => void;
  idx: number;
  total: number;
  lang: Lang;
  t: TFunc;
};

function VidPane({ v, which, label, manifest, t }: {
  v: Entry; which: 'original' | 'remake'; label: string; manifest: Manifest; t: TFunc;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const full = () => {
    const el = ref.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };
  return (
    <figure>
      <div className="vwrap">
        <video ref={ref} src={mediaSrc(v, manifest, which) || ''}
          controls playsInline preload="metadata"
          onDoubleClick={full} />
      </div>
      <figcaption>
        {label}
        <span className="cap-actions">
          <button className="btn" onClick={full}><Maximize2 size={13} />{t('fullscreen')}</button>
        </span>
      </figcaption>
    </figure>
  );
}

export default function DetailModal(p: Props) {
  const { v, t } = p;
  const dlg = useRef<HTMLDialogElement>(null);
  const [cd, setCd] = useState(0);
  const hasZh = !!v.prompt_zh || !!v.title_zh;
  const [zhMode, setZhMode] = useState(p.lang === 'zh' && hasZh);

  useEffect(() => { dlg.current?.showModal(); }, []);
  useEffect(() => { setZhMode(p.lang === 'zh' && hasZh); }, [v.slug]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') p.onNav(-1);
      if (e.key === 'ArrowRight') p.onNav(1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [p.onNav]);

  const promptShown = zhMode && v.prompt_zh ? v.prompt_zh : v.prompt;
  const titleShown = zhMode && v.title_zh ? v.title_zh : v.title;
  const shareText = () =>
    t('shareTpl', {
      title: titleShown ? titleShown + '\n\n' : '',
      author: '@' + v.author,
      prompt: promptShown,
      post: v.post_url,
    });

  const dlable = (['original', 'remake', 'poster'] as MediaKind[]).filter(k => v.urls[k]);
  const both = v.urls.original && v.urls.remake;

  const stBtn = (s: OpsStatus, icon: ReactNode) => (
    <button className={p.status === s ? 'on-' + s : ''}
      onClick={() => p.onStatus(p.status === s ? undefined : s)}>
      {icon}{statusLabel(s, p.lang)}
    </button>
  );

  return (
    <dialog ref={dlg} onClose={p.onClose}
      onClick={e => { if (e.target === dlg.current) p.onClose(); }}>
      <div className="modal">
        <div className="mhead">
          <span className="who">{titleShown || '@' + v.author}</span>
          <div className="navbtns">
            <span className="idx">{p.idx + 1} / {p.total}</span>
            <button className="xbtn" title={t('prevTip')} onClick={() => p.onNav(-1)}><ChevronLeft size={15} /></button>
            <button className="xbtn" title={t('nextTip')} onClick={() => p.onNav(1)}><ChevronRight size={15} /></button>
            <button className="xbtn" title={t('closeTip')} onClick={p.onClose}><X size={15} /></button>
          </div>
        </div>

        <div className="mbody">
          <div className={`videos${both ? ' two' : ''}`}>
            {v.urls.original && <VidPane v={v} which="original" label={`${t('original')} · @${v.author}`} manifest={p.manifest} t={t} />}
            {v.urls.remake && <VidPane v={v} which="remake" label={t('remake')} manifest={p.manifest} t={t} />}
            {!v.urls.original && !v.urls.remake && (
              <figure>
                <div className="vwrap">
                  <img src={mediaSrc(v, p.manifest, 'poster') || ''} alt="" />
                </div>
                <figcaption>{t('noHosted')}</figcaption>
              </figure>
            )}
          </div>

          {hasZh && (
            <div className="mrow" style={{ marginBottom: -2 }}>
              <span className={`ptoggle sm${zhMode ? ' on' : ''}`} onClick={() => setZhMode(true)}>{t('viewZh')}</span>
              <span className={`ptoggle sm${!zhMode ? ' on' : ''}`} onClick={() => setZhMode(false)}>{t('viewOrig')}</span>
              <span className="mt-hint">{t('mtHint')}</span>
            </div>
          )}
          <div className="pblock">{promptShown}</div>
          {v.prompt_partial && <div className="pnote">{t('partialNote')}</div>}

          <div className="mrow">
            <span className="seg">
              {stBtn('pick', <Bookmark size={13} />)}
              {stBtn('posted', <CheckCircle2 size={13} />)}
              {stBtn('skip', <CircleSlash size={13} />)}
            </span>
            <button className="btn" onClick={() => copyText(promptShown, t('toastCopied'), t('toastCopyFail'))}><Copy size={13} />{t('copyPrompt')}</button>
            <button className="btn" onClick={() => copyText(shareText(), t('toastShare'), t('toastCopyFail'))}><Share2 size={13} />{t('copyShare')}</button>
            {dlable.length > 0 && (
              <button className="btn"
                onClick={() => { dlable.forEach(k => p.onDownload(k)); setCd(8); setTimeout(() => setCd(0), 8000); }}>
                <Download size={13} />{t('dlMp4')}{cd ? `(${cd})` : ''}
              </button>
            )}
            <a className="btn" href={v.post_url} target="_blank" rel="noopener"><Share2 size={13} />{t('origPost')}</a>
          </div>

          <textarea className="note" placeholder={t('notePh')}
            value={p.note} onChange={e => p.onNote(e.target.value)} />

          <div className="mmeta">
            <a href={v.author_url} target="_blank" rel="noopener">@{v.author}</a>
            <span className="cat">{catLabel(v.category, p.lang)}</span>
            <span>{v.tech.map(tg => techLabel(tg, p.lang)).join(' · ')}</span>
            <span>{t('metaSlug')}: {v.slug}</span>
            <span>{t('metaAdded')}: {v.added}</span>
          </div>
        </div>
      </div>
    </dialog>
  );
}

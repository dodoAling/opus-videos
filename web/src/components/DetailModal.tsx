import { useEffect, useRef } from 'react';
import { Bookmark, CheckCircle2, ChevronLeft, ChevronRight, CircleSlash, Copy, Download, ExternalLink, Maximize2, X } from 'lucide-react';
import { dlHref, mediaSrc } from '../api';
import { CAT_LABELS, STATUS_LABELS, TECH_LABELS } from '../labels';
import type { Entry, Manifest, OpsStatus } from '../types';
import { copyText } from '../ui';

type Props = {
  v: Entry;
  manifest: Manifest;
  status?: OpsStatus;
  note: string;
  setStatus: (s?: OpsStatus) => void;
  setNote: (n: string) => void;
  onDownload: (kind: 'original' | 'remake' | 'poster') => void;
  onClose: () => void;
  onNav: (dir: 1 | -1) => void;
  idx: number;
  total: number;
};

function fsToggle(vid: HTMLVideoElement) {
  if (document.fullscreenElement) document.exitFullscreen();
  else if (vid.requestFullscreen) vid.requestFullscreen();
  else (vid as any).webkitEnterFullscreen?.();
}

export default function DetailModal({ v, manifest, status, note, setStatus, setNote, onDownload, onClose, onNav, idx, total }: Props) {
  const dlgRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dlgRef.current;
    if (d && !d.open) d.showModal();
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onNav(-1);
      if (e.key === 'ArrowRight') onNav(1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onNav]);

  const shareText =
    `${v.title ? v.title + '\n' : ''}作者 @${v.author} 用 Claude Opus 5.5 生成的代码动画\n\n` +
    `Prompt：${v.prompt}\n\n原帖：${v.post_url}`;

  const fig = (kind: 'original' | 'remake', label: string, posterKind: 'poster' | 'remake_poster', autoplay: boolean) => {
    const src = mediaSrc(v, manifest, kind);
    if (!src) return null;
    const poster = mediaSrc(v, manifest, posterKind);
    return (
      <figure>
        <div className="vwrap">
          <video src={src} controls muted loop playsInline
            autoPlay={autoplay} poster={poster || undefined}
            onDoubleClick={e => fsToggle(e.currentTarget)} />
        </div>
        <figcaption>
          {label}
          <span className="cap-actions">
            <button className="btn" onClick={e =>
              fsToggle(e.currentTarget.closest('figure')!.querySelector('video')!)}>
              <Maximize2 size={12} />全屏
            </button>
            <a className="btn" href={dlHref(v, manifest, kind) || '#'}
              onClick={e => { e.preventDefault(); onDownload(kind); }}>
              <Download size={12} />下载 mp4
            </a>
          </span>
        </figcaption>
      </figure>
    );
  };

  const figs = [
    fig('original', `原版 · @${v.author}`, 'poster', true),
    fig('remake', '重制版 · skillry', 'remake_poster', false),
  ].filter(Boolean);

  return (
    <dialog ref={dlgRef} onClose={onClose}
      onClick={e => { if (e.target === dlgRef.current) dlgRef.current.close(); }}>
      <div className="modal">
        <div className="mhead">
          <a className="who" href={v.author_url} target="_blank" rel="noopener">@{v.author}</a>
          <span className="cat">{CAT_LABELS[v.category] || v.category}</span>
          <div className="navbtns">
            <span className="idx">{idx + 1} / {total}</span>
            <button className="xbtn" onClick={() => onNav(-1)} title="上一条 ←"><ChevronLeft size={17} /></button>
            <button className="xbtn" onClick={() => onNav(1)} title="下一条 →"><ChevronRight size={17} /></button>
            <button className="xbtn" onClick={() => dlgRef.current?.close()} title="关闭"><X size={18} /></button>
          </div>
        </div>
        <div className="mbody">
          {figs.length > 0
            ? <div className={`videos${figs.length > 1 ? ' two' : ''}`}>{figs}</div>
            : <div className="center-state" style={{ padding: '40px 20px' }}>
                <p>此条目无托管视频，请到原帖观看。</p>
              </div>}

          <div className="pblock">{v.prompt}</div>
          {v.prompt_partial && <div className="pnote">注：作者只公开了部分 prompt</div>}

          <div className="mrow">
            <div className="seg">
              <button className={status === 'pick' ? 'on-pick' : ''}
                onClick={() => setStatus(status === 'pick' ? undefined : 'pick')}>
                <Bookmark size={12} style={{ verticalAlign: -2, marginRight: 4 }} />备选
              </button>
              <button className={status === 'posted' ? 'on-posted' : ''}
                onClick={() => setStatus(status === 'posted' ? undefined : 'posted')}>
                <CheckCircle2 size={12} style={{ verticalAlign: -2, marginRight: 4 }} />已发
              </button>
              <button className={status === 'skip' ? 'on-skip' : ''}
                onClick={() => setStatus(status === 'skip' ? undefined : 'skip')}>
                <CircleSlash size={12} style={{ verticalAlign: -2, marginRight: 4 }} />跳过
              </button>
            </div>
            <button className="btn gold" onClick={() => copyText(v.prompt, 'prompt 已复制')}>
              <Copy size={13} />复制 prompt
            </button>
            <button className="btn" onClick={() => copyText(shareText, '分享文案已复制')}>复制分享文案</button>
            {v.urls.poster && (
              <button className="btn" onClick={() => onDownload('poster')}>
                <Download size={13} />封面
              </button>
            )}
            <a className="btn" href={v.post_url} target="_blank" rel="noopener">
              原帖<ExternalLink size={12} />
            </a>
          </div>

          <textarea className="note" placeholder="备注：改编思路、拟发布账号、文案草稿…"
            value={note} onChange={e => setNote(e.target.value)} />

          <div className="mmeta">
            <span>slug {v.slug}</span>
            <span>收录 {v.added}</span>
            <span>技术 {v.tech.map(t => TECH_LABELS[t] || t).join(' · ')}</span>
            <a href={`https://skillry.dev/ai-videos/opus-5-5/${v.slug}`} target="_blank" rel="noopener">Skillry 页面</a>
          </div>
        </div>
      </div>
    </dialog>
  );
}

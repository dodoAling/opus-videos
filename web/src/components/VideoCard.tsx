import { memo, useRef } from 'react';
import { Bookmark, Copy, Download, HardDrive, Play } from 'lucide-react';
import { mediaSrc } from '../api';
import type { Lang, TFunc } from '../i18n';
import { catLabel, statusLabel, techLabel } from '../labels';
import type { Entry, Manifest, OpsStatus } from '../types';
import { copyText } from '../ui';

type Props = {
  v: Entry;
  manifest: Manifest;
  status?: OpsStatus;
  onOpen: () => void;
  onMark: () => void;
  onDownload: () => void;
  lang: Lang;
  t: TFunc;
};

export default memo(function VideoCard({ v, manifest, status, onOpen, onMark, onDownload, lang, t }: Props) {
  const vidRef = useRef<HTMLVideoElement>(null);
  const preview: 'card' | 'remake_card' | null = v.urls.card ? 'card' : v.urls.remake_card ? 'remake_card' : null;
  const local = !!manifest[v.slug];

  const enter = () => { vidRef.current?.play().catch(() => {}); };
  const leave = () => {
    const vid = vidRef.current;
    if (vid) { vid.pause(); vid.currentTime = 0; }
  };

  return (
    <div className="card">
      <div className="media" onMouseEnter={enter} onMouseLeave={leave} onClick={onOpen}>
        <img src={mediaSrc(v, manifest, 'poster') || ''} loading="lazy" alt="" />
        {preview && (
          <video ref={vidRef} src={mediaSrc(v, manifest, preview) || ''}
            muted loop playsInline preload="none" />
        )}
        {preview && <span className="play-glyph"><Play size={17} fill="currentColor" /></span>}
        <span className="badges">
          {local && <span className="badge local"><HardDrive size={10} style={{ marginRight: 3, verticalAlign: -1 }} />{t('badgeLocal')}</span>}
          {!v.has_remake && <span className="badge novid">{t('badgeNoVideo')}</span>}
        </span>
        {status && <span className={`ribbon ${status}`}>{statusLabel(status, lang)}</span>}
      </div>
      <div className="cbody">
        <div className="prompt">{v.prompt}</div>
        <div className="meta">
          <a className="author" href={v.author_url} target="_blank" rel="noopener">@{v.author}</a>
          <span className="cat">{catLabel(v.category, lang)}</span>
          <span className="techs">{v.tech.slice(0, 3).map(tg => techLabel(tg, lang)).join(' · ')}</span>
          <span className="date">{v.added}</span>
        </div>
        <div className="cactions">
          <button className="ibtn grow" onClick={() => copyText(v.prompt, t('toastCopied'), t('toastCopyFail'))}>
            <Copy size={13} />{t('copyPrompt')}
          </button>
          <button className={`ibtn${status === 'pick' ? ' marked' : ''}`} title={t('tipMarkPick')} onClick={onMark}>
            <Bookmark size={13} />
          </button>
          <button className="ibtn" title={t('tipDownload')} onClick={onDownload} disabled={!v.urls.original && !v.urls.remake}>
            <Download size={13} />
          </button>
          <button className="ibtn" onClick={onOpen}>{t('details')}</button>
        </div>
      </div>
    </div>
  );
});

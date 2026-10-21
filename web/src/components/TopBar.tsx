import { LayoutGrid, Rows3, Search } from 'lucide-react';
import type { Lang, TFunc } from '../i18n';

type Props = {
  q: string;
  setQ: (s: string) => void;
  total: number;
  videoCount: number;
  onlyVideo: boolean;
  setOnlyVideo: (b: boolean) => void;
  onlyFull: boolean;
  setOnlyFull: (b: boolean) => void;
  sort: 'new' | 'old';
  setSort: (s: 'new' | 'old') => void;
  dense: boolean;
  setDense: (b: boolean) => void;
  onExport: () => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: TFunc;
};

export default function TopBar(p: Props) {
  const t = p.t;
  return (
    <div className="topbar">
      <label className="search">
        <Search size={15} />
        <input value={p.q} onChange={e => p.setQ(e.target.value)}
          placeholder={t('searchPh')} />
      </label>
      <span className="counts">{t('countsTpl', { n: p.total, v: p.videoCount })}</span>
      <span style={{ flex: 1 }} />
      <span className={`ptoggle${p.onlyVideo ? ' on' : ''}`}
        onClick={() => p.setOnlyVideo(!p.onlyVideo)}>{t('onlyVideo')}</span>
      <span className={`ptoggle${p.onlyFull ? ' on' : ''}`}
        onClick={() => p.setOnlyFull(!p.onlyFull)}>{t('onlyFull')}</span>
      <select className="sel" value={p.sort} onChange={e => p.setSort(e.target.value as 'new' | 'old')}>
        <option value="new">{t('sortNew')}</option>
        <option value="old">{t('sortOld')}</option>
      </select>
      <span className={`ptoggle${p.dense ? ' on' : ''}`}
        onClick={() => p.setDense(!p.dense)}>
        {p.dense ? <LayoutGrid size={14} /> : <Rows3 size={14} />}
        {p.dense ? t('dense') : t('cozy')}
      </span>
      <span className="ptoggle" onClick={() => p.setLang(p.lang === 'zh' ? 'en' : 'zh')}>
        {p.lang === 'zh' ? 'EN' : '中文'}
      </span>
      <button className="btn" onClick={p.onExport}>{t('exportFiltered')}</button>
    </div>
  );
}

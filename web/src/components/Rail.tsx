import type { ReactNode } from 'react';
import { Bookmark, CheckCircle2, CircleSlash, Clapperboard, LayoutGrid } from 'lucide-react';
import type { Lang, TFunc } from '../i18n';
import { catLabel, statusLabel, techLabel } from '../labels';
import type { Entry, Ops, OpsStatus } from '../types';

type View = 'all' | OpsStatus;

type Props = {
  entries: Entry[];
  ops: Ops;
  view: View;
  setView: (v: View) => void;
  cats: Set<string>;
  toggleCat: (c: string) => void;
  techs: Set<string>;
  toggleTech: (t: string) => void;
  exportOps: () => void;
  lang: Lang;
  t: TFunc;
};

export default function Rail({ entries, ops, view, setView, cats, toggleCat, techs, toggleTech, exportOps, lang, t }: Props) {
  const catCount: Record<string, number> = {};
  const techCount: Record<string, number> = {};
  const statusCount: Record<OpsStatus, number> = { pick: 0, posted: 0, skip: 0 };
  for (const v of entries) {
    catCount[v.category] = (catCount[v.category] || 0) + 1;
    v.tech.forEach(tg => { techCount[tg] = (techCount[tg] || 0) + 1; });
    const s = ops[v.slug]?.status;
    if (s) statusCount[s]++;
  }
  const techList = Object.keys(techCount).sort((a, b) => techCount[b] - techCount[a]);

  const navItem = (v: View, icon: ReactNode, label: string, cnt: number) => (
    <div className={`nav-item${view === v ? ' on' : ''}`} onClick={() => setView(v)}>
      {icon}{label}<span className="cnt">{cnt}</span>
    </div>
  );

  return (
    <aside className="rail">
      <div className="brand"><Clapperboard size={21} />{t('brand')}</div>

      <div className="rail-sec">
        <h3>{t('libSection')}</h3>
        <div className="nav">
          {navItem('all', <LayoutGrid size={16} />, t('allItems'), entries.length)}
          {navItem('pick', <><Bookmark size={16} /><span className="dot pick" /></>, statusLabel('pick', lang), statusCount.pick)}
          {navItem('posted', <><CheckCircle2 size={16} /><span className="dot posted" /></>, statusLabel('posted', lang), statusCount.posted)}
          {navItem('skip', <><CircleSlash size={16} /><span className="dot skip" /></>, statusLabel('skip', lang), statusCount.skip)}
        </div>
      </div>

      <div className="rail-sec">
        <h3>{t('catSection')}</h3>
        <div className="nav">
          {Object.keys(catCount).sort().map(c => (
            <div key={c}
              className={`nav-item${cats.has(c) ? ' on' : ''}`}
              onClick={() => toggleCat(c)}>
              {catLabel(c, lang)}<span className="cnt">{catCount[c]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rail-sec">
        <h3>{t('techSection')}</h3>
        <div className="chip-cloud">
          {techList.map(tg => (
            <span key={tg}
              className={`tchip${techs.has(tg) ? ' on' : ''}`}
              onClick={() => toggleTech(tg)}>
              {techLabel(tg, lang)} <span className="n">{techCount[tg]}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="rail-foot">
        <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={exportOps}>
          {t('exportOps')}
        </button>
      </div>
    </aside>
  );
}

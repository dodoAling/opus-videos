import { Bookmark, CheckCircle2, CircleSlash, Clapperboard, LayoutGrid } from 'lucide-react';
import { CAT_LABELS, STATUS_LABELS, TECH_LABELS } from '../labels';
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
};

export default function Rail({ entries, ops, view, setView, cats, toggleCat, techs, toggleTech, exportOps }: Props) {
  const catCount: Record<string, number> = {};
  const techCount: Record<string, number> = {};
  const statusCount: Record<string, number> = { pick: 0, posted: 0, skip: 0 };
  for (const v of entries) {
    catCount[v.category] = (catCount[v.category] || 0) + 1;
    v.tech.forEach(t => { techCount[t] = (techCount[t] || 0) + 1; });
    const s = ops[v.slug]?.status;
    if (s) statusCount[s]++;
  }
  const techList = Object.keys(techCount).sort((a, b) => techCount[b] - techCount[a]);

  const navItem = (v: View, icon: React.ReactNode, label: string, cnt: number) => (
    <div className={`nav-item${view === v ? ' on' : ''}`} onClick={() => setView(v)}>
      {icon}{label}<span className="cnt">{cnt}</span>
    </div>
  );

  return (
    <aside className="rail">
      <div className="brand"><Clapperboard size={21} />Opus 素材库</div>

      <div className="rail-sec">
        <h3>库</h3>
        <div className="nav">
          {navItem('all', <LayoutGrid size={16} />, '全部素材', entries.length)}
          {navItem('pick', <><Bookmark size={16} /><span className="dot pick" /></>, STATUS_LABELS.pick, statusCount.pick)}
          {navItem('posted', <><CheckCircle2 size={16} /><span className="dot posted" /></>, STATUS_LABELS.posted, statusCount.posted)}
          {navItem('skip', <><CircleSlash size={16} /><span className="dot skip" /></>, STATUS_LABELS.skip, statusCount.skip)}
        </div>
      </div>

      <div className="rail-sec">
        <h3>分类</h3>
        <div className="nav">
          {Object.entries(CAT_LABELS).map(([c, label]) => (
            <div key={c}
              className={`nav-item${cats.has(c) ? ' on' : ''}`}
              onClick={() => toggleCat(c)}>
              {label}<span className="cnt">{catCount[c] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rail-sec">
        <h3>技术</h3>
        <div className="chip-cloud">
          {techList.map(t => (
            <span key={t}
              className={`tchip${techs.has(t) ? ' on' : ''}`}
              onClick={() => toggleTech(t)}>
              {TECH_LABELS[t] || t} <span className="n">{techCount[t]}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="rail-foot">
        <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={exportOps}>
          导出运营状态
        </button>
      </div>
    </aside>
  );
}

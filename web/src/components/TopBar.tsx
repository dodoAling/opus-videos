import { LayoutGrid, Rows3, Search } from 'lucide-react';

type Props = {
  q: string;
  setQ: (s: string) => void;
  total: number;
  shown: number;
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
};

export default function TopBar(p: Props) {
  return (
    <div className="topbar">
      <label className="search">
        <Search size={15} />
        <input value={p.q} onChange={e => p.setQ(e.target.value)}
          placeholder="搜索 prompt / 作者 / slug…" />
      </label>
      <span className="counts"><b>{p.total}</b> 条 · {p.videoCount} 条含视频</span>
      <span style={{ flex: 1 }} />
      <span className={`ptoggle${p.onlyVideo ? ' on' : ''}`}
        onClick={() => p.setOnlyVideo(!p.onlyVideo)}>仅看视频</span>
      <span className={`ptoggle${p.onlyFull ? ' on' : ''}`}
        onClick={() => p.setOnlyFull(!p.onlyFull)}>仅完整 prompt</span>
      <select className="sel" value={p.sort} onChange={e => p.setSort(e.target.value as 'new' | 'old')}>
        <option value="new">最新收录</option>
        <option value="old">最早收录</option>
      </select>
      <span className={`ptoggle${p.dense ? ' on' : ''}`} title="切换密度"
        onClick={() => p.setDense(!p.dense)}>
        {p.dense ? <LayoutGrid size={14} /> : <Rows3 size={14} />}
        {p.dense ? '紧凑' : '舒适'}
      </span>
      <button className="btn" onClick={p.onExport}>导出筛选 JSON</button>
    </div>
  );
}

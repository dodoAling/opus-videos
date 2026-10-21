import { Check, Download, Loader2, X, XCircle } from 'lucide-react';
import type { QueueItem } from '../types';

export default function QueuePanel({ items, clear }: { items: QueueItem[]; clear: () => void }) {
  if (!items.length) return null;
  const pending = items.filter(i => i.state === 'wait' || i.state === 'dl').length;
  return (
    <div className="queue">
      <h4>
        <Download size={14} />下载队列
        {pending === 0 && (
          <button className="xbtn" style={{ marginLeft: 'auto' }} onClick={clear} title="清空">
            <X size={14} />
          </button>
        )}
      </h4>
      {items.slice(-8).map((i, k) => (
        <div key={k} className={`qitem ${i.state}`}>
          {i.state === 'dl' && <Loader2 size={12} className="spin" />}
          {i.state === 'done' && <Check size={12} />}
          {i.state === 'err' && <XCircle size={12} />}
          {i.state === 'wait' && <span className="st">··</span>}
          <span className="fn">{i.fname}</span>
          <span className="st">
            {i.state === 'dl' ? '下载中' : i.state === 'done' ? '完成' : i.state === 'err' ? '失败' : '等待'}
          </span>
        </div>
      ))}
    </div>
  );
}

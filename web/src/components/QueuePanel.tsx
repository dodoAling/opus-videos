import { CheckCircle2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import type { TFunc } from '../i18n';
import type { QueueItem } from '../types';

type Props = {
  items: QueueItem[];
  open: boolean;
  setOpen: (b: boolean) => void;
  clear: () => void;
  t: TFunc;
};

const STATE_KEY = { wait: 'qWait', dl: 'qDl', done: 'qDone', err: 'qErr' } as const;

export default function QueuePanel({ items, open, setOpen, clear, t }: Props) {
  if (!items.length) return null;
  const active = items.filter(i => i.state === 'dl' || i.state === 'wait').length;
  return (
    <div className="queue">
      <h4 style={{ cursor: 'pointer' }} onClick={() => setOpen(!open)}>
        {active ? <Loader2 size={14} className="spin" /> : <CheckCircle2 size={14} />}
        {t('queueTitle')} · {items.length}
        <span style={{ marginLeft: 'auto', display: 'inline-flex' }}>
          {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </span>
      </h4>
      {open && (
        <>
          {items.map((it, i) => (
            <div key={i} className={`qitem ${it.state}`}>
              <span className="fn">{it.fname}</span>
              <span className="st">{t(STATE_KEY[it.state])}</span>
            </div>
          ))}
          <div className="mrow" style={{ marginTop: 8 }}>
            <button className="btn" onClick={clear}>{t('queueClear')}</button>
          </div>
        </>
      )}
    </div>
  );
}

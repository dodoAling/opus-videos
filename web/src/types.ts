export type MediaKind =
  | 'poster' | 'remake_poster' | 'card' | 'remake_card' | 'original' | 'remake';

export type Entry = {
  slug: string;
  title?: string;
  author: string;
  author_url: string;
  post_url: string;
  category: string;
  tech: string[];
  prompt: string;
  prompt_partial: boolean;
  /** scripts/translate_data.py 产出的中文字段，无翻译数据时不存在。 */
  prompt_zh?: string;
  title_zh?: string;
  added: string;
  has_remake: boolean;
  urls: Record<MediaKind, string | null>;
};

/** slug -> 本地已镜像的文件名表，来自 media/local-manifest.json。 */
export type Manifest = Record<string, Partial<Record<MediaKind, string>>>;

export type OpsStatus = 'pick' | 'posted' | 'skip';

/** slug -> 运营状态与备注，localStorage 持久化，可导出。 */
export type Ops = Record<string, { status?: OpsStatus; note?: string; ts?: number }>;

export type QueueItem = {
  slug: string;
  kind: MediaKind;
  fname: string;
  href: string;
  state: 'wait' | 'dl' | 'done' | 'err';
};

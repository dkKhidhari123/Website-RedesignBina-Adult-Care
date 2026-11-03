import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { adminCall } from './api';
import type { CmsContent, CmsKey } from '../lib/cms';
import { currentContent } from './defaults';

interface Row {
  value: unknown;
  updated_at: string;
  updated_by: string;
}
interface Meta {
  lastPublishedAt?: string;
  lastPublishedBy?: string;
}

interface ContentState {
  loading: boolean;
  error: string;
  /** Saved value for a section, or what the live site currently shows if never saved. */
  get: <K extends CmsKey>(key: K) => NonNullable<CmsContent[K]>;
  updatedAt: (key: CmsKey) => string | undefined;
  save: <K extends CmsKey>(key: K, value: NonNullable<CmsContent[K]>) => Promise<void>;
  meta: Meta;
  hasUnpublished: boolean;
  publish: () => Promise<void>;
}

const Ctx = createContext<ContentState | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminCall<{ content: Record<string, Row> }>('getContent')
      .then((r) => setRows(r.content))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const meta = (rows.meta?.value ?? {}) as Meta;

  const get = useCallback(
    <K extends CmsKey>(key: K) => (rows[key]?.value as NonNullable<CmsContent[K]>) ?? currentContent[key],
    [rows],
  );

  const save = useCallback(async <K extends CmsKey>(key: K, value: NonNullable<CmsContent[K]>) => {
    const r = await adminCall<{ value: unknown }>('saveContent', { key, value });
    setRows((prev) => ({ ...prev, [key]: { value: r.value, updated_at: new Date().toISOString(), updated_by: '' } }));
  }, []);

  const publish = useCallback(async () => {
    const r = await adminCall<{ meta: Meta }>('publish');
    setRows((prev) => ({ ...prev, meta: { value: r.meta, updated_at: new Date().toISOString(), updated_by: '' } }));
  }, []);

  const hasUnpublished = useMemo(() => {
    const last = meta.lastPublishedAt ? Date.parse(meta.lastPublishedAt) : 0;
    return Object.entries(rows).some(([k, r]) => k !== 'meta' && Date.parse(r.updated_at) > last);
  }, [rows, meta.lastPublishedAt]);

  return (
    <Ctx.Provider value={{ loading, error, get, updatedAt: (k) => rows[k]?.updated_at, save, meta, hasUnpublished, publish }}>
      {children}
    </Ctx.Provider>
  );
}

export function useContent() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useContent must be used inside ContentProvider');
  return v;
}

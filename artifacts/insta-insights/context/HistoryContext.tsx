import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AnalyzedLink, InsightsData } from '@/types/insights';
import { createAnalyzedLink, normalizeLink } from '@/utils/analytics';
import { loadJson, saveJson } from '@/utils/storage';

interface HistoryContextValue {
  links: AnalyzedLink[];
  isReady: boolean;
  analyze: (url: string) => AnalyzedLink;
  getLink: (id: string) => AnalyzedLink | undefined;
  updateField: (id: string, updater: (data: InsightsData) => InsightsData) => void;
  setPreviewUri: (id: string, uri: string) => void;
  removeLink: (id: string) => void;
  clearAll: () => void;
}

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [links, setLinks] = useState<AnalyzedLink[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await loadJson<AnalyzedLink[]>([]);
      setLinks(stored.map(normalizeLink));
      setIsReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    saveJson(links);
  }, [links, isReady]);

  const value = useMemo<HistoryContextValue>(
    () => ({
      links,
      isReady,
      analyze: (url: string) => {
        const existing = links.find((l) => l.url.trim() === url.trim());
        if (existing) {
          setLinks((prev) => [existing, ...prev.filter((l) => l.id !== existing.id)]);
          return existing;
        }
        const created = createAnalyzedLink(url);
        setLinks((prev) => [created, ...prev]);
        return created;
      },
      getLink: (id: string) => links.find((l) => l.id === id),
      updateField: (id: string, updater: (data: InsightsData) => InsightsData) => {
        setLinks((prev) =>
          prev.map((l) => (l.id === id ? { ...l, data: updater(l.data) } : l))
        );
      },
      setPreviewUri: (id: string, uri: string) => {
        setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, previewUri: uri } : l)));
      },
      removeLink: (id: string) => {
        setLinks((prev) => prev.filter((l) => l.id !== id));
      },
      clearAll: () => setLinks([]),
    }),
    [links, isReady]
  );

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used within HistoryProvider');
  return ctx;
}

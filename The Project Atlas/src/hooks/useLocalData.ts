import { useEffect, useState } from "react";

export function useLocalData(seed: any) {
  const KEY = "aka_data_v2";
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return seed;
  });
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {} }, [data]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase()==="k") {
        e.preventDefault();
        const el = document.querySelector('input[placeholder="Search topics…"]') as HTMLInputElement;
        if (el) el.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        const btn = document.querySelector('header button') as HTMLButtonElement;
        btn?.click();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase()===',') { // ⌘, open settings
        e.preventDefault();
        // This would need to be handled by the parent component
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return [data, setData] as const;
}
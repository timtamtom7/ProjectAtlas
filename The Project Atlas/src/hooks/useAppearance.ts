import { useEffect, useState } from "react";

export function useAppearance(key: string, initial: any) {
  const [val, setVal] = useState(() => {
    try { const raw = localStorage.getItem(key); if (raw) return JSON.parse(raw);} catch {}
    return initial;
  });
  useEffect(()=>{ try{ localStorage.setItem(key, JSON.stringify(val)); } catch {} }, [key, val]);
  return [val, setVal] as const;
}
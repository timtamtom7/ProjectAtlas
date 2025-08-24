import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Ancient Knowledge Atlas utilities
export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
export const uniq = (arr: any[]) => Array.from(new Set(arr));
export const cls = (...xs: any[]) => xs.filter(Boolean).join(" ");
export const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

export function flatten(categories: any[]) {
  const arr: any[] = [];
  for (const c of categories) for (const t of c.topics) arr.push({ ...t, catId: c.id, catName: c.name });
  return arr;
}

export function toggleTag(tag: string, selected: string[], setSelected: (tags: string[]) => void) {
  if (selected.includes(tag)) setSelected(selected.filter(t=>t!==tag));
  else setSelected([...selected, tag]);
}

export function ticks(a: number, b: number) {
  // naive tick generator for BCE/CE mixed ranges
  const span = Math.abs(b - a);
  const step = pick([1000000,100000,10000,5000,2000,1000,500,200,100,50,20,10,5,2,1], (s: number)=> span/s <= 10);
  const start = Math.ceil(a/step)*step;
  const out = [];
  for (let x=start; x<=b; x+=step) out.push(x);
  return out;
}

function pick(arr: number[], ok: (s: number) => boolean){ for (const s of arr) if (ok(s)) return s; return arr[arr.length-1]; }

export function hexWithAlpha(hex: string, alpha: number) {
  // supports #rgb, #rrggbb
  const c = hex.replace('#','');
  const bigint = c.length===3 ? parseInt(c.split('').map(ch=>ch+ch).join(''),16) : parseInt(c,16);
  const r = (bigint>>16)&255, g=(bigint>>8)&255, b=bigint&255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

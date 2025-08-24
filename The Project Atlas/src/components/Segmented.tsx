import React from "react";
import { cls } from "../lib/utils";

interface SegmentedProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function Segmented({ value, onChange, options }: SegmentedProps) {
  return (
    <div className="inline-flex items-center rounded-2xl border p-1" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
      {options.map(opt => (
        <button key={opt.value} onClick={()=>onChange(opt.value)}
          className={cls("px-3 py-1.5 rounded-xl text-sm transition", value===opt.value?"text-white shadow-sm":"hover:bg-[var(--accent-weak)]")}
          style={ value===opt.value ? { background: "var(--accent)" } : {} }>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
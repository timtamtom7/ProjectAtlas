import React, { useState } from "react";
import { uniq } from "../lib/utils";

interface TagEditorProps {
  value: string[];
  options: string[];
  onChange: (tags: string[]) => void;
}

export function TagEditor({ value, options, onChange }: TagEditorProps) {
  const [input, setInput] = useState("");
  const add = (tag: string) => { const next = uniq([...(value||[]), tag]); onChange(next); setInput(""); };
  const remove = (tag: string) => onChange((value||[]).filter(t=>t!==tag));
  const filtered = options.filter(o => !value?.includes(o) && o.toLowerCase().includes(input.toLowerCase()));
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {(value||[]).map(tag => (
          <span key={tag} className="chip flex items-center gap-2">
            {tag}
            <button onClick={()=>remove(tag)} className="icon-link" title="Remove">×</button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Add tag…" className="input"/>
        <button onClick={()=> input && add(input)} className="btn">Add</button>
      </div>
      {filtered.length>0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {filtered.slice(0,12).map(opt => (
            <button key={opt} onClick={()=>add(opt)} className="chip">{opt}</button>
          ))}
        </div>
      )}
    </div>
  );
}
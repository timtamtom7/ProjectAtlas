import React from "react";
import { cls } from "../lib/utils";
import { ConfidenceDot } from "./ConfidenceDot";

interface TopicListProps {
  data: any[];
  visibleTopics: any[];
  selected: {catId: string, topicId: string} | null;
  setSelected: (selection: {catId: string, topicId: string}) => void;
}

export function TopicList({ data, visibleTopics, selected, setSelected }: TopicListProps) {
  return (
    <div className="card animate-in">
      <div className="card-head flex items-center gap-2">
        <span className="font-medium">{visibleTopics.length ? (selected?"Topics":"Topics") : "Topics"}</span>
        <span className="opacity-50">·</span>
        <span className="" style={{ color: "var(--muted)" }}>{visibleTopics.length} shown</span>
      </div>
      <div className="max-h-[75vh] overflow-auto p-2">
        {visibleTopics.map(t => (
          <button key={`${t.catId}-${t.id}`} onClick={()=>setSelected({ catId: t.catId, topicId: t.id })}
            className={cls("w-full text-left rounded-xl px-3 py-2 mb-1 transition", selected && selected.topicId===t.id && selected.catId===t.catId?"bg-[var(--accent)] text-white shadow-sm":"hover:bg-[var(--accent-weak)]")}
          >
            <div className="flex items-center justify-between">
              <div className="font-medium flex items-center gap-3">
                <ConfidenceDot value={t.confidence ?? 50} />
                {t.title}
              </div>
              <div className="flex flex-wrap gap-1 ml-3">
                {(t.tags||[]).slice(0,4).map((tag: string) => (
                  <span key={tag} className="chip small">{tag}</span>
                ))}
              </div>
            </div>
            <div className="text-xs" style={{ color: selected && selected.topicId===t.id? "#e5e7eb" : "var(--muted)" }}>{t.catName || (data.find((c: any)=>c.id===t.catId)?.name)}</div>
          </button>
        ))}
        {visibleTopics.length===0 && (
          <div className="p-6 text-center" style={{ color: "var(--muted)" }}>No topics match your filters.</div>
        )}
      </div>
    </div>
  );
}
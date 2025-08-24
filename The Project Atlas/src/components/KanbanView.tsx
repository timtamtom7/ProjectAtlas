import React, { useMemo } from "react";
import { flatten, uniq, cls } from "../lib/utils";
import { ConfidenceDot } from "./ConfidenceDot";

const ROLES = ["Evidence", "Hypothesis", "Method", "Debate", "Site", "Theory", "Spec", "Question", "Note"];

interface KanbanViewProps {
  data: any[];
  groupBy?: string;
  setSelected: (selection: {catId: string, topicId: string}) => void;
}

export function KanbanView({ data, groupBy = "role", setSelected }: KanbanViewProps) {
  const items = flatten(data);
  const groups = useMemo(() => {
    if (groupBy === "tag") {
      const all = uniq(items.flatMap((t: any)=>t.tags||[]));
      const obj = Object.fromEntries(all.map((t: string)=>[t, []]));
      for (const it of items) for (const tag of (it.tags||[])) obj[tag].push(it);
      return obj;
    } else {
      const keys = uniq(items.map((t: any)=>t.role || "Note")).sort((a,b)=>ROLES.indexOf(a)-ROLES.indexOf(b));
      const obj = Object.fromEntries(keys.map((k: string)=>[k, []]));
      for (const it of items) obj[it.role||"Note"].push(it);
      return obj;
    }
  }, [items, groupBy]);

  const cols = Object.keys(groups);

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cols.map(col => (
        <div key={col} className="card animate-in">
          <div className="card-head flex items-center justify-between">
            <span className="font-medium">{col}</span>
            <span className="text-xs" style={{ color: "var(--muted)" }}>{groups[col].length}</span>
          </div>
          <div className="p-2 max-h-[70vh] overflow-auto">
            {groups[col].map((t: any) => (
              <div key={t.id} className="rounded-xl border p-3 mb-2 hover:shadow-sm transition cursor-pointer"
                   style={{ borderColor: "var(--border)" }}
                   onClick={()=> setSelected({ catId: t.catId, topicId: t.id })}>
                <div className="flex items-center justify-between">
                  <div className="font-medium flex items-center gap-2"><ConfidenceDot value={t.confidence ?? 50} />{t.title}</div>
                  {t.year!=null && <span className="text-xs" style={{ color: "var(--muted)" }}>{t.year}</span>}
                </div>
                {(t.tags||[]).length>0 && (
                  <div className="mt-2 flex flex-wrap gap-1">{t.tags.slice(0,4).map((tag: string)=> <span key={tag} className="chip small">{tag}</span>)}</div>
                )}
              </div>
            ))}
            {groups[col].length===0 && <div className="p-3 text-sm" style={{ color: "var(--muted)" }}>—</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
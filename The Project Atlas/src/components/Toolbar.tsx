import React from "react";
import { Segmented } from "./Segmented";

interface ToolbarProps {
  view: string;
  setView: (view: string) => void;
  kanbanGroup: string;
  setKanbanGroup: (group: string) => void;
}

export function Toolbar({ view, setView, kanbanGroup, setKanbanGroup }: ToolbarProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-3">
      <div className="flex items-center gap-2">
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: "list", label: "List" },
            { value: "kanban", label: "Kanban" },
            { value: "timeline", label: "Timeline" },
            { value: "map", label: "Map" },
          ]}
        />
        {view==="kanban" && (
          <div className="ml-2 flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
            Group by
            <select className="input h-9" value={kanbanGroup} onChange={(e)=>setKanbanGroup(e.target.value)}>
              <option value="role">Role</option>
              <option value="tag">Tag</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
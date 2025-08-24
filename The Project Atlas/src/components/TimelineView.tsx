import React from "react";
import { flatten, ticks } from "../lib/utils";

interface TimelineViewProps {
  data: any[];
  setSelected: (selection: {catId: string, topicId: string}) => void;
  theme: string;
}

export function TimelineView({ data, setSelected, theme }: TimelineViewProps) {
  const items = flatten(data).filter((t: any) => typeof t.year === 'number');
  if (items.length === 0) {
    return <div className="card"><div className="p-6" style={{ color: "var(--muted)" }}>Add a numeric <b>Year</b> to topics to see them on the timeline.</div></div>;
  }
  const years = items.map((t: any)=>t.year);
  const min = Math.min(...years);
  const max = Math.max(...years);
  const pad = (max-min)*0.05 || 10;
  const domain = [min-pad, max+pad];
  const scaleX = (y: number, w: number) => ( (y - domain[0]) / (domain[1]-domain[0]) ) * w;

  return (
    <div className="card">
      <div className="card-head">Timeline</div>
      <div className="p-4">
        <svg viewBox="0 0 1000 220" className="w-full">
          {/* Axis */}
          <line x1="0" x2="1000" y1="180" y2="180" stroke="var(--border)" />
          {ticks(domain[0], domain[1]).map((t: number,i: number)=> (
            <g key={i} transform={`translate(${scaleX(t,1000)},0)`}>
              <line x1="0" y1="170" x2="0" y2="190" stroke="var(--border)" />
              <text y="205" textAnchor="middle" fontSize="10" fill="var(--muted)">{t}</text>
            </g>
          ))}
          {/* Items */}
          {items.sort((a: any,b: any)=>a.year-b.year).map((t: any,i: number)=>{
            const x = scaleX(t.year, 1000);
            const y = 150 - (i%5)*22; // simple stacking
            return (
              <g key={t.id} className="cursor-pointer" onClick={()=>setSelected({catId:t.catId, topicId:t.id})}>
                <circle cx={x} cy={178} r={4} fill="var(--accent)" />
                <line x1={x} y1={175} x2={x} y2={y+10} stroke="var(--border)" />
                <rect x={x-3} y={y-2} width={6} height={14} fill="var(--accent)" opacity="0.15" />
                <text x={x+6} y={y+8} fontSize="11" fill="var(--fg)">{t.title}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
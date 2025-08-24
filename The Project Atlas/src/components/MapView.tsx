import React from "react";
import { flatten } from "../lib/utils";

interface MapViewProps {
  data: any[];
  setSelected: (selection: {catId: string, topicId: string}) => void;
}

export function MapView({ data, setSelected }: MapViewProps) {
  const items = flatten(data).filter((t: any) => typeof t.lat === 'number' && typeof t.lng === 'number');
  if (items.length === 0) {
    return <div className="card"><div className="p-6" style={{ color: "var(--muted)" }}>Add <b>Coordinates</b> (lat, lng) to topics to see them on the map.</div></div>;
  }
  // Simple equirectangular projection onto an SVG box (not a geo basemap – minimalist dots)
  const W = 1000, H = 480;
  const projX = (lng: number) => ((lng + 180) / 360) * W;
  const projY = (lat: number) => ((90 - lat) / 180) * H;

  // light graticule
  const lats = [-60,-30,0,30,60];
  const lngs = [-120,-60,0,60,120,180];

  return (
    <div className="card">
      <div className="card-head">Map (abstract)</div>
      <div className="p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
          {/* Graticule */}
          {lats.map((la: number,i: number)=> <line key={i} x1={0} x2={W} y1={projY(la)} y2={projY(la)} stroke="var(--border)" opacity="0.4" />)}
          {lngs.map((lo: number,i: number)=> <line key={i} y1={0} y2={H} x1={projX(lo)} x2={projX(lo)} stroke="var(--border)" opacity="0.4" />)}
          {/* Points */}
          {items.map((t: any,i: number)=> (
            <g key={t.id} transform={`translate(${projX(t.lng)}, ${projY(t.lat)})`} className="cursor-pointer" onClick={()=>setSelected({catId:t.catId, topicId:t.id})}>
              <circle r="5" fill="var(--accent)" />
              <text x={8} y={4} fontSize="11" fill="var(--fg)">{t.title}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
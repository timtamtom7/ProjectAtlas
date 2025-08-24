import React, { useEffect, useState } from "react";
import { cls } from "../lib/utils";

interface SettingsSheetProps {
  theme: string;
  setTheme: (theme: string) => void;
  accent: string;
  setAccent: (accent: string) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
}

export function SettingsSheet({ theme, setTheme, accent, setAccent, showSettings, setShowSettings }: SettingsSheetProps) {
  return (
    <>
      {showSettings && (
        <div className="fixed inset-0 z-40" aria-modal>
          <div className="absolute inset-0 bg-black/30" onClick={()=>setShowSettings(false)} />
          <div className="absolute right-4 top-4 w-[360px] card animate-slide">
            <div className="card-head flex items-center justify-between">
              <span className="font-medium">Appearance</span>
              <button className="icon-link" onClick={()=>setShowSettings(false)}>✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="text-xs uppercase tracking-wide mb-1" style={{ color: "var(--muted)" }}>Theme</div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>setTheme("light")} className={cls("btn", theme==="light"?"btn-on":"")}>Light</button>
                  <button onClick={()=>setTheme("dark")}  className={cls("btn", theme==="dark"?"btn-on":"")}>Dark</button>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide mb-1" style={{ color: "var(--muted)" }}>Accent color</div>
                <div className="flex items-center gap-3">
                  <input type="color" value={accent} onChange={(e)=>setAccent(e.target.value)} />
                  <input className="input" value={accent} onChange={(e)=>setAccent(e.target.value)} />
                </div>
              </div>
              <p className="text-xs" style={{ color: "var(--muted)" }}>Your choices are saved locally.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
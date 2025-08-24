import React from "react";
import { clamp } from "../lib/utils";

interface ConfidenceBarProps {
  value: number;
}

export function ConfidenceBar({ value }: ConfidenceBarProps) {
  const v = clamp(value,0,100);
  return (
    <div className="h-2 w-full rounded-full" style={{ background: "var(--border)" }}>
      <div className="h-2 rounded-full" style={{ width: `${v}%`, background: "var(--accent)" }} />
    </div>
  );
}
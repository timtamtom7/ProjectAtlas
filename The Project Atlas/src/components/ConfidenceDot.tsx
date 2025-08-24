import React from "react";
import { clamp } from "../lib/utils";

interface ConfidenceDotProps {
  value: number;
}

export function ConfidenceDot({ value }: ConfidenceDotProps) {
  const v = clamp(value||50,0,100);
  const size = 8 + Math.round((v/100)*6);
  return <span className="inline-block rounded-full" style={{ width: size, height: size, background: "var(--accent)" }} />
}
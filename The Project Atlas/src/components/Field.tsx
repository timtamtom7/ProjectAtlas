import React from "react";

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

export function Field({ label, children }: FieldProps) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide mb-1" style={{ color: "var(--muted)" }}>{label}</div>
      {children}
    </div>
  );
}
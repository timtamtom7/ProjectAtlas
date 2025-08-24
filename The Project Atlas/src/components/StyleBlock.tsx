import React from "react";

export function StyleBlock() {
  // Shared atomic classes styled by CSS variables (theme + accent)
  return (
    <style>{`
      .card { border: 1px solid var(--border); background: var(--card); border-radius: 1rem; box-shadow: 0 1px 0 rgba(0,0,0,0.02); }
      .card-head { padding: 0.75rem; border-bottom: 1px solid var(--border); color: var(--muted); font-size: 0.875rem; }
      .btn { border: 1px solid var(--border); background: var(--card); padding: 0.5rem 0.75rem; border-radius: 0.75rem; transition: 150ms ease; }
      .btn:hover { background: var(--accent-weak); }
      .btn.subtle { background: transparent; }
      .btn-on { background: var(--accent); color: white; }
      .input { width: 100%; border: 1px solid var(--border); border-radius: 0.75rem; padding: 0.5rem 0.75rem; background: var(--card); color: var(--fg); }
      .chip { border: 1px solid var(--border); border-radius: 9999px; padding: 0.25rem 0.5rem; font-size: 0.875rem; background: var(--card); }
      .chip.small { font-size: 0.75rem; padding: 0.125rem 0.5rem; }
      .chip-on { background: var(--accent); color: white; border-color: transparent; }
      .icon-btn { position: absolute; right: 0.25rem; top: 50%; transform: translateY(-50%); padding: 0.25rem 0.5rem; border-radius: 0.5rem; }
      .icon-btn:hover { background: var(--accent-weak); }
      .icon-link { color: var(--muted); }
      .icon-link:hover { color: var(--fg); }
      .animate-in { animation: pop 200ms ease; }
      .animate-slide { animation: slide 220ms ease; }
      @keyframes pop { from { transform: scale(0.98); opacity: 0 } to { transform: scale(1); opacity: 1 } }
      @keyframes slide { from { transform: translateY(-6px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
    `}</style>
  );
}
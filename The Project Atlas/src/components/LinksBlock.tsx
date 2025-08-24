import React from "react";

interface LinksBlockProps {
  edit: boolean;
  topic: any;
  updateTopic: (catId: string, topicId: string, patch: any) => void;
}

export function LinksBlock({ edit, topic, updateTopic }: LinksBlockProps) {
  if (edit) {
    return (
      <textarea className="input min-h-[80px]" value={(topic.links||[]).join("\n")}
        onChange={(e)=> updateTopic(topic.catId, topic.id, { links: e.target.value.split(/\n+/).filter(Boolean) })} />
    );
  }
  return (
    <ul className="list-disc pl-5 text-sm">
      {(topic.links||[]).length ? (topic.links||[]).map((l: string, i: number) => (
        <li key={i}><a className="underline" href={l} target="_blank" rel="noreferrer">{l}</a></li>
      )) : <span style={{ color: "var(--muted)" }}>—</span>}
    </ul>
  );
}
'use client';

import React from 'react';

// Minimal, dependency-free Markdown renderer for help articles: headings,
// paragraphs, bullet / numbered lists, inline **bold** / *italic* / _italic_.
// Ported from the admin console's assistant renderer, plus heading support.

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|_[^_]+_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) {
      nodes.push(<strong key={`${keyPrefix}-b${i}`} style={{ color: 'var(--text-primary)' }}>{tok.slice(2, -2)}</strong>);
    } else {
      nodes.push(<em key={`${keyPrefix}-i${i}`}>{tok.slice(1, -1)}</em>);
    }
    last = m.index + tok.length;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function HelpMarkdown({ content }: { content: string }) {
  const lines = (content ?? '').split('\n');
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let key = 0;

  const flushList = () => {
    if (!list) return;
    const { items, ordered } = list;
    const k = key++;
    const Tag = ordered ? 'ol' : 'ul';
    blocks.push(
      <Tag
        key={k}
        style={{
          paddingLeft: '22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          listStyle: ordered ? 'decimal' : 'disc',
        }}
      >
        {items.map((it, j) => (
          <li key={j} style={{ lineHeight: 1.7 }}>
            {renderInline(it, `${ordered ? 'o' : 'u'}${k}-${j}`)}
          </li>
        ))}
      </Tag>
    );
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+\.\s+(.*)$/);
    if (heading) {
      flushList();
      const k = key++;
      const level = heading[1].length;
      blocks.push(
        <p
          key={k}
          style={{
            fontSize: level <= 2 ? '16px' : '14px',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginTop: '10px',
          }}
        >
          {renderInline(heading[2], `h${k}`)}
        </p>
      );
    } else if (bullet) {
      if (!list || list.ordered) {
        flushList();
        list = { ordered: false, items: [] };
      }
      list.items.push(bullet[1]);
    } else if (numbered) {
      if (!list || !list.ordered) {
        flushList();
        list = { ordered: true, items: [] };
      }
      list.items.push(numbered[1]);
    } else if (line.trim() === '') {
      flushList();
    } else {
      flushList();
      const k = key++;
      blocks.push(
        <p key={k} style={{ lineHeight: 1.7 }}>
          {renderInline(line, `p${k}`)}
        </p>
      );
    }
  }
  flushList();

  return (
    <div
      className="flex flex-col"
      style={{ gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}
    >
      {blocks}
    </div>
  );
}

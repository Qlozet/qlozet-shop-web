'use client';

import React from 'react';

// Minimal, dependency-free Markdown renderer for the AI stylist replies:
// paragraphs, bullet / numbered lists, and inline **bold** / *italic* / _italic_.
// Uses inline styles to match the shop's styling approach and inherits the
// parent bubble's font/colour.

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
      nodes.push(
        <strong key={`${keyPrefix}-b${i}`} style={{ fontWeight: 700 }}>
          {tok.slice(2, -2)}
        </strong>,
      );
    } else {
      nodes.push(
        <em key={`${keyPrefix}-i${i}`}>{tok.slice(1, -1)}</em>,
      );
    }
    last = m.index + tok.length;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ content }: { content: string }) {
  const lines = (content ?? '').split('\n');
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let key = 0;

  const flushList = () => {
    if (!list) return;
    const { ordered, items } = list;
    const k = key++;
    const style: React.CSSProperties = {
      margin: '0 0 8px',
      paddingLeft: '20px',
    };
    blocks.push(
      ordered ? (
        <ol key={k} style={{ ...style, listStyle: 'decimal' }}>
          {items.map((it, j) => (
            <li key={j} style={{ marginBottom: '4px' }}>
              {renderInline(it, `o${k}-${j}`)}
            </li>
          ))}
        </ol>
      ) : (
        <ul key={k} style={{ ...style, listStyle: 'disc' }}>
          {items.map((it, j) => (
            <li key={j} style={{ marginBottom: '4px' }}>
              {renderInline(it, `u${k}-${j}`)}
            </li>
          ))}
        </ul>
      ),
    );
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+\.\s+(.*)$/);
    if (bullet) {
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
        <p key={k} style={{ margin: '0 0 8px' }}>
          {renderInline(line, `p${k}`)}
        </p>,
      );
    }
  }
  flushList();

  // Strip the trailing margin on the last block for tidy bubbles.
  return (
    <div style={{ display: 'block' }}>
      {blocks.map((b, i) =>
        i === blocks.length - 1 && React.isValidElement(b)
          ? React.cloneElement(b as React.ReactElement<{ style?: React.CSSProperties }>, {
              style: {
                ...((b as React.ReactElement<{ style?: React.CSSProperties }>).props.style || {}),
                marginBottom: 0,
              },
            })
          : b,
      )}
    </div>
  );
}

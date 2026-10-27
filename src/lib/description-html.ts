import DOMPurify from 'dompurify';

/**
 * A product description, safe to put on the page as HTML.
 *
 * The backend cleans descriptions on save (common/utils/description-html.ts);
 * this cleans again when showing them, which also covers listings saved
 * before that. Same allow-list: paragraphs, bold, italics, underline,
 * strike, lists, headings, quotes and safe links. Plain text (older fabric
 * and accessory descriptions) becomes paragraphs so its line breaks show.
 * Browser only: on the server it returns '' (the description is rendered
 * after the product loads in the browser).
 */
const TAGS = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'a'];

const looksLikeHtml = (s: string) => /<\/?[a-z][\s\S]*?>/i.test(s);

const escapeText = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const textToParagraphs = (text: string) =>
  text
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => `<p>${escapeText(b).replace(/\n/g, '<br>')}</p>`)
    .join('');

export function safeDescriptionHtml(raw: string | null | undefined): string {
  if (!raw || !raw.trim() || typeof window === 'undefined') return '';
  const html = looksLikeHtml(raw) ? raw : textToParagraphs(raw);
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: TAGS,
    ALLOWED_ATTR: ['href', 'title'],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:)/i,
  });
  // Links leave Qlozet in a new tab, without passing the page along.
  return clean.replace(/<a /g, '<a target="_blank" rel="nofollow noopener noreferrer" ');
}

// Builds dist/deliverable-1.pdf from deliverable-1.md.
// Every level-1 and level-2 heading starts a new page. Each of those sections is
// rendered alone first to count its pages; the counts give the start page of every
// section, which fills the table of contents and the {{pages:id}} / {{page:id}}
// placeholders. The whole document is then rendered once with page numbers, and the
// build fails if its page count differs from the sum of the section counts.
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Marked } from 'marked';
import { chromium } from 'playwright';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'deliverable-1.md'), 'utf8').replace(/\r\n/g, '\n');
const out = join(here, 'dist');

// Split into sections at level-1 and level-2 headings outside code fences.
const sections = [];
let current = { id: 'front', title: '', level: 0, lines: [], aliases: [] };
let fence = false;
for (const line of source.split('\n')) {
  if (/^```/.test(line)) fence = !fence;
  const h = !fence && /^(#{1,2}) (.*?)(?: \{#([\w-]+)\})?$/.exec(line);
  if (h) {
    const title = h[2].trim();
    const id = h[3] || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const heading = `${h[1]} ${title} {#${id}}`;
    // A level-2 heading right after its part heading stays on the part's first page.
    const empty = current.level === 1 && current.lines.slice(1).every(l => !l.trim() || /^<!--.*-->$/.test(l.trim()));
    if (h[1].length === 2 && empty) {
      current.lines.push(heading);
      current.aliases.push({ id, title, level: 2 });
    } else {
      sections.push(current);
      current = { id, title, level: h[1].length, lines: [heading], aliases: [] };
    }
  } else current.lines.push(line);
}
sections.push(current);
const ids = new Set();
for (const s of sections) for (const x of [s, ...(s.aliases || [])]) {
  if (ids.has(x.id)) throw new Error(`Duplicate section id: ${x.id}`);
  ids.add(x.id);
}

const marked = new Marked({ gfm: true });
marked.use({
  renderer: {
    heading({ tokens, depth }) {
      const raw = this.parser.parseInline(tokens);
      const m = /^(.*?) \{#([\w-]+)\}$/.exec(raw);
      return m ? `<h${depth} id="${m[2]}">${m[1]}</h${depth}>\n` : `<h${depth}>${raw}</h${depth}>\n`;
    },
  },
});

const css = `
@page { size: A4; margin: 16mm 15mm 18mm 15mm; }
body { font-family: "Helvetica Neue", Arial, sans-serif; font-size: 10pt; line-height: 1.4; color: #111; }
h1 { font-size: 20pt; margin: 0 0 10pt; }
h2 { font-size: 15pt; margin: 0 0 8pt; }
h3 { font-size: 12.5pt; margin: 14pt 0 6pt; }
h4, h5, h6 { font-size: 11pt; margin: 12pt 0 4pt; }
h1, h2, h3, h4, h5, h6 { break-after: avoid; }
table { border-collapse: collapse; width: 100%; margin: 6pt 0 10pt; font-size: 8.5pt; }
th, td { border: 0.5pt solid #999; padding: 2.5pt 4pt; vertical-align: top; text-align: left; overflow-wrap: break-word; }
th { background: #eee; }
tr { break-inside: avoid; }
code { font-family: Menlo, Consolas, monospace; font-size: 8.5pt; overflow-wrap: break-word; }
pre { background: #f4f4f4; border: 0.5pt solid #ccc; padding: 5pt; white-space: pre-wrap; overflow-wrap: anywhere; font-size: 8pt; }
pre code { font-size: 8pt; }
td code, th code, td a, th a { overflow-wrap: anywhere; }
img { max-width: 100%; box-sizing: border-box; border: 0.5pt solid #bbb; }
figure { margin: 8pt 0 12pt; break-inside: avoid; }
figcaption { font-size: 9pt; margin-top: 3pt; }
.section + .section { break-before: page; }
.toc td:last-child, .toc th:last-child { text-align: right; width: 4em; }
#navigation ~ table td:nth-child(2), #navigation ~ table th:nth-child(2) { white-space: nowrap; }
.id { white-space: nowrap; }
blockquote { margin: 6pt 0; padding-left: 8pt; border-left: 2pt solid #bbb; color: #333; }
`;
const footer = '<div style="width:100%;font-size:8pt;text-align:center;color:#555"><span class="pageNumber"></span> / <span class="totalPages"></span></div>';

function html(bodies) {
  return `<!doctype html><html><head><meta charset="utf-8"><base href="${pathToFileURL(here + '/').href}"><style>${css}</style></head><body>${bodies.map(b => `<div class="section">${b}</div>`).join('\n')}</body></html>`;
}

function fill(text, pages, width) {
  const pad = n => String(n).padStart(width, ' ');
  return text
    .replace(/\{\{page:([\w-]+)\}\}/g, (_, id) => pages ? String(pages.get(id).start) : pad(0))
    .replace(/\{\{pages:([\w-]+)\}\}/g, (_, id) => {
      if (!pages) return `${pad(0)}–${pad(0)}`;
      const p = pages.get(id);
      return p.start === p.end ? String(p.start) : `${p.start}–${p.end}`;
    });
}

function toc(pages) {
  const rows = sections.flatMap(s => [s, ...s.aliases.map(a => ({ ...a, page: s.id }))]).filter(s => s.level > 0).map(s => {
    const n = pages ? String(pages.get(s.page || s.id).start) : '000';
    return `| ${s.level === 2 ? '&emsp;' : ''}${s.level === 1 ? `**${s.title}**` : s.title} | ${n} |`;
  });
  return `<div class="toc">\n\n| Section | Page |\n|---|---|\n${rows.join('\n')}\n\n</div>`;
}

function sectionHtml(s, pages) {
  const md = fill(s.lines.join('\n'), pages, 3).replace('<!-- toc -->', () => toc(pages));
  // Keep IDs such as AC-01.1 or TC-47 on one line.
  return marked.parse(md).replace(/>([^<]+)</g, (_, text) => '>' + text.replace(/\b((?:AC|TC|FR|BR|NFR|OP|ADR|F|S|A|T|O)-[A-Z0-9]+(?:\.[0-9]+)*)/g, '<span class="id">$1</span>') + '<');
}

const pageCount = pdf => (pdf.toString('latin1').match(/\/Type\s*\/Page(?![s\w])/g) || []).length;

mkdirSync(out, { recursive: true });
const work = mkdtempSync(join(tmpdir(), 'd1-build-'));
const browser = await chromium.launch();
const page = await browser.newPage();
async function render(bodies, path) {
  const file = join(work, 'page.html');
  writeFileSync(file, html(bodies));
  await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
  await page.evaluate(() => Promise.all([...document.images].map(img => img.complete ? null : new Promise(r => { img.onload = img.onerror = r; }))));
  const broken = await page.evaluate(() => [...document.images].filter(i => !i.naturalWidth).map(i => i.getAttribute('src')));
  if (broken.length) throw new Error(`Missing images: ${broken.join(', ')}`);
  await page.emulateMedia({ media: 'print' });
  const wide = await page.evaluate(() => [...document.querySelectorAll('table, pre, img')].filter(e => e.getBoundingClientRect().right > document.body.getBoundingClientRect().right + 1).map(e => e.textContent.slice(0, 60)));
  if (wide.length) throw new Error(`Wider than the page: ${wide.join(' | ')}`);
  return page.pdf({ path, format: 'A4', printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: footer, margin: { top: '16mm', bottom: '18mm', left: '15mm', right: '15mm' } });
}

try {
  // Pass 1: page count of each section, with placeholder numbers of the final width.
  const counts = [];
  for (const s of sections) counts.push(pageCount(await render([sectionHtml(s, null)])));
  const starts = new Map();
  let next = 1;
  sections.forEach((s, i) => {
    for (const x of [s, ...s.aliases]) starts.set(x.id, { start: next, end: next + counts[i] - 1 });
    next += counts[i];
  });
  // A level-1 section's range runs to the end of its last level-2 section.
  sections.forEach((s, i) => {
    if (s.level !== 1) return;
    let j = i + 1;
    while (j < sections.length && sections[j].level === 2) j++;
    starts.get(s.id).end = starts.get(sections[j - 1].id).end;
  });
  const expected = next - 1;
  // Pass 2: the whole document with real numbers.
  const pdfPath = join(out, 'deliverable-1.pdf');
  const total = pageCount(await render(sections.map(s => sectionHtml(s, starts)), pdfPath));
  if (total !== expected) throw new Error(`Page count ${total} differs from the section sum ${expected}; page references would be wrong.`);
  const front = counts[0];
  if (pageCount(await render([sectionHtml(sections[0], starts)])) !== front) throw new Error('Front matter changed length after filling page numbers.');
  console.log(`${pdfPath}: ${total} pages`);
  for (const s of sections.filter(s => s.level === 1)) console.log(`  ${s.title}: pages ${starts.get(s.id).start}–${starts.get(s.id).end}`);
} finally {
  await browser.close();
  rmSync(work, { recursive: true, force: true });
}

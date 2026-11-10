// Builds dist/deliverable-1.pdf from deliverable-1.md.
// Each Part (level-1 heading) starts a new page; the font is Times New Roman, 12 pt or larger.
// Page numbers: the contents lists every level-1 and level-2 heading as a link, and every
// {{page:id}} / {{pages:id}} placeholder becomes a link to that heading. Chromium writes each
// link target into the PDF as a named destination with its page, so the build renders the PDF,
// reads the page of every target, fills the numbers and renders again until the numbers no
// longer change. It fails if a referenced heading has no page or the numbers do not settle.
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Marked } from 'marked';
import { chromium } from 'playwright';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'deliverable-1.md'), 'utf8').replace(/\r\n/g, '\n');
const out = join(here, 'dist');
const slug = t => t.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Split into Parts at level-1 headings outside code fences; give every level-1 and level-2 heading an id.
const parts = [];
const headings = [];
const ids = new Set();
let current = { id: 'front', lines: [] };
let fence = false;
for (const line of source.split('\n')) {
  if (/^```/.test(line)) fence = !fence;
  const h = !fence && /^(#{1,6}) (.*?)(?: \{#([\w-]+)\})?$/.exec(line);
  if (!h || (h[1].length > 2 && !h[3])) { current.lines.push(line); continue; }
  const title = h[2].trim();
  const id = h[3] || slug(title);
  if (ids.has(id)) throw new Error(`Duplicate heading id: ${id}`);
  ids.add(id);
  const heading = `${h[1]} ${title} {#${id}}`;
  if (h[1].length <= 2) headings.push({ id, title, level: h[1].length });
  if (h[1].length === 1) { parts.push(current); current = { id, lines: [heading] }; }
  else current.lines.push(heading);
}
parts.push(current);

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
body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.35; color: #111; }
h1 { font-size: 20pt; margin: 0 0 10pt; }
h2 { font-size: 16pt; margin: 14pt 0 8pt; }
h3 { font-size: 14pt; margin: 14pt 0 6pt; }
h4, h5, h6 { font-size: 12pt; margin: 12pt 0 4pt; }
h1, h2, h3, h4, h5, h6 { break-after: avoid; }
table { border-collapse: collapse; width: 100%; margin: 6pt 0 10pt; font-size: 12pt; }
th, td { border: 0.5pt solid #999; padding: 2.5pt 4pt; vertical-align: top; text-align: left; overflow-wrap: break-word; }
th { background: #eee; }
tr { break-inside: avoid; }
code { font-family: "Times New Roman", Times, serif; font-size: 12pt; }
td code, th code { overflow-wrap: normal; }
pre { background: #f4f4f4; border: 0.5pt solid #ccc; padding: 5pt; white-space: pre-wrap; overflow-wrap: anywhere; font-size: 12pt; }
pre code { font-family: "Courier New", Courier, monospace; font-size: 12pt; }
td a, th a { overflow-wrap: anywhere; }
a.page { color: inherit; text-decoration: none; }
img { max-width: 100%; box-sizing: border-box; border: 0.5pt solid #bbb; }
figure { margin: 8pt 0 12pt; break-inside: avoid; }
figcaption { font-size: 12pt; margin-top: 3pt; }
.part + .part { break-before: page; }
.toc a { color: inherit; text-decoration: none; }
.toc td:last-child, .toc th:last-child { text-align: right; width: 4em; }
#navigation ~ table td:nth-child(2), #navigation ~ table th:nth-child(2) { white-space: nowrap; }
.id { white-space: nowrap; }
.note { border: 1pt solid #888; padding: 6pt 8pt; margin: 0 0 12pt; }
blockquote { margin: 6pt 0; padding-left: 8pt; border-left: 2pt solid #bbb; color: #333; }
`;
const footer = '<div style="width:100%;font-family:Times New Roman,serif;font-size:12pt;text-align:center;color:#555"><span class="pageNumber"></span> / <span class="totalPages"></span></div>';

function partRange(id, pages, total) {
  const starts = headings.filter(h => h.level === 1).map(h => h.id);
  const i = starts.indexOf(id);
  const start = pages.get(id);
  const end = i + 1 < starts.length ? pages.get(starts[i + 1]) - 1 : total;
  return start === end ? String(start) : `${start}–${end}`;
}

function toc(pages) {
  const rows = headings.map(h => {
    const n = pages ? pages.get(h.id) : '000';
    const label = h.level === 1 ? `**${h.title}**` : `&emsp;${h.title}`;
    return `| [${label}](#${h.id}) | [${n}](#${h.id}) |`;
  });
  return `<div class="toc">\n\n| Section | Page |\n|---|---|\n${rows.join('\n')}\n\n</div>`;
}

function partHtml(part, pages, total) {
  const md = part.lines.join('\n')
    .replace('<!-- toc -->', () => toc(pages))
    .replace(/\{\{page:([\w-]+)\}\}/g, (_, id) => `<a class="page" href="#${id}">${pages ? pages.get(id) : '000'}</a>`)
    .replace(/\{\{pages:([\w-]+)\}\}/g, (_, id) => `<a class="page" href="#${id}">${pages ? partRange(id, pages, total) : '000–000'}</a>`);
  return marked.parse(md)
    // Keep IDs such as AC-01.1 or TC-47 on one line.
    .replace(/>([^<]+)</g, (_, text) => '>' + text.replace(/\b((?:AC|TC|FR|BR|NFR|OP|ADR|F|S|A|T|O)-[A-Z0-9]+(?:\.[0-9]+)*)/g, '<span class="id">$1</span>') + '<')
    // Let long codes and paths in code spans break only after "_" or "/".
    .replace(/<code>([^<]*)<\/code>/g, (_, c) => `<code>${c.replace(/([_/])/g, '$1<wbr>')}</code>`);
}

// Page of every named destination, from the PDF bytes Chromium writes.
function destinationPages(pdf) {
  const s = pdf.toString('latin1');
  const obj = n => {
    const m = new RegExp(`(?:^|\\s)${n} 0 obj\\s*([\\s\\S]*?)endobj`).exec(s);
    if (!m) throw new Error(`PDF object ${n} not found`);
    return m[1];
  };
  const order = [];
  const walk = n => {
    const d = obj(n);
    if (/\/Type\s*\/Pages\b/.test(d)) for (const k of /\/Kids\s*\[([^\]]*)\]/.exec(d)[1].matchAll(/(\d+) 0 R/g)) walk(k[1]);
    else order.push(n);
  };
  const root = /\/Root (\d+) 0 R/.exec(s)[1];
  walk(/\/Pages (\d+) 0 R/.exec(obj(root))[1]);
  const pages = new Map();
  const dests = /\/Dests (\d+) 0 R/.exec(s);
  if (dests) for (const m of obj(dests[1]).matchAll(/\/([\w#-]+)\s*\[(\d+) 0 R/g)) {
    pages.set(m[1].replace(/#([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16))), order.indexOf(m[2]) + 1);
  }
  return { pages, total: order.length };
}

mkdirSync(out, { recursive: true });
const work = mkdtempSync(join(tmpdir(), 'd1-build-'));
const browser = await chromium.launch();
const page = await browser.newPage();
async function render(pages, total, path) {
  const file = join(work, 'page.html');
  const body = parts.map(p => `<div class="part">${partHtml(p, pages, total)}</div>`).join('\n');
  writeFileSync(file, `<!doctype html><html><head><meta charset="utf-8"><base href="${pathToFileURL(here + '/').href}"><style>${css}</style></head><body>${body}</body></html>`);
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
  const pdfPath = join(out, 'deliverable-1.pdf');
  const referenced = new Set([...headings.map(h => h.id), ...[...source.matchAll(/\{\{pages?:([\w-]+)\}\}/g)].map(m => m[1])]);
  let pages = null;
  let total = 0;
  for (let round = 1; ; round++) {
    const found = destinationPages(await render(pages, total, pdfPath));
    const missing = [...referenced].filter(id => !found.pages.has(id));
    if (missing.length) throw new Error(`No page found for: ${missing.join(', ')}`);
    const same = pages && found.total === total && [...referenced].every(id => found.pages.get(id) === pages.get(id));
    pages = found.pages; total = found.total;
    if (same) break;
    if (round === 5) throw new Error('Page numbers did not settle after 5 renders.');
  }
  console.log(`${pdfPath}: ${total} pages`);
  for (const h of headings.filter(h => h.level === 1)) console.log(`  ${h.title}: pages ${partRange(h.id, pages, total)}`);
} finally {
  await browser.close();
  rmSync(work, { recursive: true, force: true });
}

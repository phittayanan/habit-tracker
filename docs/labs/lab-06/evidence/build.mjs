// Builds dist/lab6_sec31_EN-010_P8.pdf from part-*.md (Lab 6 evidence, Issue #109).
// Same layout as the Lab 5 builder: each level-1 heading starts a new page, Times New Roman.
// The parts do not copy the Lab 6 records. A line `{{include:path}}` prints a whole file, and
// `{{include:path|## 3.}}` prints the section whose heading starts with that text; paths are relative to
// this folder and the headings move down so the part keeps its own outline. `{{CASE_MAP}}` is the table
// from each UAT case to its requirement and criterion IDs (ADR 0056), read from the case files.
// `{{PAGES_<part>}}` is the page range of a part, counted by rendering that part alone.
// Names and student IDs are never in Git: set LAB6_IDENTITY to a JSON file outside the repository with
// the six keys below. LAB6_FINAL=1 refuses a build with any placeholder left.
//   npm ci && LAB6_IDENTITY=/path/identity.json LAB6_FINAL=1 npm run build
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Marked } from 'marked';
import { chromium } from 'playwright';

const here = dirname(fileURLToPath(import.meta.url));
const parts = [
  ['0', 'part-0.md'], ['A', 'part-a.md'], ['B', 'part-b.md'],
  ['C', 'part-c.md'], ['D', 'part-d.md'], ['X', 'appendix.md'],
];
const outName = 'lab6_sec31_EN-010_P8.pdf';
const keys = ['STUDENT_1_NAME', 'STUDENT_1_ID', 'STUDENT_2_NAME', 'STUDENT_2_ID', 'PARTNER_1_NAME', 'PARTNER_2_NAME'];
const read = path => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

// Applies `change` to every line outside fenced code blocks.
function outsideFences(text, change) {
  let fence = null;
  return text.split('\n').map(line => {
    const mark = line.match(/^\s*(`{3,}|~{3,})/)?.[1];
    if (mark) {
      if (!fence) fence = mark;
      else if (mark[0] === fence[0] && mark.length >= fence.length) fence = null;
      return line;
    }
    return fence ? line : change(line);
  }).join('\n');
}

function section(text, start, path) {
  const level = start.match(/^#+/)[0].length;
  const kept = [];
  let on = false;
  outsideFences(text, line => line).split('\n').forEach(line => {
    const heading = line.match(/^(#+) /);
    if (on && heading && heading[1].length <= level) on = false;
    if (line.startsWith(start)) on = true;
    if (on) kept.push(line);
  });
  if (!kept.length) throw new Error(`No section "${start}" in ${path}`);
  return kept.join('\n');
}

function include(spec) {
  const [path, start] = spec.split('|');
  let text = read(join(here, path)).replace(/<!--[\s\S]*?-->\n?/g, '');
  // A numbered `## ` section is printed without its own heading, because the part gives it one.
  if (start) {
    text = section(text, start, path);
    if (start.startsWith('## ')) text = text.split('\n').slice(1).join('\n');
  }
  // The highest heading of the included text becomes level 3, under the part's level-2 headings.
  const levels = [];
  outsideFences(text, line => { const m = line.match(/^(#+) /); if (m) levels.push(m[1].length); return line; });
  const shift = levels.length ? Math.max(0, 3 - Math.min(...levels)) : 0;
  return outsideFences(text, line => line.replace(/^(#+) /, (_, h) => '#'.repeat(Math.min(6, h.length + shift)) + ' ')).trim();
}

function caseMap() {
  const dir = join(here, '..', 'uat-cases');
  const rows = readdirSync(dir).filter(f => f.endsWith('.md')).sort().map(file => {
    const text = read(join(dir, file));
    const field = name => {
      const value = text.match(new RegExp(`^\\| ${name} \\| (.+) \\|$`, 'm'))?.[1];
      if (!value) throw new Error(`${file} has no "${name}" row`);
      return value.replace(/ \(contracts?:.*\)$/, '');
    };
    return `| ${field('Case ID')} | ${field('Category')} | ${field('Roles?')} | ${field('Requirements')} | ${field('Acceptance criteria')} |`;
  });
  return ['| Case | Category | Role | FR, BR and NFR | Acceptance criteria |', '|---|---|---|---|---|', ...rows].join('\n');
}

const identityPath = process.env.LAB6_IDENTITY;
const identity = identityPath ? JSON.parse(readFileSync(identityPath, 'utf8')) : null;
if (identity) for (const k of keys) if (!identity[k]) throw new Error(`LAB6_IDENTITY is missing ${k}`);
if (!identity) console.warn('LAB6_IDENTITY is not set: names and student IDs stay as placeholders (this build is not for submission).');

const sources = parts.map(([id, file]) => {
  let text = read(join(here, file)).replace(/<!--[\s\S]*?-->\n?/g, '')
    .replace(/^\{\{include:([^}]+)\}\}$/gm, (_, spec) => include(spec))
    .replace('{{CASE_MAP}}', caseMap);
  if (identity) for (const k of keys) text = text.replaceAll(`{{${k}}}`, identity[k]);
  const titles = [];
  outsideFences(text, line => { if (/^# /.test(line)) titles.push(line); return line; });
  if (titles.length !== 1) throw new Error(`${file} must have exactly one level-1 heading, found ${titles.length}`);
  return { id, text };
});

const marked = new Marked({ gfm: true });
const css = `
@page { size: A4; margin: 15mm 13mm 17mm 13mm; }
body { font-family: "Times New Roman", Times, serif; font-size: 11.5pt; line-height: 1.28; color: #111; }
h1 { font-size: 18pt; margin: 0 0 8pt; }
h2 { font-size: 14pt; margin: 12pt 0 6pt; }
h3 { font-size: 12.5pt; margin: 10pt 0 5pt; }
h4, h5, h6 { font-size: 11.5pt; margin: 8pt 0 4pt; }
h1, h2, h3, h4, h5, h6 { break-after: avoid; }
table { border-collapse: collapse; width: 100%; margin: 6pt 0 10pt; font-size: 10pt; }
th, td { border: 0.5pt solid #999; padding: 2pt 3pt; vertical-align: top; text-align: left; overflow-wrap: break-word; }
td.id { white-space: nowrap; }
table.wide { font-size: 7.8pt; line-height: 1.2; }
table.wide code { font-size: 7.2pt; }
th { background: #eee; overflow-wrap: normal; }
tr { break-inside: avoid; }
code { font-family: "Courier New", Courier, monospace; font-size: 9.5pt; overflow-wrap: anywhere; }
pre { background: #f4f4f4; border: 0.5pt solid #ccc; padding: 5pt; white-space: pre-wrap; overflow-wrap: anywhere; font-size: 9.5pt; }
pre code { font-size: 9pt; }
a { color: #0b3d91; overflow-wrap: anywhere; }
/* In a table, a word breaks only if it cannot fit: with "anywhere" a narrow column shrank to one character.
   Code and links with a long unbroken token keep "anywhere", or their table would be wider than the page. */
table.wide th { overflow-wrap: break-word; }
table code.short, table a.short { overflow-wrap: break-word; }
figure { margin: 6pt auto 10pt; break-inside: avoid; text-align: center; }
figure img { max-width: 100%; max-height: 98mm; border: 1px solid #999; }
figcaption { font-size: 10pt; margin-top: 3pt; text-align: left; }
.part + .part { break-before: page; }
`;
const footer = '<div style="width:100%;font-family:Times New Roman,serif;font-size:10pt;text-align:center;color:#555"><span class="pageNumber"></span> / <span class="totalPages"></span></div>';

const toHtml = md => '<div class="part">' + marked.parse(
  md.replace(/^!\[([^\]]+)\]\(([^)]+)\)$/gm, (_, cap, src) =>
    `<figure><img src="${src}" alt="${cap.replace(/"/g, '&quot;')}"><figcaption>${marked.parseInline(cap)}</figcaption></figure>`)) + '</div>';

const out = join(here, 'dist');
mkdirSync(out, { recursive: true });
const work = mkdtempSync(join(tmpdir(), 'lab6-build-'));
const browser = await chromium.launch(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {});
try {
  const page = await browser.newPage();
  const render = async (html, pdfPath) => {
    const file = join(work, 'page.html');
    writeFileSync(file, `<!doctype html><html><head><meta charset="utf-8"><base href="${pathToFileURL(here + '/').href}"><style>${css}</style></head><body>${html}</body></html>`);
    await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
    await page.evaluate(() => Promise.all([...document.images].map(img => img.complete ? null : new Promise(r => { img.onload = img.onerror = r; }))));
    const broken = await page.evaluate(() => [...document.images].filter(i => !i.naturalWidth).map(i => i.getAttribute('src')));
    if (broken.length) throw new Error(`Missing images: ${broken.join(', ')}`);
    // The evidence registers end in a repository file name column. It squeezes the other columns, and the
    // evidence ID already names the file (evidence/<ID>-...), so the PDF leaves that column out.
    await page.evaluate(() => document.querySelectorAll('table').forEach(t => { if (t.rows[0].cells.length >= 6 && t.rows[0].cells[t.rows[0].cells.length - 1].textContent.trim() === 'File') [...t.rows].forEach(r => r.deleteCell(-1)); }));
    await page.evaluate(() => document.querySelectorAll('table code, table a').forEach(e => { if (e.textContent.split(/\s+/).every(w => w.length <= 12)) e.classList.add('short'); }));
    // Tables with six or more columns use the small print so they fit on A4.
    await page.evaluate(() => document.querySelectorAll('table').forEach(t => { if (t.rows[0].cells.length >= 6) t.classList.add('wide'); }));
    // Evidence IDs, case IDs and Issue numbers stay on one line.
    await page.evaluate(() => document.querySelectorAll('td').forEach(td => { if (/^(E-B[0-9X]+-[0-9]+|UAT-0[0-9]|Appendix|#[0-9]+)$/.test(td.textContent.trim())) td.classList.add('id'); }));
    await page.emulateMedia({ media: 'print' });
    const pdf = await page.pdf({ path: pdfPath, format: 'A4', printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: footer, margin: { top: '15mm', bottom: '17mm', left: '13mm', right: '13mm' } });
    return (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  };
  const withPages = (text, ranges) => text.replace(/\{\{PAGES_([0ABCDX])\}\}/g, (_, id) => ranges[id] ?? '00–00');

  // First pass: count each part alone (every part starts on a new page). Second pass: print the ranges.
  const ranges = {};
  let next = 1;
  for (const s of sources) {
    const count = await render(toHtml(withPages(s.text, {})), join(work, `${s.id}.pdf`));
    ranges[s.id] = count === 1 ? `${next}` : `${next}–${next + count - 1}`;
    next += count;
  }
  const finalText = sources.map(s => withPages(s.text, ranges));
  const open = [...new Set(finalText.join('\n').match(/\{\{[A-Za-z0-9_:]+\}\}/g) ?? [])];
  if (process.env.LAB6_FINAL && open.length) throw new Error(`Unfilled placeholders: ${open.join(', ')}`);
  const pdfPath = join(out, outName);
  const total = await render(finalText.map(toHtml).join('\n'), pdfPath);
  if (total !== next - 1) throw new Error(`Page ranges are wrong: the parts add up to ${next - 1} pages, the PDF has ${total}`);
  if (process.env.LAB6_PNG) { await page.setViewportSize({ width: 794, height: 1123 }); await page.screenshot({ path: join(out, 'preview.png'), fullPage: true }); }
  console.log(`${pdfPath}: ${total} pages; ${Object.entries(ranges).map(([k, v]) => `${k}=${v}`).join(' ')}`);
} finally {
  await browser.close();
  rmSync(work, { recursive: true, force: true });
}

// Builds dist/lab5_sec31_EN-010_P8.pdf from part-0.md to part-4.md (Lab 5 step 9, Issues #68 and #97).
// Each "Answer Part" (level-1 heading) starts a new page; the font is Times New Roman, 12 pt.
// A line that is only an image becomes a figure; its alt text is the numbered caption.
// Names and student IDs are never in Git: the sources hold {{STUDENT_1_NAME}}, {{STUDENT_1_ID}},
// {{STUDENT_2_NAME}} and {{STUDENT_2_ID}}. Set LAB5_IDENTITY to a JSON file outside the repository
// with those four keys to fill them; without it the placeholders stay and a warning is printed.
//   npm ci && LAB5_IDENTITY=/path/identity.json npm run build
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Marked } from 'marked';
import { chromium } from 'playwright';

const here = dirname(fileURLToPath(import.meta.url));
const files = ['part-0.md', 'part-1.md', 'part-2.md', 'part-3.md', 'part-4.md'];
const outName = 'lab5_sec31_EN-010_P8.pdf';
const keys = ['STUDENT_1_NAME', 'STUDENT_1_ID', 'STUDENT_2_NAME', 'STUDENT_2_ID'];

let source = files.map(f => readFileSync(join(here, f), 'utf8')).join('\n\n').replace(/\r\n/g, '\n');
// Required headings, in order (handout section 12).
const required = ['Answer Part 0: Team and Evidence Index', 'Answer Part 1: CI and Quality Gate',
  'Answer Part 2: Docker and Reproducible Configuration', 'Answer Part 3: GCP Deployment and Persistence',
  'Answer Part 4: Repeatable Release Pipeline'];
const found = [...source.matchAll(/^# (.+)$/gm)].map(m => m[1].trim());
if (JSON.stringify(found) !== JSON.stringify(required)) throw new Error(`Level-1 headings must be exactly, in order:\n${required.join('\n')}\nFound:\n${found.join('\n')}`);

const identityPath = process.env.LAB5_IDENTITY;
if (identityPath) {
  const identity = JSON.parse(readFileSync(identityPath, 'utf8'));
  for (const k of keys) {
    if (!identity[k]) throw new Error(`LAB5_IDENTITY is missing ${k}`);
    source = source.replaceAll(`{{${k}}}`, identity[k]);
  }
} else {
  console.warn('LAB5_IDENTITY is not set: names and student IDs stay as placeholders (this build is not for submission).');
}
const open = [...source.matchAll(/\{\{[A-Z0-9_]+\}\}/g)].map(m => m[0]);
if (identityPath && open.length) throw new Error(`Unfilled placeholders: ${[...new Set(open)].join(', ')}`);
const todo = [...source.matchAll(/TO FILL[^|\n]*/g)].map(m => m[0]);
if (process.env.LAB5_FINAL && todo.length) throw new Error(`TO FILL left in the text (${todo.length}): ${todo.slice(0, 3).join(' / ')}`);

const marked = new Marked({ gfm: true });
const css = `
@page { size: A4; margin: 16mm 15mm 18mm 15mm; }
body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.3; color: #111; }
h1 { font-size: 18pt; margin: 0 0 8pt; }
h2 { font-size: 14pt; margin: 12pt 0 6pt; }
h1, h2, h3 { break-after: avoid; }
table { border-collapse: collapse; width: 100%; margin: 6pt 0 10pt; font-size: 11pt; }
th, td { border: 0.5pt solid #999; padding: 2.5pt 4pt; vertical-align: top; text-align: left; overflow-wrap: break-word; }
th { background: #eee; }
tr { break-inside: avoid; }
code { font-family: "Courier New", Courier, monospace; font-size: 10.5pt; overflow-wrap: break-word; }
pre { background: #f4f4f4; border: 0.5pt solid #ccc; padding: 5pt; white-space: pre-wrap; overflow-wrap: break-word; font-size: 10.5pt; }
a { color: #0b3d91; overflow-wrap: break-word; }
figure { margin: 8pt auto 12pt; break-inside: avoid; }
figure img { display: block; width: 100%; box-sizing: border-box; border: 1px solid #999; }
figure.narrow img { width: 70%; margin: 0 auto; }
figcaption { font-size: 11pt; margin-top: 3pt; }
.part + .part { break-before: page; }
`;
const footer = '<div style="width:100%;font-family:Times New Roman,serif;font-size:10pt;text-align:center;color:#555"><span class="pageNumber"></span> / <span class="totalPages"></span></div>';

const parts = source.split(/\n(?=# )/).map(p => p.trim()).filter(p => p.startsWith('# '));
const html = parts.map(md => '<div class="part">' + marked.parse(
  md.replace(/^!\[([^\]]+)\]\(([^)]+)\)(\{narrow\})?$/gm, (_, cap, src, narrow) =>
    `<figure${narrow ? ' class="narrow"' : ''}><img src="${src}" alt="${cap.replace(/"/g, '&quot;')}"><figcaption>${marked.parseInline(cap)}</figcaption></figure>`)) + '</div>').join('\n');

const out = join(here, 'dist');
mkdirSync(out, { recursive: true });
const work = mkdtempSync(join(tmpdir(), 'lab5-build-'));
const browser = await chromium.launch(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {});
try {
  const page = await browser.newPage();
  const file = join(work, 'page.html');
  writeFileSync(file, `<!doctype html><html><head><meta charset="utf-8"><base href="${pathToFileURL(here + '/').href}"><style>${css}</style></head><body>${html}</body></html>`);
  await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
  await page.evaluate(() => Promise.all([...document.images].map(img => img.complete ? null : new Promise(r => { img.onload = img.onerror = r; }))));
  const broken = await page.evaluate(() => [...document.images].filter(i => !i.naturalWidth).map(i => i.getAttribute('src')));
  if (broken.length) throw new Error(`Missing images: ${broken.join(', ')}`);
  await page.emulateMedia({ media: 'print' });
  const pdfPath = join(out, outName);
  await page.pdf({ path: pdfPath, format: 'A4', printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: footer, margin: { top: '16mm', bottom: '18mm', left: '15mm', right: '15mm' } });
  if (process.env.LAB5_PNG) { await page.setViewportSize({ width: 794, height: 1123 }); await page.screenshot({ path: join(out, 'preview.png'), fullPage: true }); }
  const pages = (readFileSync(pdfPath).toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  console.log(`${pdfPath}: ${pages} pages${existsSync(pdfPath) ? '' : ' (missing!)'}`);
} finally {
  await browser.close();
  rmSync(work, { recursive: true, force: true });
}

// Builds dist/lab7_sec31_EN-010_P8.pdf from part-*.md (Lab 7 report, Issue #166). Copied from the Lab 6
// builder (docs/labs/lab-06/evidence/build.mjs, Issue #109) with the Lab 6 case map taken out.
// Each level-1 heading starts a new page, Times New Roman. A line `{{include:path}}` prints a whole file, and
// `{{include:path|## 3.}}` prints the section whose heading starts with that text; paths are relative to this
// folder and the headings move down so the part keeps its own outline. `{{text:path}}` prints a text file,
// such as a captured log or a diff, as it is. `{{PAGES_<part>}}` is the page range of a part, counted by
// rendering that part alone. Run `bash fetch-records.sh` first: it writes records.md and the three diffs.
// Names and student IDs are never in Git: set LAB7_IDENTITY to a JSON file outside the repository with
// the four keys below. LAB7_FINAL=1 refuses a build with any placeholder left.
//   npm ci && bash fetch-records.sh && LAB7_IDENTITY=/path/identity.json LAB7_FINAL=1 npm run build
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, relative, sep, posix } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Marked } from 'marked';
import { chromium } from 'playwright';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..', '..', '..');
// Links in the PDF point at the commit the Lab 7 records were merged in (PR #163), so they keep working.
const blobBase = 'https://github.com/phittayanan/habit-tracker/blob/a7dbbfb/';
const parts = [
  ['0', 'part-0.md'], ['A', 'part-a.md'], ['B', 'part-b.md'],
  ['C', 'part-c.md'], ['D', 'part-d.md'], ['X', 'appendix.md'],
];
const outName = 'lab7_sec31_EN-010_P8.pdf';
const keys = ['STUDENT_1_NAME', 'STUDENT_1_ID', 'STUDENT_2_NAME', 'STUDENT_2_ID'];
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
  // A relative link in an included file points at a repository file, which a reader of the PDF cannot open:
  // it becomes a GitHub link at the pinned commit. A relative image stays a local path, now from this folder.
  const fromRepo = relative(repoRoot, dirname(join(here, path)));
  text = outsideFences(text, line => line.replace(/(!?)\[([^\]]*)\]\((?!https?:|#|mailto:)([^)\s]+)\)/g, (_, bang, label, target) => {
    const [file, anchor] = target.split('#');
    const repoPath = posix.normalize(posix.join(fromRepo.split(sep).join('/'), file));
    if (bang) return `![${label}](${posix.relative(here.split(sep).join('/'), posix.join(repoRoot.split(sep).join('/'), repoPath))})`;
    return `[${label}](${blobBase}${repoPath}${anchor ? '#' + anchor : ''})`;
  }));
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

const identityPath = process.env.LAB7_IDENTITY;
const identity = identityPath ? JSON.parse(readFileSync(identityPath, 'utf8')) : null;
if (identity) for (const k of keys) if (!identity[k]) throw new Error(`LAB7_IDENTITY is missing ${k}`);
if (!identity) console.warn('LAB7_IDENTITY is not set: names and student IDs stay as placeholders (this build is not for submission).');

const sources = parts.map(([id, file]) => {
  let text = read(join(here, file)).replace(/<!--[\s\S]*?-->\n?/g, '')
    .replace(/^\{\{include:([^}]+)\}\}$/gm, (_, spec) => include(spec))
    .replace(/^\{\{text:([^}]+)\}\}$/gm, (_, path) => ['````text', read(join(here, path)).trim(), '````'].join('\n'))
    ;
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
/* The appendix is reference evidence: its records, diffs and logs use smaller print than Parts 0 to D. */
.part-X pre { font-size: 7.5pt; padding: 3pt; line-height: 1.2; }
.part-X pre code { font-size: 7.5pt; }
a { color: #0b3d91; overflow-wrap: anywhere; }
/* In a table, a word breaks only if it cannot fit: with "anywhere" a narrow column shrank to one character.
   Code and links with a long unbroken token keep "anywhere", or their table would be wider than the page. */
table.wide th { overflow-wrap: break-word; }
table code.short, table a.short { overflow-wrap: break-word; }
figure { margin: 6pt auto 10pt; break-inside: avoid; text-align: center; }
figure img { max-width: 100%; max-height: 125mm; border: 1px solid #999; }
figcaption { font-size: 10pt; margin-top: 3pt; text-align: left; }
.part + .part { break-before: page; }
`;
const footer = '<div style="width:100%;font-family:Times New Roman,serif;font-size:10pt;text-align:center;color:#555"><span class="pageNumber"></span> / <span class="totalPages"></span></div>';

const toHtml = (md, id) => `<div class="part part-${id}">` + marked.parse(
  md.replace(/^!\[([^\]]+)\]\(([^)]+)\)$/gm, (_, cap, src) =>
    `<figure><img src="${src}" alt="${cap.replace(/"/g, '&quot;')}"><figcaption>${marked.parseInline(cap)}</figcaption></figure>`)) + '</div>';

const out = join(here, 'dist');
mkdirSync(out, { recursive: true });
const work = mkdtempSync(join(tmpdir(), 'lab7-build-'));
// File access lets the page read the local screenshots into a canvas, to crop them (see cropScreenshots).
const browser = await chromium.launch({ args: ['--allow-file-access-from-files'], ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
try {
  const page = await browser.newPage();
  const render = async (html, pdfPath) => {
    const file = join(work, 'page.html');
    writeFileSync(file, `<!doctype html><html><head><meta charset="utf-8"><base href="${pathToFileURL(here + '/').href}"><style>${css}</style></head><body>${html}</body></html>`);
    await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
    await page.evaluate(() => Promise.all([...document.images].map(img => img.complete ? null : new Promise(r => { img.onload = img.onerror = r; }))));
    const broken = await page.evaluate(() => [...document.images].filter(i => !i.naturalWidth).map(i => i.getAttribute('src')));
    if (broken.length) throw new Error(`Missing images: ${broken.join(', ')}`);
    // The screenshots are mostly blank page, so the app text printed very small (PR #169 review). Each copy
    // in the PDF is cropped to the box that holds every non-white pixel, ignoring the browser's scrollbar at
    // the right edge, with a small margin. The files themselves are not changed.
    await page.evaluate(async () => {
      for (const img of [...document.images].filter(i => i.getAttribute('src').includes('evidence/img/'))) {
        const { naturalWidth: w, naturalHeight: h } = img;
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
        const px = ctx.getImageData(0, 0, w, h).data;
        const bright = (x, y) => { const i = (y * w + x) * 4; return px[i] > 150 && px[i + 1] > 150 && px[i + 2] > 150; };
        let sum = 0; for (let i = 0; i < px.length; i += 4) sum += px[i];
        const apiShot = /E-PD-(09|11|12)-/.test(img.getAttribute('src'));
        // Other dark screenshots (the E-PD-07 JSON pages, the backup console) are full of content: no crop.
        if (sum / (w * h) < 80 && !apiShot) continue;
        if (apiShot) {
          // A dark browser window showing an API response (E-PD-09, 11, 12). Its text lines are bands of
          // light pixels: the first band is the address bar, the last is the response. The PDF shows the
          // address bar at its own size and, under it, the response enlarged two times (PR #169 review).
          const bands = []; let start = -1;
          for (let y = 0; y <= h; y++) {
            let on = false; if (y < h) for (let x = 0; x < w * 0.75 && !on; x++) on = bright(x, y);
            if (on && start < 0) start = y; else if (!on && start >= 0) { bands.push([start, y - 1]); start = -1; }
          }
          if (bands.length < 2) continue;
          const right = ([a, b]) => { let r = 0; for (let y = a; y <= b; y++) for (let x = 0; x < w * 0.75; x++) if (bright(x, y) && x > r) r = x; return r; };
          const [bar, resp] = [bands[0], bands[bands.length - 1]];
          const barBox = [0, 0, Math.min(w, right(bar) + 40), Math.min(h, bar[1] + 18)];
          const respBox = [0, Math.max(0, resp[0] - 6), Math.min(w, right(resp) + 12), Math.min(h, resp[1] + 7) - Math.max(0, resp[0] - 6)];
          const out = document.createElement('canvas'); const gap = 10;
          out.width = Math.max(barBox[2], 2 * respBox[2]); out.height = barBox[3] + gap + 2 * respBox[3];
          const o = out.getContext('2d'); o.fillStyle = '#111'; o.fillRect(0, 0, out.width, out.height);
          o.drawImage(c, 0, 0, barBox[2], barBox[3], 0, 0, barBox[2], barBox[3]);
          o.imageSmoothingEnabled = false;
          o.drawImage(c, 0, respBox[1], respBox[2], respBox[3], 0, barBox[3] + gap, 2 * respBox[2], 2 * respBox[3]);
          img.src = out.toDataURL('image/png');
          await img.decode();
          continue;
        }
        let x0 = w, y0 = h, x1 = -1, y1 = -1; const bars = new Set();
        // A thin frame line at the edges and the scrollbar at the right are not content, and neither is a
        // bar or line across nearly the whole width (the dark strip at the top of E-PD-01).
        const edge = 6, right = w - 32;
        const ink = (x, y) => { const i = (y * w + x) * 4; return px[i] < 235 || px[i + 1] < 235 || px[i + 2] < 235; };
        for (let y = edge; y < h - edge; y++) {
          let n = 0; for (let x = edge; x < right; x++) if (ink(x, y)) n++;
          if (n > 0.6 * (right - edge)) { bars.add(y); continue; }
          for (let x = edge; x < right; x++) if (ink(x, y)) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        }
        if (x1 < 0) continue;
        // The margin stops at a skipped bar, so the bar does not come back into the crop.
        const m = 12; x0 = Math.max(0, x0 - m); x1 = Math.min(w - 1, x1 + m);
        for (let k = 0; k < m && y0 > 0 && !bars.has(y0 - 1) && y0 - 1 >= edge; k++) y0--;
        for (let k = 0; k < m && y1 < h - 1 && !bars.has(y1 + 1); k++) y1++;
        if ((x1 - x0) * (y1 - y0) > 0.9 * w * h) continue;
        const out = document.createElement('canvas'); out.width = x1 - x0 + 1; out.height = y1 - y0 + 1;
        out.getContext('2d').drawImage(c, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
        img.src = out.toDataURL('image/png');
        await img.decode();
      }
    });
    // The evidence registers end in a repository file name column. It squeezes the other columns, and the
    // evidence ID already names the file (evidence/<ID>-...), so the PDF leaves that column out.
    await page.evaluate(() => document.querySelectorAll('table').forEach(t => { if (t.rows[0].cells.length >= 6 && t.rows[0].cells[t.rows[0].cells.length - 1].textContent.trim() === 'File') [...t.rows].forEach(r => r.deleteCell(-1)); }));
    await page.evaluate(() => document.querySelectorAll('table code, table a').forEach(e => { if (e.textContent.split(/\s+/).every(w => w.length <= 12)) e.classList.add('short'); }));
    // Tables with six or more columns use the small print so they fit on A4.
    await page.evaluate(() => document.querySelectorAll('table').forEach(t => { if (t.rows[0].cells.length >= 6) t.classList.add('wide'); }));
    // Evidence IDs, case IDs and Issue numbers stay on one line.
    await page.evaluate(() => document.querySelectorAll('td').forEach(td => { if (/^(E-PD-[0-9]+|E-pre-release|TC-[0-9]+|[RCM]-?[0-9A-Z-]*|S[1-5]|M[1-5]|Appendix|#[0-9]+)$/.test(td.textContent.trim())) td.classList.add('id'); }));
    await page.emulateMedia({ media: 'print' });
    const pdf = await page.pdf({ path: pdfPath, format: 'A4', printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: footer, margin: { top: '15mm', bottom: '17mm', left: '13mm', right: '13mm' } });
    return (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  };
  const withPages = (text, ranges) => text.replace(/\{\{PAGES_([0ABCDX])\}\}/g, (_, id) => ranges[id] ?? '00–00');

  // First pass: count each part alone (every part starts on a new page). Second pass: print the ranges.
  const ranges = {};
  let next = 1;
  for (const s of sources) {
    const count = await render(toHtml(withPages(s.text, {}), s.id), join(work, `${s.id}.pdf`));
    ranges[s.id] = count === 1 ? `${next}` : `${next}–${next + count - 1}`;
    next += count;
  }
  const finalText = sources.map(s => ({ id: s.id, text: withPages(s.text, ranges) }));
  const open = [...new Set(finalText.map(f => f.text).join('\n').match(/\{\{[A-Za-z0-9_:]+\}\}/g) ?? [])];
  if (process.env.LAB7_FINAL && open.length) throw new Error(`Unfilled placeholders: ${open.join(', ')}`);
  const pdfPath = join(out, outName);
  const total = await render(finalText.map(f => toHtml(f.text, f.id)).join('\n'), pdfPath);
  if (total !== next - 1) throw new Error(`Page ranges are wrong: the parts add up to ${next - 1} pages, the PDF has ${total}`);
  if (process.env.LAB7_PNG) { await page.setViewportSize({ width: 794, height: 1123 }); await page.screenshot({ path: join(out, 'preview.png'), fullPage: true }); }
  console.log(`${pdfPath}: ${total} pages; ${Object.entries(ranges).map(([k, v]) => `${k}=${v}`).join(' ')}`);
} finally {
  await browser.close();
  rmSync(work, { recursive: true, force: true });
}

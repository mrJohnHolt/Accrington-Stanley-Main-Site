import puppeteer       from './node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join }        from 'path';
import { fileURLToPath } from 'url';

const ROOT           = fileURLToPath(new URL('.', import.meta.url));
const SCREENSHOTS_DIR = join(ROOT, 'temporary screenshots');
const CHROME_BASE    = 'C:/Users/John/.cache/puppeteer/chrome';

const [,, url = 'http://localhost:3000', label] = process.argv;

/* Find latest Chrome build */
function findChrome() {
  if (!existsSync(CHROME_BASE)) throw new Error(`Chrome cache not found: ${CHROME_BASE}`);
  const dirs = readdirSync(CHROME_BASE).sort().reverse();
  for (const d of dirs) {
    const exe = join(CHROME_BASE, d, 'chrome-win64', 'chrome.exe');
    if (existsSync(exe)) return exe;
  }
  throw new Error('Chrome executable not found in puppeteer cache');
}

/* Auto-increment screenshot filename */
function nextPath() {
  if (!existsSync(SCREENSHOTS_DIR)) mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const existing = readdirSync(SCREENSHOTS_DIR).filter(f => /^screenshot-\d+/.test(f));
  const maxN = existing.reduce((max, f) => {
    const n = parseInt(f.match(/^screenshot-(\d+)/)?.[1] ?? '0', 10);
    return Math.max(max, n);
  }, 0);
  const n    = maxN + 1;
  const name = label ? `screenshot-${n}-${label}.png` : `screenshot-${n}.png`;
  return join(SCREENSHOTS_DIR, name);
}

const executablePath = findChrome();
const outPath        = nextPath();

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

/* Scroll through page to trigger Intersection Observers */
await page.evaluate(async () => {
  const height = document.body.scrollHeight;
  const step   = 400;
  for (let y = 0; y <= height; y += step) {
    window.scrollTo(0, y);
    await new Promise(r => setTimeout(r, 80));
  }
  window.scrollTo(0, 0);
});

/* Force any remaining .reveal elements visible */
await page.evaluate(() => {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
});

await new Promise(r => setTimeout(r, 800));
const fullPage = !label || !label.includes('viewport');
await page.screenshot({ path: outPath, fullPage });
await browser.close();

console.log(`Screenshot saved: ${outPath}`);

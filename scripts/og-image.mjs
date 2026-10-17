// Renders scripts/og-image.html to apps/web/public/og-{en,zh}.png.
// Needs Playwright with Chromium: `npx -y playwright@latest install chromium`, then `node scripts/og-image.mjs`.
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const lang of ['en', 'zh']) {
  await page.goto(`${pathToFileURL(root + 'scripts/og-image.html')}?lang=${lang}`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${root}apps/web/public/og-${lang}.png` });
  console.log(`og-${lang}.png`);
}
await browser.close();

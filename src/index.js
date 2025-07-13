// src/index.js
import { launchBrowser } from './helpers/browser.js';
import { extractTargetProductData } from './helpers/extractors.js';
import { saveToCSVAndExcel } from './helpers/fileIO.js';
import { TIMEOUTS } from './helpers/constants.js';

const urls = [
  'https://www.target.com/p/disney-minnie-mouse-little-girls-tank-jersey-dress-red-5/-/A-1002811070?preselect=1002811070#lnk=sametab'
];

(async () => {
  let browser;
  try {
    browser = await launchBrowser({
      headless: true,
      stealth: true,
      timeout: TIMEOUTS.BROWSER_LAUNCH
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 }
    });

    for (const url of urls) {
      const page = await context.newPage();
      try {
        const result = await extractTargetProductData(page, url);
        await saveToCSVAndExcel(result.productRow, result.extraImages);
        console.log(`✅ Successfully processed: ${url}`);
      } catch (err) {
        console.error(`❌ Failed to process ${url}:`, err.message);
        await page.screenshot({ path: `error-${Date.now()}.png` });
      } finally {
        await page.close();
      }
    }
  } finally {
    if (browser) await browser.close();
    console.log('🛑 Browser closed. Scraping completed.');
  }
})();
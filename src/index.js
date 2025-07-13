// src/index.js
import { launchBrowser } from './helpers/browser.js';
import { extractTargetProductData } from './helpers/extractors.js';
import { saveToCSVAndExcel } from './helpers/fileIO.js';
import { TIMEOUTS } from './constants.js';

const urls = [
  'https://www.target.com/p/girls-39-sleeveless-tank-dress-cat-38-jack-8482/-/A-94147428?preselect=93629653#lnk=sametab'
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
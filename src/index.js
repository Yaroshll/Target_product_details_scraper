// src/index.js
import { launchBrowser } from './helpers/browser.js';
import { extractTargetProductData } from './helpers/extractors.js';
import { saveToCSVAndExcel } from './helpers/fileIO.js';
import { TIMEOUTS } from './helpers/constants.js';

const urls = [
  'https://www.target.com/p/girls-39-sleeveless-tank-dress-cat-38-jack-8482/-/A-94147428?preselect=93629653#lnk=sametab'
];

(async () => {
  let browser;
  try {
    // 1. Launch browser with stealth settings
    browser = await launchBrowser({
      headless: true,
      stealth: true,
      timeout: TIMEOUTS.BROWSER_LAUNCH
    });

    // 2. Configure browser context
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
      locale: 'en-US',
      timezoneId: 'America/New_York'
    });

    // 3. Process each URL
    for (const [index, url] of urls.entries()) {
      const page = await context.newPage();
      try {
        console.log(`🏁 Processing URL ${index + 1}/${urls.length}: ${url}`);
        
        // 4. Extract product data with retries
        const { productRow, extraImages } = await extractTargetProductData(page, url);
        
        // 5. Save results
        await saveToCSVAndExcel(productRow, extraImages);
        console.log(`✅ Successfully processed: ${url}`);
        
      } catch (err) {
        console.error(`❌ Failed to process ${url}:`, err.message);
        // Capture screenshot for debugging
        await page.screenshot({ path: `error-${Date.now()}.png` });
      } finally {
        await page.close();
      }
    }

  } catch (err) {
    console.error('⚠️ Critical error:', err);
  } finally {
    // 6. Clean up
    if (browser) await browser.close();
    console.log('🛑 Browser closed. Scraping completed.');
    process.exit(0);
  }
})();
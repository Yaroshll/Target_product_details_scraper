import { launchBrowser } from './helpers/browser.js';
import { extractTargetProductData } from './helpers/extractors.js';
import { saveToCSVAndExcel } from './helpers/fileIO.js';
import { TIMEOUTS } from './helpers/constants.js';

(async () => {
  const browser = await launchBrowser();
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
    locale: 'en-US',
    timezoneId: 'America/New_York'
  });
  const page = await context.newPage();

  const urls = [
    'https://www.target.com/p/girls-39-sleeveless-tank-dress-cat-38-jack-8482/-/A-94147428?preselect=93629653#lnk=sametab'
  ];

  for (const url of urls) {
    try {
      const { productRow, extraImages } = await extractTargetProductData(page, url);
      await saveToCSVAndExcel(productRow, extraImages);
      console.log('✅ Saved:', url);
    } catch (err) {
      console.error('❌ Failed:', err.message);
    }
  }

  await browser.close();
})();

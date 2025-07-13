import { launchBrowser } from './helpers/browser.js';
import { extractTargetProductData } from './helpers/extractors.js';
import { saveToCSVAndExcel } from './helpers/fileIO.js';

const urls = [
  'https://www.target.com/p/girls-39-sleeveless-tank-dress-cat-38-jack-8482/-/A-94147428?preselect=93629653#lnk=sametab'
];

(async () => {
  const browser = await launchBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();

  for (const url of urls) {
    try {
      const { productRow, extraImages } = await extractTargetProductData(page, url);
      await saveToCSVAndExcel(productRow, extraImages);
      console.log(`✅ Scraped and saved: ${url}`);
    } catch (err) {
      console.error(`❌ Error scraping ${url}:`, err.message);
    }
  }

  await browser.close();
})();

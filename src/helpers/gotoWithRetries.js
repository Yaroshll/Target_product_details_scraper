/**
 * Navigate to a Target product page with retry logic
 * @param {import('playwright').Page} page - Playwright page object
 * @param {string} url - Target product URL
 * @param {number} retries - Number of retry attempts (default: 2)
 */
import { SELECTORS } from './constants.js';
export async function gotoTargetWithRetries(page, url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`🌐 Loading Target product (attempt ${i + 1}/${retries + 1}): ${url}`);
      
      await page.goto(url, {
       waitUntil: 'domcontentloaded',
        timeout: 60000
      });
      
      // Wait for Target-specific elements to confirm successful load
      await Promise.race([
        page.waitForSelector(SELECTORS.PRODUCT.TITLE, { timeout: 20000 }),
        page.waitForSelector(SELECTORS.BREADCRUMBS.ITEMS, { timeout: 20000 }),
        page.waitForTimeout(8000) // Fallback timeout
      ]);

      return; // Success
    } catch (error) {
      console.warn(`⚠️ Attempt ${i + 1} failed: ${error.message}`);

      if (i === retries) {
        throw new Error(`Failed to load Target product after ${retries + 1} attempts: ${url}`);
      }

      // Wait with increasing delay before retrying
      await page.waitForTimeout(5000 * (i + 1));
    }
  }
}
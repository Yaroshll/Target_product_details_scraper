import { formatHandleFromUrl, extractSKU, calculatePrices } from "./formatters.js";
import { getDescription } from "./description.js";
import { SELECTORS, DEFAULT_VALUES } from "./constants.js";
import { gotoTargetWithRetries } from "./gotoWithRetries.js";
// helpers/extractors.js
export async function extractPrice(page) {
  try {
    // Current Price Extraction
    const currentPrice = await page.$eval(
      SELECTORS.PRODUCT.CURRENT_PRICE,
      el => parseFloat(el.textContent.replace(/[^\d.]/g, ''))
    ).catch(() => null);

    // Original Price Extraction
    const originalPrice = await page.$eval(
      SELECTORS.PRODUCT.ORIGINAL_PRICE,
      el => parseFloat(el.textContent.replace(/[^\d.]/g, ''))
    ).catch(() => null);

    return {
      currentPrice: currentPrice || 0,
      originalPrice: originalPrice || null
    };
  } catch (error) {
    console.error('⚠️ Price extraction failed:', error.message);
    return {
      currentPrice: 0,
      originalPrice: null
    };
  }
}

export async function extractTargetProductData(page, url) {
  try {
      await gotoTargetWithRetries(page, url);
    
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector(SELECTORS.PRODUCT.TITLE, { timeout: 20000 });

    const handle = formatHandleFromUrl(url);
    const sku = extractSKU(url);
    
    const title = await page.$eval(
      SELECTORS.PRODUCT.TITLE,
      el => el.textContent.trim()
    ).catch(() => '');

    const { currentPrice, originalPrice } = await extractPrice(page);
    const { variantPrice, compareAtPrice } = calculatePrices(currentPrice, originalPrice);

    const breadcrumbs = await page.$$eval(
      SELECTORS.BREADCRUMBS.LINKS,
      anchors => anchors.map(a => a.textContent.trim()).filter(Boolean).join(',')
    ).catch(() => '');

    const description = await getDescription(page);
    const imageSrc = await page.$eval(
      SELECTORS.IMAGE.SRC,
      img => img.src
    ).catch(() => '');

    return {
      productRow: {
        Handle: handle,
        Title: title,
        "Body (HTML)": description,
        Vendor: DEFAULT_VALUES.VENDOR,
        Type: breadcrumbs.split(',').pop()?.trim() || DEFAULT_VALUES.TYPE,
        Tags: breadcrumbs,
        "Variant SKU": sku,
        "Cost per item": currentPrice,
        "Original Price": originalPrice,
        "Variant Price": variantPrice,
        "Variant Compare At Price": compareAtPrice,
        "Image Src": imageSrc,
        ...DEFAULT_VALUES,
        "product.metafields.custom.original_product_url": url
      },
      extraImages: [] // Add logic for additional images if needed
    };

  } catch (error) {
    console.error(`❌ Error processing ${url}:`, error.message);
    throw error;
  }
}
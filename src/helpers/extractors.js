// helpers/extractors.js
import { formatHandleFromUrl, extractSKU, calculatePrices } from "./formatters.js";
import { getDescription } from "./description.js";
import { SELECTORS, DEFAULT_VALUES } from "../constants.js";
import { gotoWithRetries } from "./gotoWithRetries.js";

export async function extractPrice(page) {
  try {
    // 1. First try precise selectors
    let currentPrice = await tryPriceSelectors(page, [
      'span[data-test="product-price"]', // Primary current price
      'span[data-test="current-price"]', // Alternative
      'span.price__current-value' // Common class
    ]);

    let originalPrice = await tryPriceSelectors(page, [
      'span.h-text-line-through', // Primary original price
      'span[data-test="original-price"]', // Alternative
      'span.price__compare' // Common class
    ]);

    // 2. Fallback to pattern matching if needed
    if (!currentPrice) {
      const priceText = await page.evaluate(() => {
        const priceEl = document.querySelector('[data-test="product-regular-price"]');
        return priceEl?.textContent;
      });
      
      if (priceText) {
        const matches = priceText.match(/\$\d+\.\d{2}/g);
        if (matches) {
          currentPrice = parseFloat(matches[0].replace(/[^\d.]/g, ''));
          originalPrice = matches[1] ? parseFloat(matches[1].replace(/[^\d.]/g, '')) : null;
        }
      }
    }

    // 3. Final validation
    if (!currentPrice || isNaN(currentPrice)) {
      throw new Error('Invalid price value extracted');
    }

    return { 
      currentPrice,
      originalPrice: originalPrice && !isNaN(originalPrice) ? originalPrice : null
    };

  } catch (error) {
    console.error('⚠️ Price extraction failed:', error.message);
    throw error;
  }
}

async function tryPriceSelectors(page, selectors) {
  for (const selector of selectors) {
    try {
      const price = await page.$eval(selector, el => {
        const text = el.textContent.trim();
        const value = text.replace(/[^\d.]/g, '');
        return parseFloat(value);
      });
      if (price && !isNaN(price)) return price;
    } catch (e) {
      continue;
    }
  }
  return null;
}

export async function extractTargetProductData(page, url) {
  try {
    await gotoWithRetries(page, url);
    console.info("✅ Page loaded, waiting for stability...");
    await page.waitForTimeout(3000);

    // 1. Extract basic identifiers
    const handle = formatHandleFromUrl(url);
    const sku = extractSKU(url);
    const title = await extractTitle(page, handle);

    // 2. Extract pricing data
    const { currentPrice, originalPrice } = await extractPrice(page);
    const { variantPrice, compareAtPrice } = calculatePrices(currentPrice, originalPrice);

    // 3. Extract other product data
    const breadcrumbs = await extractBreadcrumbs(page);
    const description = await getDescription(page);
    const imageHandles = await extractImages(page);

    // 4. Compile final product data
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
        "Image Src": imageHandles[0] || "",
        ...DEFAULT_VALUES,
        "product.metafields.custom.original_product_url": url,
      },
      extraImages: imageHandles.slice(1).map(src => ({
        Handle: handle,
        "Image Src": src
      }))
    };

  } catch (error) {
    console.error(`❌ Error processing ${url}:`, error.message);
    throw error;
  }
}

// Helper functions
async function extractTitle(page, fallbackTitle) {
  try {
    return await page.$eval(SELECTORS.PRODUCT.TITLE, el => el.textContent.trim());
  } catch {
    return fallbackTitle?.replace(/_/g, " ") || "";
  }
}

async function extractBreadcrumbs(page) {
  try {
    return await page.$$eval(
      SELECTORS.BREADCRUMBS.LINKS,
      anchors => anchors.map(a => a.textContent.trim()).filter(Boolean).join(",")
    );
  } catch {
    return "";
  }
}

async function extractImages(page) {
  try {
    return await page.$$eval(
      SELECTORS.IMAGE.SRC,
      imgs => imgs.map(img => img.src).filter(Boolean)
    );
  } catch {
    return [];
  }
}
import { formatHandleFromUrl, extractSKU, calculatePrices } from "./formatters.js";
import { getDescription } from "./description.js";
import { SELECTORS, DEFAULT_VALUES } from "./constants.js";
import { gotoTargetWithRetries } from "./gotoWithRetries.js";

/**
 * Extract price from page safely
 */
export async function extractPrice(page) {
  function parsePrice(text) {
    const cleaned = text.replace(/[^\d.]/g, "");
    const value = parseFloat(cleaned);
    return isNaN(value) ? null : value;
  }

  let currentPrice = null;
  let originalPrice = null;

  try {
    await page.waitForSelector('span[data-test="product-price"]', { timeout: 8000 });
    const currentPriceText = await page.$eval('span[data-test="product-price"]', el => el.textContent);
    currentPrice = parsePrice(currentPriceText);
  } catch (err) {
    console.warn("⚠️ Could not extract current price:", err.message);
  }

  try {
    const originalPriceText = await page.$eval('span.h-text-line-through', el => el.textContent);
    originalPrice = parsePrice(originalPriceText);
  } catch {
    originalPrice = null; // Optional
  }

  return {
    currentPrice: currentPrice ?? 0,
    originalPrice
  };
}

export async function extractTargetProductData(page, url) {
  try {
    await gotoTargetWithRetries(page, url);
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

    // 4. Compile main product row
    const productRow = {
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
    };

    const extraImages = imageHandles.slice(1).map(src => ({
      Handle: handle,
      "Image Src": src
    }));

    return { productRow, extraImages };
  } catch (error) {
    console.error(`❌ Error processing ${url}:`, error.message);
    throw error;
  }
}

// Helper: extract title
async function extractTitle(page, fallbackTitle) {
  try {
    return await page.$eval(
      'h1[data-test="product-title"]',
      el => el.textContent.trim()
    );
  } catch {
    return fallbackTitle?.replace(/_/g, " ") || "";
  }
}

// Helper: extract breadcrumbs
async function extractBreadcrumbs(page) {
  try {
    return await page.$$eval(
      'a[data-test="@web/Breadcrumbs/BreadcrumbLink"]',
      anchors => anchors.map(a => a.textContent.trim()).filter(Boolean).join(",")
    );
  } catch {
    return "";
  }
}

// Helper: extract all images
async function extractImages(page) {
  try {
    return await page.$$eval(
      'div.styles_zoomableImage__R_OOf img',
      imgs => imgs.map(img => img.src).filter(Boolean)
    );
  } catch {
    return [];
  }
}

// helpers/extractors.js
import { formatHandleFromUrl, extractSKU, calculatePrices } from "./formatters.js";
import { getDescription } from "./description.js";
import { SELECTORS, DEFAULT_VALUES } from "../constants.js";
import { gotoWithRetries } from "./gotoWithRetries.js";

export async function extractPrice(page) {
  try {
    const currentPrice = await page.$eval(
      SELECTORS.PRODUCT.CURRENT_PRICE,
      el => parseFloat(el.textContent.replace(/[^\d.]/g, ''))
    ).catch(() => null);

    const originalPrice = await page.$eval(
      SELECTORS.PRODUCT.ORIGINAL_PRICE,
      el => parseFloat(el.textContent.replace(/[^\d.]/g, ''))
    ).catch(() => null);

    return { 
      currentPrice,
      originalPrice: originalPrice || null // Don't fallback to currentPrice
    };
  } catch (error) {
    console.error("⚠️ Price extraction failed:", error.message);
    return { currentPrice: null, originalPrice: null };
  }
}

export async function extractCartierProductData(page, url) {
  try {
    await gotoWithRetries(page, url);
    console.info("✅ Page loaded, waiting for stability...");
    await page.waitForTimeout(3000);

    const handle = formatHandleFromUrl(url);
    const sku = extractSKU(url);
    const title = await page.$eval(
      SELECTORS.PRODUCT.TITLE,
      el => el.textContent.trim()
    ).catch(() => handle?.replace(/_/g, " ") || "");

    const breadcrumbs = await page.$$eval(
      SELECTORS.BREADCRUMBS.LINKS,
      anchors => anchors.map(a => a.textContent.trim()).filter(Boolean).join(",")
    ).catch(() => "");

    const description = await getDescription(page);
    const { currentPrice, originalPrice } = await extractPrice(page);
    const { variantPrice, compareAtPrice } = calculatePrices(currentPrice, originalPrice);

    const imageHandles = await page.$$eval(
      SELECTORS.IMAGE.SRC,
      imgs => imgs.map(img => img.src).filter(Boolean)
    ).catch(() => []);

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
      "Variant Fulfillment Service": DEFAULT_VALUES.FULFILLMENT_SERVICE,
      "Variant Inventory Policy": DEFAULT_VALUES.INVENTORY_POLICY,
      "Variant Inventory Tracker": DEFAULT_VALUES.INVENTORY_TRACKER,
      Status: DEFAULT_VALUES.STATUS,
      Published: DEFAULT_VALUES.PUBLISHED,
      "product.metafields.custom.original_product_url": url,
    };

    const extraImages = imageHandles.slice(1).map(src => ({
      Handle: handle,
      "Image Src": src,
    }));

    return { productRow, extraImages };
  } catch (error) {
    console.error(`❌ Error extracting data from ${url}:`, error);
    throw error;
  }
}
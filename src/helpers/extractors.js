import {
  formatHandleFromUrl,
  extractSKU,
  calculatePrices,
} from "./formatters.js";
import { getDescription } from "./description.js";
import { SELECTORS, DEFAULT_VALUES } from "./constants.js";
import { gotoWithRetries } from "./gotoWithRetries.js";

export async function extractCartierProductData(page, url) {
  try {
    await gotoWithRetries(page, url);
    console.info("✅ Page loaded, waiting for stability...");
    await page.waitForTimeout(3000);

    const handle = formatHandleFromUrl(url);
    const sku = extractSKU(url);

    const title = await page
      .$eval(SELECTORS.TITLE, (el) => el.innerText.trim())
      .catch(() => handle.replace(/_/g, " "));

    const breadcrumbs = await page
      .$$eval(
        SELECTORS.BREADCRUMB_ITEMS,
        (anchors) =>
          anchors
            .map((a) => a.textContent.trim())
            .filter((text) => text && ! />/.test(text))
            .join(",")
      )
      .catch(() => "");

    const description = await getDescription(page);
    const { currentPrice, originalPrice } = await extractPrice(page);
    const { variantPrice, compareAtPrice } = calculatePrices(currentPrice, originalPrice);

    const imageHandles = await page
      .$$eval(
        SELECTORS.IMAGE_GALLERY_IMAGES,
        (imgs) => imgs.map((img) => img.src).filter(Boolean)
      )
      .catch(() => []);

    const productRow = {
      Handle: handle,
      Title: title,
      "Body (HTML)": description,
      Vendor: DEFAULT_VALUES.VENDOR,
      Type: DEFAULT_VALUES.TYPE,
      Tags: breadcrumbs,
      "Variant SKU": sku,
      "Cost per item": currentPrice,
      "Original Price": originalPrice,  // Separate original price field
      "Variant Price": variantPrice,
      "Variant Compare At Price": compareAtPrice,
      "Image Src": imageHandles[0] || "",
      "Variant Fulfillment Service": DEFAULT_VALUES.FULFILLMENT_SERVICE,
      "Variant Inventory Policy": DEFAULT_VALUES.INVENTORY_POLICY,
      "Variant Inventory Tracker": DEFAULT_VALUES.INVENTORY_TRACKER,
      Status: DEFAULT_VALUES.STATUS,
      Published: DEFAULT_VALUES.PUBLISHED,
      "product.metafields.custom.original_prodect_url": url,
    };

    const extraImages = imageHandles.slice(1).map((src) => ({
      Handle: handle,
      "Image Src": src,
    }));

    return { productRow, extraImages };
  } catch (error) {
    console.error(`Error extracting data from ${url}:`, error);
    throw error;
  }
}

export async function extractPrice(page) {
  const container = await page.$(SELECTORS.PRICE_CONTAINER);

  let currentPrice = null;
  let originalPrice = null;

  if (container) {
    currentPrice = await container.$eval(SELECTORS.PRICE, el =>
      parseFloat(el.textContent.replace(/[^\d.]/g, ''))
    ).catch(() => null);

    // Try to find original price if available (strikethrough price)
    originalPrice = await container.$eval('span.h-text-line-through', el =>
      parseFloat(el.textContent.replace(/[^\d.]/g, '')))
    .catch(() => null);
  }

  return { 
    currentPrice, 
    originalPrice: originalPrice || currentPrice 
  };
}
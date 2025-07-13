// helpers/extractors.js
import { formatHandleFromUrl, extractSKU, calculatePrices } from "./formatters.js";
import { getDescription } from "./description.js";
import { SELECTORS, DEFAULT_VALUES } from "./constants.js";
import { gotoWithRetries } from "./gotoWithRetries.js";

export async function extractPrice(page) {
  try {
    // Extract current price (sale price)
    const currentPrice = await page.$eval(
      SELECTORS.PRODUCT.CURRENT_PRICE,
      el => {
        const priceText = el.textContent.trim();
        return parseFloat(priceText.replace(/[^\d.]/g, ''));
      }
    ).catch(() => null);

    // Extract original price (regular price)
    const originalPrice = await page.$eval(
      SELECTORS.PRODUCT.ORIGINAL_PRICE,
      el => {
        const priceText = el.textContent.trim();
        return parseFloat(priceText.replace(/[^\d.]/g, ''));
      }
    ).catch(() => null);

    // Fallback if direct selectors fail
    if (!currentPrice) {
      const priceContainer = await page.$(SELECTORS.PRODUCT.PRICE_CONTAINER);
      if (priceContainer) {
        const priceText = await priceContainer.evaluate(el => el.textContent);
        const matches = priceText.match(/\$\d+\.\d{2}/g);
        if (matches && matches.length > 0) {
          return {
            currentPrice: parseFloat(matches[0].replace(/[^\d.]/g, '')),
            originalPrice: matches[1] ? parseFloat(matches[1].replace(/[^\d.]/g, '')) : null
          };
        }
      }
    }

    if (!currentPrice) {
      throw new Error('Could not extract valid current price');
    }

    return { currentPrice, originalPrice };
  } catch (error) {
    console.error('⚠️ Price extraction failed:', error.message);
    throw error;
  }
}
export async function extractTargetProductData(page, url) {
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
    
    if (currentPrice === null) {
      throw new Error('Could not extract valid current price');
    }

    const { variantPrice, compareAtPrice } = calculatePrices(
      currentPrice, 
      originalPrice
    );

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
    console.error(`❌ Error processing ${url}:`, error.message);
    throw error; // Or return null/error object as needed
    }}
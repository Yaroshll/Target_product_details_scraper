// helpers/extractors.js
import { formatHandleFromUrl, extractSKU, calculatePrices } from "./formatters.js";
import { getDescription } from "./description.js";
import { SELECTORS, DEFAULT_VALUES } from "./constants.js";
import { gotoWithRetries } from "./gotoWithRetries.js";

export async function extractPrice(page) {
  const defaultPrice = 0; // Default value when extraction fails
  
  try {
    // Current Price Extraction
    let currentPrice = await page.$eval(
      SELECTORS.PRODUCT.CURRENT_PRICE,
      el => {
        const priceText = el.textContent.trim();
        const priceValue = parseFloat(priceText.replace(/[^\d.]/g, ''));
        return isNaN(priceValue) ? null : priceValue;
      }
    ).catch(() => null);

    // Original Price Extraction
    let originalPrice = await page.$eval(
      SELECTORS.PRODUCT.ORIGINAL_PRICE,
      el => {
        const priceText = el.textContent.trim();
        const priceValue = parseFloat(priceText.replace(/[^\d.]/g, ''));
        return isNaN(priceValue) ? null : priceValue;
      }
    ).catch(() => null);

    // Fallback: Try extracting from JSON-LD data
    if (!currentPrice) {
      try {
        const jsonLd = await page.$eval(
          'script[type="application/ld+json"]',
          el => {
            try {
              return JSON.parse(el.textContent);
            } catch {
              return null;
            }
          }
        );
        currentPrice = jsonLd?.offers?.price || null;
      } catch {
        // Silently fail and use default
      }
    }

    // Validate and return prices
    return {
      currentPrice: validatePrice(currentPrice) ? currentPrice : defaultPrice,
      originalPrice: validatePrice(originalPrice) ? originalPrice : null
    };

  } catch (error) {
    console.error('⚠️ Price extraction failed, using defaults:', error.message);
    return {
      currentPrice: defaultPrice,
      originalPrice: null
    };
  }
}

function validatePrice(price) {
  return price !== null && !isNaN(price) && price >= 0;
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
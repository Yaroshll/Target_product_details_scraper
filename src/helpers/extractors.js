
// helpers/extractors.js
import { formatHandleFromUrl, extractSKU, calculatePrices } from "./formatters.js";
import { getDescription } from "./description.js";
import { SELECTORS, DEFAULT_VALUES } from "./constants.js";
import { gotoTargetWithRetries } from "./gotoWithRetries.js";

export async function extractTargetProductData(page, url) {
  try {
    await gotoTargetWithRetries(page, url);
    console.info("✅ Page loaded, waiting for stability...");
    await page.waitForTimeout(5000); // Increased initial wait time

    // 1. Extract basic identifiers
    const handle = formatHandleFromUrl(url);
    const sku = extractSKU(url);
    const title = await extractTitle(page, handle);

    // 2. Extract pricing data with more resilience
    const { currentPrice, originalPrice } = await extractPriceWithRetry(page);
    const { variantPrice, compareAtPrice } = calculatePrices(currentPrice, originalPrice);

    // 3. Extract other product data
    const breadcrumbs = await extractBreadcrumbs(page);
    const description = await getDescription(page);
    const imageHandles = await extractImages(page);

    // 4. Extract variants with improved handling
    const variants = await extractVariantsWithRetry(page);

    // 5. Compile main product row
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

    // Add variant options if they exist
    if (variants.options.length > 0) {
      productRow["Option1 Name"] = variants.options[0].name;
      productRow["Option1 Value"] = variants.options[0].value;
    }
    if (variants.options.length > 1) {
      productRow["Option2 Name"] = variants.options[1].name;
      productRow["Option2 Value"] = variants.options[1].value;
    }

    const extraImages = imageHandles.slice(1).map(src => ({
      Handle: handle,
      "Image Src": src
    }));

    // Add variant rows
    const variantRows = variants.values.map(variant => ({
      Handle: handle,
      "Option1 Value": variant.option1,
      "Option2 Value": variant.option2,
      "Variant SKU": variant.sku || `${sku}-${variant.option1}-${variant.option2}`.replace(/\s+/g, '-').toLowerCase(),
      "Variant Price": variantPrice, // Use the same price for all variants
      "Variant Compare At Price": compareAtPrice,
      "Image Src": variant.isActive ? imageHandles[0] : "", // Only include image for active variant
      ...DEFAULT_VALUES
    }));

    return { productRow, extraImages, variantRows };
  } catch (error) {
    console.error(`❌ Error processing ${url}:`, error.message);
    throw error;
  }
}

// Improved price extraction with retries
async function extractPriceWithRetry(page, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await page.waitForSelector('span[data-test="product-price"]', { timeout: 10000 });
      const currentPriceText = await page.$eval('span[data-test="product-price"]', el => el.textContent);
      const currentPrice = parsePrice(currentPriceText);

      let originalPrice = null;
      try {
        const originalPriceText = await page.$eval('span.h-text-line-through', el => el.textContent);
        originalPrice = parsePrice(originalPriceText);
      } catch {
        originalPrice = null;
      }

      return { currentPrice: currentPrice ?? 0, originalPrice };
    } catch (error) {
      if (i === retries - 1) throw error;
      await page.waitForTimeout(2000);
    }
  }
  return { currentPrice: 0, originalPrice: null };
}

// Improved variant extraction
async function extractVariantsWithRetry(page, retries = 3) {
  const options = [];
  const values = [];
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Extract variant options (like Size, Color)
      const optionHeaders = await page.$$eval('.styles_headerSpan__wl9MD', headers => 
        headers.map(h => h.textContent.trim())
      );
      
      if (optionHeaders.length > 0) {
        options.push({ name: optionHeaders[0], value: '' });
      }
      if (optionHeaders.length > 1) {
        options.push({ name: optionHeaders[1], value: '' });
      }

      // Extract variant values
      const variantElements = await page.$$('.styles_headerWrapper__Xzdtg');
      for (const variantEl of variantElements) {
        // Get all direct child spans that aren't the header span
        const spans = await variantEl.$$eval('span:not(.styles_headerSpan__wl9MD)', els => 
          els.map(el => el.textContent.trim())
        );
        
        const option1 = spans[0] ? spans[0].split('-')[0].trim() : '';
        const isActive = await variantEl.evaluate(el => 
          el.classList.contains('is-active') || 
          el.getAttribute('aria-current') === 'true'
        );
        
        let option2 = '';
        if (optionHeaders.length > 1 && spans.length > 1) {
          option2 = spans[1] ? spans[1].split('-')[0].trim() : '';
        }

        values.push({
          option1,
          option2,
          isActive,
          sku: '' // Will be generated later
        });
      }

      // If we got any variants, return them
      if (values.length > 0) {
        return { options, values };
      }
    } catch (error) {
      console.warn(`⚠️ Variant extraction attempt ${attempt + 1} failed:`, error.message);
      if (attempt === retries - 1) {
        console.warn('⚠️ Returning empty variants after retries');
        return { options: [], values: [] };
      }
      await page.waitForTimeout(2000);
    }
  }
  return { options: [], values: [] };
}

function parsePrice(text) {
  if (!text) return null;
  const cleaned = text.replace(/[^\d.]/g, "");
  const value = parseFloat(cleaned);
  return isNaN(value) ? null : value;
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

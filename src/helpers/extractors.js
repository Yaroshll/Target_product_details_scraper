import { formatHandleFromUrl, extractSKU, calculatePrices } from "./formatters.js";
import { getDescription } from "./description.js";
import { SELECTORS, DEFAULT_VALUES } from "./constants.js";

export async function extractPrice(page) {
  try {
    // More resilient price extraction with multiple fallbacks
    const priceText = await page.evaluate(() => {
      // Try current price first
      const priceEl = document.querySelector('[data-test="product-price"]') || 
                     document.querySelector('[data-test="current-price"]') ||
                     document.querySelector('.price__current-value');
      return priceEl?.textContent.trim() || '';
    });
    
    const originalPriceText = await page.evaluate(() => {
      const originalEl = document.querySelector('.h-text-line-through') || 
                         document.querySelector('[data-test="original-price"]');
      return originalEl?.textContent.trim() || '';
    });

    return {
      currentPrice: priceText ? parseFloat(priceText.replace(/[^\d.]/g, '')) : 0,
      originalPrice: originalPriceText ? parseFloat(originalPriceText.replace(/[^\d.]/g, '')) : null
    };
  } catch (error) {
    console.error('⚠️ Price extraction failed:', error.message);
    return { currentPrice: 0, originalPrice: null };
  }
}

export async function extractImages(page, handle) {
  try {
    // More flexible image extraction
    const images = await page.evaluate(() => {
      const results = [];
      // Main image
      const mainImg = document.querySelector('div.styles_zoomableImage__R_OOf img') || 
                     document.querySelector('div[data-test="image-container"] img');
      if (mainImg?.src) results.push(mainImg.src);
      
      // Additional images
      const thumbnails = Array.from(document.querySelectorAll('button[data-test="thumbnail-button"] img'));
      thumbnails.forEach(img => {
        if (img.src) results.push(img.src);
      });
      
      return results;
    });

    return {
      mainImage: images[0] || '',
      additionalImages: images.slice(1).map(src => ({ Handle: handle, "Image Src": src }))
    };
  } catch (error) {
    console.error("⚠️ Image extraction failed:", error.message);
    return { mainImage: '', additionalImages: [] };
  }
}

export async function extractTargetProductData(page, url) {
  try {
    console.log(`🌐 Loading: ${url}`);
    
    // More resilient navigation with multiple checks
    await page.goto(url, { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });

    // Wait for any sign of page loading
    await Promise.race([
      page.waitForSelector('body', { state: 'attached', timeout: 20000 }),
      page.waitForSelector('div[id^="pageBody"]', { timeout: 20000 }),
      page.waitForTimeout(10000)
    ]);

    // Check for error pages or redirects
    const isErrorPage = await page.evaluate(() => {
      return document.querySelector('.error-page') !== null;
    });
    if (isErrorPage) throw new Error('Error page detected');

    // Extract data with more flexible selectors
    const handle = formatHandleFromUrl(url) || '';
    const sku = extractSKU(url) || '';
    
    const title = await page.evaluate(() => {
      const titleEl = document.querySelector('h1[data-test="product-title"]') ||
                     document.querySelector('h1.product-title');
      return titleEl?.textContent.trim() || '';
    });

    const { currentPrice, originalPrice } = await extractPrice(page);
    const { variantPrice, compareAtPrice } = calculatePrices(currentPrice, originalPrice);

    const breadcrumbs = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav[aria-label="Breadcrumbs"] a'));
      return links.map(a => a.textContent.trim()).filter(t => t).join(',');
    }).catch(() => '');

    const description = await getDescription(page);
    const { mainImage, additionalImages } = await extractImages(page, handle);

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
        "Image Src": mainImage,
        ...DEFAULT_VALUES,
        "product.metafields.custom.original_product_url": url
      },
      extraImages: additionalImages
    };

  } catch (error) {
    console.error(`❌ Error processing ${url}:`, error.message);
    try {
      await page.screenshot({ path: `error-${Date.now()}.png` });
    } catch (e) {
      console.error('Could not take screenshot:', e.message);
    }
    throw error;
  }
}
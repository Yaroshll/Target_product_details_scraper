import { formatHandleFromUrl, extractSKU, calculatePrices } from "./formatters.js";
import { getDescription } from "./description.js";
import { SELECTORS, DEFAULT_VALUES } from "./constants.js";
import { gotoWithRetries } from "./gotoWithRetries.js";

export async function extractTargetProductData(page, url) {
  try {
    await gotoWithRetries(page, url);
    await page.waitForTimeout(3000);

    const handle = formatHandleFromUrl(url);
    const sku = extractSKU(url);

    const title = await page.$eval(SELECTORS.PRODUCT.TITLE, el => el.innerText.trim()).catch(() => handle);

    const breadcrumbs = await page.$$eval(
      SELECTORS.BREADCRUMBS.LINKS,
      anchors => anchors.map(a => a.textContent.trim()).filter(Boolean).join(",")
    ).catch(() => "");

    const description = await getDescription(page);

    const currentPrice = await page.$eval(SELECTORS.PRODUCT.CURRENT_PRICE, el =>
      parseFloat(el.innerText.replace(/[^\d.]/g, ""))
    ).catch(() => 0);

    const originalPrice = await page.$eval(SELECTORS.PRODUCT.ORIGINAL_PRICE, el =>
      parseFloat(el.innerText.replace(/[^\d.]/g, ""))
    ).catch(() => null);

    const { variantPrice, compareAtPrice } = calculatePrices(currentPrice, originalPrice);

    const imageHandles = await page.$$eval(
      SELECTORS.IMAGE.ZOOMABLE,
      imgs => imgs.map(img => img.src).filter(Boolean)
    ).catch(() => []);

    return {
      productRow: {
        Handle: handle,
        Title: title,
        "Body (HTML)": description,
        Vendor: DEFAULT_VALUES.VENDOR,
        Type: breadcrumbs.split(",").pop()?.trim() || DEFAULT_VALUES.TYPE,
        Tags: breadcrumbs,
        "Variant SKU": sku,
        "Cost per item": currentPrice,
        "Original Price": originalPrice,
        "Variant Price": variantPrice,
        "Variant Compare At Price": compareAtPrice,
        "Image Src": imageHandles[0] || "",
        ...DEFAULT_VALUES,
        "product.metafields.custom.original_product_url": url
      },
      extraImages: imageHandles.slice(1).map(src => ({
        Handle: handle,
        "Image Src": src
      }))
    };
  } catch (err) {
    console.error(`❌ Failed to extract product: ${err.message}`);
    throw err;
  }
}

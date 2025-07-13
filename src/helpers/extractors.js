import { formatHandleFromUrl, extractSKU, calculatePrices } from "./formatters.js";
import { getDescription } from "./description.js";
import { SELECTORS, DEFAULT_VALUES } from "./constants.js";
import { gotoTargetWithRetries } from "./gotoWithRetries.js";

export async function extractTargetProductData(page, url) {
  await gotoTargetWithRetries(page, url);
  await page.waitForTimeout(3000);

  const handle = formatHandleFromUrl(url);
  const sku = extractSKU(url);
  const title = await page.$eval(SELECTORS.PRODUCT.TITLE, el => el.innerText.trim()).catch(() => handle);

  const tags = await page.$$eval(SELECTORS.BREADCRUMBS.LINKS, els =>
    els.map(el => el.innerText.trim()).filter(Boolean).join(",")
  ).catch(() => "");

  const bodyHTML = await getDescription(page);

  const currentPrice = await page.$eval(
    SELECTORS.PRODUCT.CURRENT_PRICE,
    el => parseFloat(el.innerText.replace(/[^\d.]/g, ""))
  ).catch(() => 0);

  const originalPrice = await page.$eval(
    SELECTORS.PRODUCT.ORIGINAL_PRICE,
    el => parseFloat(el.innerText.replace(/[^\d.]/g, ""))
  ).catch(() => null);

  const { variantPrice, compareAtPrice } = calculatePrices(currentPrice, originalPrice);

  const images = await page.$$eval(
    SELECTORS.IMAGE.ZOOMABLE,
    imgs => imgs.map(img => img.src).filter(Boolean)
  ).catch(() => []);

  // Build main row + extras
  const productRow = {
    Handle: handle,
    Title: title,
    "Body (HTML)": bodyHTML,
    Vendor: DEFAULT_VALUES.VENDOR,
    Type: tags.split(",").pop().trim() || DEFAULT_VALUES.TYPE,
    Tags: tags,
    "Variant SKU": sku,
    "Cost per item": currentPrice,
    "Original Price": originalPrice,
    "Variant Price": variantPrice,
    "Variant Compare At Price": compareAtPrice,
    "Image Src": images[0] || "",
    ...DEFAULT_VALUES,
    "product.metafields.custom.original_product_url": url
  };

  const extraImages = images.slice(1).map(src => ({
    Handle: handle,
    "Image Src": src
  }));

  return { productRow, extraImages };
}

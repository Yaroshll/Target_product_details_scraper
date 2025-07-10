// helpers/extractors.js
import {
  formatHandleFromUrl,
  extractSKU,
  calculatePrices,
} from "./formatters.js";
import { getDescription } from "./description.js";
import { SELECTORS } from "./constants.js";
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

    // Clean breadcrumb tags
    const breadcrumbs = await page
      .$$eval(BREADCRUMB_ITEMS, (anchors) =>
        anchors
          .map((a) => a.textContent.trim())
          .filter((text) => text && !/>/.test(text))
          .join(",")
      )
      .catch(() => "");

    const description = await getDescription(page);

    const { currentPrice, originalPrice } = await extractPrice(page);
    const { variantPrice, compareAtPrice } = calculatePrices(currentPrice);

    // Image extraction
    const imageHandles = await page
      .$$eval(IMAGE_GALLERY_IMAGES, (imgs) =>
        imgs.map((img) => img.src).filter(Boolean)
      )
      .catch(() => []);

    const productRow = {
      Handle: handle,
      Title: title,
      "Body (HTML)": description,
      Vendor: "cartier",
      Type: "Jewellery",
      Tags: breadcrumbs,
      "Variant SKU": sku,
      "Cost per item": currentPrice,
      "Original Price": originalPrice,
      "Variant Price": variantPrice,
      "Variant Compare At Price": compareAtPrice,
      "Image Src": imageHandles[0] || "",
      "Variant Fulfillment Service": "manual",
      "Variant Inventory Policy": "deny",
      "Variant Inventory Tracker": "shopify",
      Status: "Active",
      Published: "TRUE",
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
  const container = await page.$("main#pageBodyContainer");

  let currentPrice = null;
  let originalPrice = null;

  if (container) {
    currentPrice = await container
      .$eval("product-price", (el) =>
        parseFloat(el.textContent.replace(/[^\d.]/g, ""))
      )
      .catch(() => null);

    originalPrice = await container
      .$eval("span.h-text-line-through", (el) =>
        parseFloat(el.textContent.replace(/[^\d.]/g, ""))
      )
      .catch(() => null);
  }

  return { currentPrice, originalPrice };
}

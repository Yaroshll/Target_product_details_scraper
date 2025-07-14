import { extractSKU } from './formatters.js';

export async function extractVariants(page, handle) {
  const variantRows = [];
  const extraImages = [];

  const variantButtons = await page.$$('ul[data-test="swatches"] li button');
  for (const btn of variantButtons) {
    const isSelected = await btn.evaluate(b => b.getAttribute('aria-pressed') === 'true');
    if (!isSelected) {
      await btn.click();
      await page.waitForTimeout(3000);
    }

    // Extract Color or Size
    const color = await page.$eval(
      'div.styles_headerWrapper__Xzdtg:has(span:has-text("Color"))',
      el => el.innerText.replace("Color", "").trim()
    ).catch(() => "");

    const sizeText = await page.$eval(
      'div.styles_headerWrapper__Xzdtg:has(span:has-text("Size"))',
      el => el.innerText.replace("Size", "").split(" - ")[0].trim()
    ).catch(() => "");

    // Get variant image (first one)
    const variantImg = await page.$eval(
      'div.styles_zoomableImage__R_OOf img',
      img => img.src
    ).catch(() => "");

    // Only save color variant images
    if (color) {
      extraImages.push({
        Handle: handle,
        "Image Src": variantImg,
        "Option1 Name": "Color",
        "Option1 Value": color,
        "Option2 Name": "Size",
        "Option2 Value": sizeText || ""
      });
    }

    // All variants get a CSV row (image or not)
    variantRows.push({
      Handle: handle,
      "Variant SKU": extractSKU(page.url()),
      "Option1 Name": color ? "Color" : "Size",
      "Option1 Value": color || "",
      "Option2 Name": sizeText ? "Size" : "",
      "Option2 Value": sizeText || "",
    });
  }

  return {
    main: {
      "Option1 Name": "",
      "Option1 Value": "",
      "Option2 Name": "",
      "Option2 Value": ""
    },
    variantRows,
    extraImages
  };
}

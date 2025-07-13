// helpers/description.js
import { SELECTORS } from "./constants";

export async function getDescription(page) {
  try {
    const mainDesc = await page.$eval(
      SELECTORS.PRODUCT.DESCRIPTION.MAIN, 
      el => el.textContent.trim()
    ).catch(() => "");

    const detailsContainer = await page.$(SELECTORS.PRODUCT.DESCRIPTION.DETAILS.CONTAINER);
    let detailsText = "";

    if (detailsContainer) {
      const header = await detailsContainer.$eval(
        SELECTORS.PRODUCT.DESCRIPTION.DETAILS.HEADER, 
        el => el.textContent.trim()
      ).catch(() => "");

      const items = await detailsContainer.$$eval(
        SELECTORS.PRODUCT.DESCRIPTION.DETAILS.ITEMS,
        items => items.map(item => item.textContent.trim())
      ).catch(() => []);

      if (header) detailsText += `\n\n${header}:`;
      if (items.length) detailsText += `\n${items.map(item => `• ${item}`).join('\n')}`;
    }

    return `${mainDesc}${detailsText}`.trim();
  } catch (error) {
    console.error("⚠️ Description extraction failed:", error.message);
    return "";
  }
}
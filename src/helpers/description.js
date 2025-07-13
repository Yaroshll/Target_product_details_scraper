// helpers/description.js
import { SELECTORS } from "./constants.js";

export async function getDescription(page) {
  try {
    // Main description
    const mainDesc = await page.$eval(
      SELECTORS.PRODUCT.DESCRIPTION.MAIN,
      el => el.innerHTML.trim()
    ).catch(() => '');

    // Fit & Style section
    const detailsContainer = await page.$(SELECTORS.PRODUCT.DESCRIPTION.DETAILS.CONTAINER);
    let detailsHTML = '';

    if (detailsContainer) {
      const header = await detailsContainer.$eval(
        SELECTORS.PRODUCT.DESCRIPTION.DETAILS.HEADER,
        el => el.textContent.trim()
      ).catch(() => '');

      const items = await detailsContainer.$$eval(
        SELECTORS.PRODUCT.DESCRIPTION.DETAILS.ITEMS,
        items => items.map(item => item.textContent.trim())
      ).catch(() => []);

      if (header) detailsHTML += `<h2>${header}</h2>`;
      if (items.length) detailsHTML += `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
    }

    return `${mainDesc}${detailsHTML}`.trim();
  } catch (error) {
    console.error("⚠️ Description extraction failed:", error.message);
    return "";
  }
}
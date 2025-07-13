import { SELECTORS } from "./constants.js";

export async function getDescription(page) {
  try {
    // Click the description button if it exists
    try {
      await page.click(SELECTORS.PRODUCT.DESCRIPTION.BUTTON);
      await page.waitForTimeout(1000); // Wait for animation
    } catch {
      console.log("Description button not found or not clickable");
    }

    // Main description
    const mainDesc = await page.$eval(
      SELECTORS.PRODUCT.DESCRIPTION.MAIN,
      el => el.innerHTML.trim()
    ).catch(() => '');

    // Fit & Style section
    let detailsHTML = '';
    const detailsContainer = await page.$(SELECTORS.PRODUCT.DESCRIPTION.DETAILS.CONTAINER);
    
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
import { SELECTORS } from "./constants.js";

export async function getDescription(page) {
  try {
    const main = await page.$eval(
      SELECTORS.PRODUCT.DESCRIPTION.MAIN,
      el => el.innerText.trim()
    ).catch(() => "");

    const header = await page.$eval(
      SELECTORS.PRODUCT.DESCRIPTION.DETAILS.HEADER,
      el => el.innerText.trim()
    ).catch(() => "");

    const items = await page.$$eval(
      SELECTORS.PRODUCT.DESCRIPTION.DETAILS.ITEMS,
      els => els.map(el => el.innerText.trim())
    ).catch(() => []);

    let bulletList = "";
    if (items.length) {
      bulletList = `\n\n${header}:\n${items.map(i => `• ${i}`).join("\n")}`;
    }

    return `${main}${bulletList}`.trim();
  } catch (err) {
    console.error("❌ Failed to extract description:", err.message);
    return "";
  }
}

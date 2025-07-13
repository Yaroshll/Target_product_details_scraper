import { SELECTORS } from "./constants.js";

export async function getDescription(page) {
  // 1. Click to reveal description
  await page.$eval(SELECTORS.PRODUCT.DESCRIPTION_BUTTON, btn => btn.click()).catch(() => {});

  // 2. Extract main description
  const main = await page.$eval(
    SELECTORS.PRODUCT.DESCRIPTION_CONTENT,
    el => el.innerHTML.trim()
  ).catch(() => "");

  // 3. Extract Fit & style section
  const header = await page.$eval(
    SELECTORS.PRODUCT.FIT_STYLE_CONTAINER + " " + SELECTORS.PRODUCT.FIT_STYLE_HEADER,
    el => el.innerText.trim()
  ).catch(() => "");

  const items = await page.$$eval(
    SELECTORS.PRODUCT.FIT_STYLE_CONTAINER + " " + SELECTORS.PRODUCT.FIT_STYLE_ITEMS,
    els => els.map(el => el.innerText.trim())
  ).catch(() => []);

  let fitStyleHTML = "";
  if (header && items.length) {
    const listItems = items.map(i => `<li>${i}</li>`).join("");
    fitStyleHTML = `<h2>${header}</h2><ul>${listItems}</ul>`;
  }

  return (main + "\n" + fitStyleHTML).trim();
}

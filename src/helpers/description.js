import { SELECTORS } from "./constants.js";

export async function getDescription(page) {
  let fullDescription = "";
  try {
    // Get the full visible description including text inside <span>
    const description = await page.$eval(    DESCRIPTION_CONTENT  ,  (el) => el.innerText.trim()
  ).catch(() => "");
    
  
    const description_h1 = await page
      .$eval(DESCRIPTION_H1, (el) => el.innerHTML.trim())
      .catch(() => "");
    
    const description_li = await page
      .$eval(DESCRIPTION_LI, (el) => el.innerHTML.trim())
      .catch(() => "");

    // Combine both
    fullDescription = `${description}\n\n${description_h1}\n ${description_li}`;
    return fullDescription;
  } catch (err) {
    console.warn("⚠️ Description extraction failed:", err.message);
  }
}

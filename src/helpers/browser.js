// helpers/browser.js
import { chromium } from 'playwright';

export async function launchBrowser() {
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
    args: [
     '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-sandbox',
      '--disable-http2',
      '--ignore-certificate-errors'
    ],
    timeout: 12000
  });
  return browser;
}

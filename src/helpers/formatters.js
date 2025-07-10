// helpers/formatters.js

export function formatHandleFromUrl(url) {
  try {
    const pathParts = url.pathname.split('/');
    const baseHandle = pathParts[2]; // e.g., 'girls-39-sleeveless-tank-dress-cat-38-jack-8482'
    const sku = extractSKU(url);

    if (!baseHandle || !sku) return null;

    return `${baseHandle}_${sku}`;
  } catch (error) {
    console.error('❌ Invalid URL for handle extraction:', error.message);
    return null;
  }
}

export function extractSKU(url) {
    try {
    const sku = url.searchParams.get('preselect');
    return sku || null;
  } catch (error) {
    console.error('❌ Invalid URL for SKU extraction:', error.message);
    return null;
  }
}

export function calculatePrices(cost) {
  const variantPrice = +(cost * 1.3).toFixed(2);
  const compareAtPrice = +(variantPrice * 1.2).toFixed(2);
  return { variantPrice, compareAtPrice };
}

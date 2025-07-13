// helpers/formatters.js
export function formatHandleFromUrl(url) {
  try {
    const urlObj = typeof url === 'string' ? new URL(url) : url;
    const pathParts = urlObj.pathname.split('/');
    const baseHandle = pathParts[2]?.replace(/-+$/, '');
    const sku = extractSKU(urlObj);

    if (!baseHandle || !sku) return null;

    // Format handle with underscore, lowercase, and remove special characters
    return `${baseHandle.replace(/[^\w-]/g, '')}_${sku}`.toLowerCase();
  } catch (error) {
    console.error('❌ Invalid URL for handle extraction:', error.message);
    return null;
  }
}

export function extractSKU(url) {
  try {
    const urlObj = typeof url === 'string' ? new URL(url) : url;
    const pathSku = urlObj.pathname.match(/\/A-(\d+)/)?.[1];
    const paramSku = urlObj.searchParams.get('preselect');
    return pathSku || paramSku || null;
  } catch (error) {
    console.error('❌ Invalid URL for SKU extraction:', error.message);
    return null;
  }
}

export function calculatePrices(currentPrice, originalPrice) {
  // Validate inputs
  if (currentPrice === null || isNaN(currentPrice)) {
    throw new Error('Invalid current price provided');
  }

  // Convert to numbers if they're strings
  const current = typeof currentPrice === 'string' 
    ? parseFloat(currentPrice.replace(/[^\d.]/g, '')) 
    : Number(currentPrice);

  const original = originalPrice 
    ? (typeof originalPrice === 'string' 
      ? parseFloat(originalPrice.replace(/[^\d.]/g, '')) 
      : Number(originalPrice))
    : null;

  // Calculate prices with proper validation
  const variantPrice = current ? +(current).toFixed(2) : 0;
  const compareAtPrice = original ? +(original).toFixed(2) : null;

  return { 
    variantPrice,
    compareAtPrice: compareAtPrice > variantPrice ? compareAtPrice : null
  };
}
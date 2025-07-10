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
  // Use original price if available, otherwise calculate compareAtPrice
  const variantPrice = +(currentPrice).toFixed(2);
  const compareAtPrice = originalPrice 
    ? +(originalPrice).toFixed(2)
    : +(currentPrice * 1.2).toFixed(2);
  
  return { 
    variantPrice,
    compareAtPrice: compareAtPrice > variantPrice ? compareAtPrice : null
  };
}
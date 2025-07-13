// helpers/formatters.js
export function formatHandleFromUrl(url) {
  try {
    const urlObj = typeof url === 'string' ? new URL(url) : url;
    const pathParts = urlObj.pathname.split('/');
    const baseHandle = pathParts[2]?.replace(/-+$/, '');
    const sku = extractSKU(urlObj);

    if (!baseHandle || !sku) return null;

    return `${baseHandle.replace(/[^\w-]/g, '')}_${sku}`.toLowerCase();
  } catch (error) {
    console.error('❌ Invalid URL for handle extraction:', error.message);
    return null;
  }
}

export function extractSKU(url) {
  try {
    const urlObj = typeof url === 'string' ? new URL(url) : url;
    return urlObj.pathname.match(/\/A-(\d+)/)?.[1] || 
           urlObj.searchParams.get('preselect') || 
           null;
  } catch (error) {
    console.error('❌ Invalid URL for SKU extraction:', error.message);
    return null;
  }
}

export function calculatePrices(currentPrice, originalPrice) {
  const validatedCurrent = currentPrice || 0;
  const validatedOriginal = originalPrice || null;
  
  return {
    variantPrice: +(validatedCurrent.toFixed(2)),
    compareAtPrice: validatedOriginal ? +(validatedOriginal.toFixed(2)) : null
  };
}
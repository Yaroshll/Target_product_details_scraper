// helpers/formatters.js

export function formatHandleFromUrl(url) {
  try {
    // Handle both URL objects and strings
    const urlObj = typeof url === 'string' ? new URL(url) : url;
    
    // Extract base handle from pathname (more reliable than searchParams)
    const pathParts = urlObj.pathname.split('/');
    const baseHandle = pathParts[2]; // e.g., 'girls-39-sleeveless-tank-dress-cat-38-jack-8482'
    
    // Use the more reliable A-XXXXX SKU from path rather than preselect parameter
    const sku = extractSKU(urlObj);

    if (!baseHandle || !sku) return null;

    // Format handle with underscore and lowercase
    return `${baseHandle.replace(/-+$/, '')}_${sku}`.toLowerCase();
  } catch (error) {
    console.error('❌ Invalid URL for handle extraction:', error.message);
    return null;
  }
}

export function extractSKU(url) {
  try {
    const urlObj = typeof url === 'string' ? new URL(url) : url;
    
    // First try to get SKU from the path (more reliable)
    const pathSku = urlObj.pathname.match(/\/A-(\d+)/)?.[1];
    
    // Fallback to preselect parameter if path SKU not found
    const paramSku = urlObj.searchParams.get('preselect');
    
    // Return whichever is available (path SKU takes priority)
    return pathSku || paramSku || null;
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

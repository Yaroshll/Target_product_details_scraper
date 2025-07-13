// helpers/constants.js
export const SELECTORS = {
  // Image selectors - updated with more specific selectors
  IMAGE: {
    CONTAINER: 'div[data-test="image-container"]', // More reliable than class-based
    SRC: 'div[data-test="image-container"] img', 
    THUMBNAILS: 'button[data-test="thumbnail-button"] img',
    ZOOMABLE: 'div.styles_zoomableImage__R_OOf img' // Alternative if needed
  },

  // Product info selectors - made more robust
  PRODUCT: {
    TITLE: 'h1[data-test="product-title"]',
     // Current price (sale price)
    CURRENT_PRICE: 'span[data-test="product-price"]',
    
    // Original price (regular price)
    ORIGINAL_PRICE: 'span.h-text-line-through',
    
    // Price container for fallback
    PRICE_CONTAINER: '[data-test="product-regular-price"]'
  },
    DESCRIPTION: {
      MAIN: '[data-test="item-details-description"]',
      DETAILS: {
        CONTAINER: '[data-test="product-details"], div.sc-6a3f6e8d-1',
        HEADER: 'h2:has(+ ul[data-test="features-list"])', // More semantic
        ITEMS: 'ul[data-test="features-list"] li, div.sc-6a3f6e8d-1 ul li' // Multiple selectors
      }
    }
  },

  // Breadcrumbs - improved selectors
  BREADCRUMBS: {
    CONTAINER: 'nav[aria-label="Breadcrumbs"]',
    ITEMS: '[data-test="breadcrumb-item"]', // More reliable than class-based
    LINKS: '[data-test="breadcrumb-link"]'
  },

  // Added new selectors that might be useful
  VARIANTS: {
    CONTAINER: '[data-test="variants-container"]',
    SELECTOR: 'select[data-test="variant-selector"]'
  }
};

export const DEFAULT_VALUES = {
  VENDOR: "Target",
  TYPE: "Clothing", 
  STATUS: "Active", 
  PUBLISHED: "TRUE", // Boolean instead of string
  FULFILLMENT_SERVICE: "manual",
  INVENTORY_POLICY: "deny",
  INVENTORY_TRACKER: "shopify",
  INVENTORY_QUANTITY: 100, // Added default quantity
  VARIANT_WEIGHT_UNIT: "kg" // Added weight unit
};

// Added timeout constants
export const TIMEOUTS = {
  PAGE_LOAD: 30000,
  ELEMENT_WAIT: 10000,
  NAVIGATION: 15000
};

// Added error messages
export const ERRORS = {
  SELECTOR_NOT_FOUND: "Selector not found",
  PRICE_PARSE_ERROR: "Could not parse price"
};
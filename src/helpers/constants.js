// helpers/constants.js
export const SELECTORS = {
  // Image selectors
  IMAGE: {
    CONTAINER: 'div[data-test="image-container"]',
    SRC: 'div[data-test="image-container"] img',
    THUMBNAILS: 'button[data-test="thumbnail-button"] img',
    ZOOMABLE: 'div.styles_zoomableImage__R_OOf img',
    FALLBACK: 'img[data-test*="image"]' // Additional fallback
  },

  // Product info selectors
  PRODUCT: {
    TITLE: 'h1[data-test="product-title"]',
    CURRENT_PRICE: [
      'span[data-test="product-price"]',
      'span[data-test="current-price"]',
      'span.price__current-value'
    ],
    ORIGINAL_PRICE: [
      'span.h-text-line-through',
      'span[data-test="original-price"]',
      'span.price__compare'
    ],
    PRICE_CONTAINER: '[data-test="product-regular-price"]',
    DESCRIPTION: {
      MAIN: '[data-test="item-details-description"]',
      DETAILS: {
        CONTAINER: '[data-test="product-details"], div.sc-6a3f6e8d-1',
        HEADER: 'h2:has(+ ul[data-test="features-list"])',
        ITEMS: 'ul[data-test="features-list"] li, div.sc-6a3f6e8d-1 ul li'
      }
    }
  },

  // Breadcrumb navigation
  BREADCRUMBS: {
    CONTAINER: 'nav[aria-label="Breadcrumbs"]',
    ITEMS: '[data-test="breadcrumb-item"]',
    LINKS: '[data-test="breadcrumb-link"]'
  },

  // Product variants
  VARIANTS: {
    CONTAINER: '[data-test="variants-container"]',
    SELECTOR: 'select[data-test="variant-selector"]',
    OPTIONS: '[data-test="variant-option"]'
  }
};

export const DEFAULT_VALUES = {
  VENDOR: "Target",
  TYPE: "Clothing",
  STATUS: "active",
  PUBLISHED: true, // Changed to boolean
  FULFILLMENT_SERVICE: "manual",
  INVENTORY_POLICY: "deny",
  INVENTORY_TRACKER: "shopify",
  INVENTORY_QUANTITY: 100,
  VARIANT_WEIGHT_UNIT: "kg",
  TAXABLE: true,
  REQUIRES_SHIPPING: true
};

export const TIMEOUTS = {
  BROWSER_LAUNCH: 60000,
  PAGE_LOAD: 45000,
  ELEMENT_WAIT: 20000,
  NAVIGATION: 30000,
  ACTION_DELAY: 1500 // Delay between actions
};

export const ERRORS = {
  SELECTOR_NOT_FOUND: "Selector not found",
  PRICE_PARSE_ERROR: "Could not parse price",
  PAGE_LOAD_FAILED: "Page failed to load",
  PRODUCT_NOT_FOUND: "Product data not found"
};

// Additional constants for CSV export
export const CSV_HEADERS = {
  PRODUCT: [
    'Handle',
    'Title',
    'Body (HTML)',
    'Vendor',
    'Type',
    'Tags',
    'Published',
    'Option1 Name',
    'Option1 Value',
    'Variant SKU',
    'Variant Grams',
    'Variant Inventory Qty',
    'Variant Inventory Policy',
    'Variant Fulfillment Service',
    'Variant Price',
    'Variant Compare At Price',
    'Variant Requires Shipping',
    'Variant Taxable',
    'Image Src'
  ]
};
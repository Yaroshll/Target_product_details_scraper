// helpers/constants.js
export const SELECTORS = {
  // Image selectors
  IMAGE: {
    SRC: 'div.styles_zoomableImage__R_OOf img'
  },

  // Product info selectors
  PRODUCT: {
    TITLE: 'h1#pdp-product-title-id',
    CURRENT_PRICE: 'span[data-test="product-price"]',
    ORIGINAL_PRICE: 'span.h-text-line-through',
    DESCRIPTION: {
      MAIN: 'div[data-test="item-details-description"]',
      DETAILS: {
        CONTAINER: 'div.sc-6a3f6e8d-1.jPoGSX',
        HEADER: 'h2',
        ITEMS: 'ul li'
      }
    }
  },

  // Breadcrumb navigation
  BREADCRUMBS: {
    LINKS: 'nav[aria-label="Breadcrumbs"] a[data-test="@web/Breadcrumbs/BreadcrumbLink"]'
  }
};

export const DEFAULT_VALUES = {
  VENDOR: "Target",
  TYPE: "Clothing",
  STATUS: "active",
  PUBLISHED: true,
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
  ACTION_DELAY: 1500
};

export const ERRORS = {
  SELECTOR_NOT_FOUND: "Selector not found",
  PRICE_PARSE_ERROR: "Could not parse price",
  PAGE_LOAD_FAILED: "Page failed to load",
  PRODUCT_NOT_FOUND: "Product data not found"
};

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

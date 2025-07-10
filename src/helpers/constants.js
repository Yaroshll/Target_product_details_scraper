// helpers/constants.js

export const SELECTORS = {
  PRODUCT_CONTAINER: 'div.pdp-main',
  TITLE: 'h1#pdp-product-title-id',
  BREADCRUMB_ITEMS: 'nav.styles_ndsBreadcrumbNav__F_2Ga ol li:not(:first-child)',
   // Pricing Elements
  PRICE: [
    'product-price', // Primary price selector
    '.prices__value', // Alternative selector
    '[data-test="price-value"]', // Test attribute selector
    'span.price', // Generic price class
    'meta[property="product:price:amount"]' // Meta tag
  ].join(','),
  PRICE_CONTAINER: 'main#pageBodyContainer',
  
  DESCRIPTION_H1: 'div.sc-6a3f6e8d-1.jPoGSX h2',
  DESCRIPTION_LI: 'div.sc-6a3f6e8d-1.jPoGSX li',
  DESCRIPTION_CONTENT: 'div.h-margin-t-x2',
  IMAGE_GALLERY_IMAGES: 'div.styles_zoomableImage__R_OOf img'
};

export const DEFAULT_VALUES = {
  VENDOR: "Target",
  TYPE: "closes",
  STATUS: "Active",
  PUBLISHED: "TRUE",
  FULFILLMENT_SERVICE: "manual",
  INVENTORY_POLICY: "deny",
  INVENTORY_TRACKER: "shopify"
};
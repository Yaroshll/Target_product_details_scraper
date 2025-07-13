// helpers/constants.js
export const SELECTORS = {
   IMAGE: {
    ZOOMABLE: 'div.styles_zoomableImage__R_OOf img'
  },
  PRODUCT: {
    TITLE: 'h1#pdp-product-title-id',
    CURRENT_PRICE: 'span[data-test="product-price"]',
    ORIGINAL_PRICE: 'span.h-text-line-through',
    DESCRIPTION_BUTTON: 'button.styles_menuButton___e3Vt[href="#ProductDetails-accordion-scroll-id"]',
    DESCRIPTION_CONTENT: 'div.h-margin-t-x2[data-test="item-details-description"]',
    FIT_STYLE_CONTAINER: 'div.sc-6a3f6e8d-1.jPoGSX',
    FIT_STYLE_HEADER: 'h2',
    FIT_STYLE_ITEMS: 'ul li span'
  },
  BREADCRUMBS: {
    LINKS: 'nav[aria-label="Breadcrumbs"] a[data-test="@web/Breadcrumbs/BreadcrumbLink"]'
  }};

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
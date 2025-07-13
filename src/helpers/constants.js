// helpers/constants.js
export const SELECTORS = {
  // Image selectors
  // Image selectors
  IMAGE: {
    CONTAINER: 'div.styles_zoomableImage__R_OOf',
    SRC: 'div.styles_zoomableImage__R_OOf img',
    ALL_IMAGES: 'button[data-test="thumbnail-button"] img',
    THUMBNAILS: 'div[data-test="image-carousel-container"] img'
  },

  // Product info selectors
  PRODUCT: {
    TITLE: 'h1[data-test="product-title"]',
    CURRENT_PRICE: 'span[data-test="product-price"]',
    ORIGINAL_PRICE: 'span.h-text-line-through',
    DESCRIPTION: {
      BUTTON: 'button.styles_button__D8Xvn[href="#ProductDetails-accordion-scroll-id"]',
      MAIN: 'div[data-test="item-details-description"]',
      DETAILS: {
        CONTAINER: 'div.sc-6a3f6e8d-1',
        HEADER: 'h2.styles_ndsHeading__HcGpD',
        ITEMS: 'ul.h-display-flex li.sc-6a3f6e8d-0'
      }
    }
  },

  // Breadcrumb navigation
  BREADCRUMBS: {
    CONTAINER: 'nav[data-test="@web/Breadcrumbs/BreadcrumbNav"]',
    ITEMS: 'li.styles_listItem__XQB0p',
    LINKS: 'a[data-test="@web/Breadcrumbs/BreadcrumbLink"]'
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
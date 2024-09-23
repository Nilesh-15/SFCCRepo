"use strict";

const path = require("path");

/**
 * Allows to configure aliases for you require loading
 */
module.exports.aliasConfig = {
  // enter all aliases to configure

  alias: {
    base: path.resolve(
      process.cwd(), // eslint-disable-next-line max-len
      "cartridges/app_storefront_base/cartridge/client/default/"
    ),
    int_login_with_otp: path.resolve(
      process.cwd(), // eslint-disable-next-line max-len
      "cartridges/int_login_with_otp/cartridge/client/default/"
    ),
    int_single_page_checkout: path.resolve(
      process.cwd(), // eslint-disable-next-line max-len
      "cartridges/int_single_page_checkout/cartridge/client/default/"
    ),
    app_merge: path.resolve(
      process.cwd(), // eslint-disable-next-line max-len
      "cartridges/app_commerce_merge/cartridge/client/default/"
    ),
    plugin_gtm: path.resolve(
      process.cwd(), // eslint-disable-next-line max-len
      "cartridges/plugin_gtm/cartridge/client/default/"
    ),
    int_razorpay: path.resolve(
      process.cwd(), // eslint-disable-next-line max-len
      "cartridges/int_razorpay/cartridge/client/default/"
    ),
    app_pageDesiger: path.resolve(
      process.cwd(),      
      "cartridges/app_commerce_designer_c/cartridge/client/default/"
    ),
    app_account_widgets: path.resolve(
      process.cwd(), // eslint-disable-next-line max-len
      "cartridges/app_account_widgets/cartridge/client/default/"
    ),
    plugin_wishlists: path.resolve(
      process.cwd(), // eslint-disable-next-line max-len
      "cartridges/plugin_wishlists/cartridge/client/default/"
    ),
    app_backinstock:path.resolve(
      process.cwd(), // eslint-disable-next-line max-len
      "cartridges/app_backinstock/cartridge/client/default/"
    )
  },
};

/**
 * Allows copying files to static folder
 */
module.exports.copyConfig = {
  "cartridges/app_storefront_base": [
    { from: "./node_modules/font-awesome/fonts/", to: "default/fonts" },
    { from: "./node_modules/flag-icon-css/flags", to: "default/fonts/flags" },
  ]
  ,
  "cartridges/app_appendd_ui": [
    { from: "cartridges/app_appendd_ui/cartridge/client/default/fonts", to: "default/fonts" },
  ]
};

/**
 * Allows custom include path config
 */
module.exports.includeConfig = {
  "cartridges/app_storefront_base": {
    scss: ["my-custom-node_modules"],
  },
};

/**
 * Exposes cartridges included in the project
 */
module.exports.cartridges = [
  "cartridges/app_storefront_base",
  "cartridges/int_login_with_otp",
  "cartridges/int_single_page_checkout",
  "cartridges/int_razorpay",
  "cartridges/app_commerce_merge",
  "cartridges/app_commerce_designer_c",
  "cartridges/app_backinstock",
  "cartridges/app_appendd_ui"
];

/**
 * Lint options
 */
module.exports.lintConfig = {
  eslintFix: true,
  stylelintFix: true,
};

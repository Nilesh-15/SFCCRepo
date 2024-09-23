'use strict';

var base = module.superModule || {};

// Enable Href Langs tags generation into the templates
base.enableHrefLangs = true;
/// Enable Open Graph tags generation into the templates
base.enableOpenGraph = true;
// Enable Page Meta Data tags generation into the templates
base.enablePageMetaData = true;
// Enable schema data generation into the templates
base.enableSchema = true;
// Enable the Product Offline Redirection
base.enableProductOfflineRedirection = false;
// Enable the Category Offline Redirection
base.enableCategoryOfflineRedirection = false;
// Enable the pagination on CLP/PLP pages
base.enablePLPPagination = false;
base.paginationMinimumPagesToDisplayDots = 4;
base.showPaginationIfOnePage = true;

module.exports = base;

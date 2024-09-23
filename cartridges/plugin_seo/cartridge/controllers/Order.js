'use strict';

/**
 * Controller that enhance the Order controller with SEO data
 *
 * @module controllers/Order
 */

var server = require('server');
server.extend(module.superModule);

var seo = require('*/cartridge/scripts/middleware/seo');

/**
 * Endpoints
 */
server.append('Confirm', seo.addCurrentPageMetaData);
server.append('Track', seo.addCurrentPageMetaData);
server.append('History', seo.addCurrentPageMetaData);
server.append('Details', seo.addCurrentPageMetaData);
server.append('Filtered', seo.addCurrentPageMetaData);

module.exports = server.exports();

'use strict';

/**
 * Controller that enhance the Cart controller with SEO data
 *
 * @module controllers/Cart
 */

var server = require('server');
server.extend(module.superModule);

var seo = require('*/cartridge/scripts/middleware/seo');

/**
 * Endpoints
 */
server.append('Show', seo.addCurrentPageMetaData);

module.exports = server.exports();

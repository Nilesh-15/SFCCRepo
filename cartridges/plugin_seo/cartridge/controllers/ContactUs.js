'use strict';

/**
 * Controller that enhance the ContactUs controller with SEO data
 *
 * @module controllers/ContactUs
 */

var server = require('server');
server.extend(module.superModule);

var seo = require('*/cartridge/scripts/middleware/seo');

/**
 * Endpoints
 */
server.append('Landing', seo.addCurrentPageMetaData);

module.exports = server.exports();

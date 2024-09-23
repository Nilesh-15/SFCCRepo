'use strict';

/**
 * Controller that enhance the Address controller with SEO data
 *
 * @module controllers/Address
 */

var server = require('server');
server.extend(module.superModule);

var seo = require('*/cartridge/scripts/middleware/seo');

/**
 * Endpoints
 */
server.append('AddAddress', seo.addCurrentPageMetaData);
server.append('EditAddress', seo.addCurrentPageMetaData);

module.exports = server.exports();

'use strict';

/**
 * Controller that enhance the Account controller with SEO data
 *
 * @module controllers/Account
 */

var server = require('server');
server.extend(module.superModule);

var seo = require('*/cartridge/scripts/middleware/seo');

/**
 * Endpoints
 */
server.append('Show', seo.addCurrentPageMetaData);
server.append('EditProfile', seo.addCurrentPageMetaData);
server.append('EditPassword', seo.addCurrentPageMetaData);
server.append('PasswordReset', seo.addCurrentPageMetaData);
server.append('SetNewPassword', seo.addCurrentPageMetaData);

module.exports = server.exports();

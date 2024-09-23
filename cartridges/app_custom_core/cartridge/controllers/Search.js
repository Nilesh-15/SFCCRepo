'use strict';

var server = require('server');
server.extend(module.superModule);

var cache = require('*/cartridge/scripts/middleware/cache');

server.append('Show', function (req, res, next) {
    var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
    var categoryID = req.querystring.cgid;
    
    var breadcrumbs = productHelper.getAllBreadcrumbs(categoryID, null, []).reverse();

    res.setViewData ({
        breadcrumbs: breadcrumbs
    })
    return next();
});


module.exports = server.exports();

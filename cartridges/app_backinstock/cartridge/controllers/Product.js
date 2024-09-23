'use-strict';

var server = require('server');
server.extend(module.superModule);

var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var ProductMgr = require('dw/catalog/ProductMgr');
var Resource = require('dw/web/Resource');
var backInStock = require('*/cartridge/scripts/helpers/backInStockNotified');
const BACK_IN_STOCK = 'productBackInStock';

server.append('Show',function(req, res, next){
    var URLUtils = require('dw/web/URLUtils');
    var viewData = res.getViewData();
    var customerEmail = '';
    var customer = req.currentCustomer.raw;
    if(customer.authenticated){
        customerEmail = customer.profile.email;
    }
    var key = viewData.product.id +'_'+ customerEmail;
    var getKey = backInStock.isBackInStockNotified(BACK_IN_STOCK,key);
    viewData.obj = getKey;
    viewData.backInStockURL = URLUtils.url('Product-SaveBackInStockNotifucation').toString();
    res.setViewData(viewData);
    return next();
});

/** Check customer already subscribe or not */
server.post('CheckBackInStockNotification',function(req, res, next){
    var param = req.form;
    var customerEmail = '';
    var customer = req.currentCustomer.raw;
    if(customer.authenticated){
        customerEmail = customer.profile.email;
    }
    var key = param.productId +'_'+ customerEmail;
    var getKey = backInStock.isBackInStockNotified(BACK_IN_STOCK,key);
    getKey.productID = param.productId;
    res.json({
        data:getKey
    })
    return next();
})

/** Customer Email and Product ID store in custom object  */
server.post('SaveBackInStockNotifucation',function(req, res, next){
    var emailHelper = require('*/cartridge/scripts/helpers/emailHelpers');
    var params = req.form;
    var backInStockObj = '';

    var isValidEmail = emailHelper.validateEmail(params.customerEmail);

    /** Checking empty customer Email */
    if(empty(params.customerEmail) || !isValidEmail){
        var error = {
            success:false,
            msg:Resource.msg('error.email.msg','product','Please enter email-id or valid email for process')
        }
        res.json({
            data:error
        });
        return next();
    }

    /** Checking already user register for notification or not */
    var key = params.stockProductId+'_'+params.customerEmail;
    var storeBISN = backInStock.saveBISNotification(BACK_IN_STOCK,key,params)
    res.json({
        data:storeBISN
    });

    return next();
});

module.exports = server.exports();
'use-strict';
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Resource = require('dw/web/Resource');
var Transaction = require('dw/system/Transaction');

//Check Customer data already capture or not for back in stock Notification.
function isBackInStockNotified(BACK_IN_STOCK,key){
    var bisObj = {
        success:false,
        isSubscribe:false
    } ;
    var getKey = CustomObjectMgr.getCustomObject(BACK_IN_STOCK,key);
    if(getKey != null){
        bisObj = {
            success:true,
            isSubscribe : true,
            msg:Resource.msg('already.subscribe.msg','product','We will inform you once there is an update on the stock of the product.')
        }
    }
    return bisObj;

}

function saveBISNotification(BACK_IN_STOCK,key,params){
    var getKey = isBackInStockNotified(BACK_IN_STOCK,key)
    var backInStockObj = '';
    if(getKey.success){
        getKey.msg = Resource.msg('error.already.notified','product','Provided email already register with us for notification')
        return getKey;
    }

    /** Creating New BackInStock Object */
    Transaction.wrap(function(){
        backInStockObj = CustomObjectMgr.createCustomObject(BACK_IN_STOCK,key);
        backInStockObj.custom.customerEmail = params.customerEmail;
        backInStockObj.custom.productId = params.stockProductId;
    });
    
    getKey.success = true;
    getKey.msg = Resource.msg('succss.label','product','Will notify once Product back in stock.');
    getKey.stockProductId = params.stockProductId;
    return getKey;
}

module.exports = {
    isBackInStockNotified:isBackInStockNotified,
    saveBISNotification:saveBISNotification
}
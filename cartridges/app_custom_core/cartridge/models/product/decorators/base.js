var base = module.superModule;

module.exports = function (object, apiProducts, type) {
    base.call(this, object, apiProducts, type);

    Object.defineProperty(object, 'badge', {
        enumerable: true,
        value: apiProducts.custom.badge ? apiProducts.custom.badge:null
    });

    Object.defineProperty(object, "minimumQty", {
        enumerable: true,
        value: apiProducts.custom.minimumQty
            ? apiProducts.custom.minimumQty
            : 1,
    });
};

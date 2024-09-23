'use strict';
var base = module.superModule;

/**
 * @constructor
 * @classdesc Price refinement value class
 *
 * @param {dw.catalog.ProductSearchModel} productSearch - ProductSearchModel instance
 * @param {dw.catalog.ProductSearchRefinementDefinition} refinementDefinition - Refinement
 *     definition
 * @param {dw.catalog.ProductSearchRefinementValue} refinementValue - Raw DW refinement value
 */
function PriceRefinementValueWrapper(productSearch, refinementDefinition, refinementValue) {
    base.call(this, productSearch, refinementDefinition, refinementValue);
    this.productCount = refinementValue.hitCount;
}

module.exports = PriceRefinementValueWrapper;

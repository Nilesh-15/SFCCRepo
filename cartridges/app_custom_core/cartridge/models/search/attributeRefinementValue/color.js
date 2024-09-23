'use strict';
var base = module.superModule;

/**
 * @constructor
 * @classdesc Color attribute refinement value model
 *
 * @param {dw.catalog.ProductSearchModel} productSearch - ProductSearchModel instance
 * @param {dw.catalog.ProductSearchRefinementDefinition} refinementDefinition - Refinement
 *     definition
 * @param {dw.catalog.ProductSearchRefinementValue} refinementValue - Raw DW refinement value
 */
function ColorRefinementValueWrapper(productSearch, refinementDefinition, refinementValue) {
    base.call(this, productSearch, refinementDefinition, refinementValue);
    this.productCount = refinementValue.hitCount;
}

module.exports = ColorRefinementValueWrapper;

'use strict';

var base = module.superModule;
var collections = require('*/cartridge/scripts/util/collections');
var searchRefinementsFactory = require('*/cartridge/scripts/factories/searchRefinements');
/**
 * Retrieves search refinements
 *
 * @param {dw.catalog.ProductSearchModel} productSearch - Product search object
 * @param {dw.catalog.ProductSearchRefinements} refinements - Search refinements
 * @param {ArrayList.<dw.catalog.ProductSearchRefinementDefinition>} refinementDefinitions - List of
 *     product serach refinement definitions
 * @return {Refinement[]} - List of parsed refinements
 */
function getRefinements(productSearch, refinements, refinementDefinitions) {
    return collections.map(refinementDefinitions, function (definition) {
        var refinementValues = refinements.getAllRefinementValues(definition);
        var values = searchRefinementsFactory.get(productSearch, definition, refinementValues);
        var isSelected = false;
        for(var i = 0; i < values.length; i++){
            if(values[i].selected){
                isSelected = true;
            }
        }    

        return {
            displayName: definition.displayName,
            isCategoryRefinement: definition.categoryRefinement,
            isAttributeRefinement: definition.attributeRefinement,
            isPriceRefinement: definition.priceRefinement,
            isPromotionRefinement: definition.promotionRefinement,
            values: values,
            isSelected: isSelected
        };
    });
}

/**
 * Returns the refinement values that have been selected
 *
 * @param {Array.<CategoryRefinementValue|AttributeRefinementValue|PriceRefinementValue>}
 *     refinements - List of all relevant refinements for this search
 * @return {Object[]} - List of selected filters
 */
function getSelectedFilters(refinements) {
    var selectedFilters = [];
    var selectedValues = [];

    refinements.forEach(function (refinement) {
        selectedValues = refinement.values.filter(function (value) { return value.selected; });
        if (selectedValues.length) {
            selectedFilters.push.apply(selectedFilters, selectedValues);
        }
    });

    return selectedFilters;
}




/**
 * @constructor
 * @classdesc ProductSearch class
 *
 * @param {dw.catalog.ProductSearchModel} productSearch - Product search object
 * @param {Object} httpParams - HTTP query parameters
 * @param {string} sortingRule - Sorting option rule ID
 * @param {dw.util.ArrayList.<dw.catalog.SortingOption>} sortingOptions - Options to sort search
 *     results
 * @param {dw.catalog.Category} rootCategory - Search result's root category if applicable
 */
function ProductSearch(productSearch, httpParams, sortingRule, sortingOptions, rootCategory) {
    base.call(this, productSearch, httpParams, sortingRule, sortingOptions, rootCategory);
}

Object.defineProperty(ProductSearch.prototype, 'refinements', {
    get: function () {
        if (!this.cachedRefinements) {
            this.cachedRefinements = getRefinements(
                this.productSearch,
                this.productSearch.refinements,
                this.productSearch.refinements.refinementDefinitions
            );
        }

        return this.cachedRefinements;
    }
});

Object.defineProperty(ProductSearch.prototype, 'selectedFilters', {
    get: function () {
        return getSelectedFilters(this.refinements);
    }
});

module.exports = ProductSearch;

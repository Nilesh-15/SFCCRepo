"use strict";
var base = module.superModule;

var PagingModel = require('dw/web/PagingModel');
var collections = require("*/cartridge/scripts/util/collections");
var URLUtils = require("dw/web/URLUtils");
var preferences = require('*/cartridge/config/preferences');
var ACTION_ENDPOINT_CONTENT = 'Page-Show';
var DEFAULT_PAGE_SIZE = preferences.defaultPageSize ? preferences.defaultPageSize : 12;

function getPagingModel(contentHits, count, pageSize, startIndex) {
    var pagingModel = new PagingModel(contentHits, count);
    pagingModel.setStart(startIndex || 0);
    pagingModel.setPageSize(pageSize);
    return pagingModel;
}

function getContentSearchPageJSON(pageElements) {
    return collections.map(pageElements, function (contentAsset) {
        return {
            ID: contentAsset.ID,
            name: contentAsset.name,
            url: URLUtils.url(ACTION_ENDPOINT_CONTENT, "cid", contentAsset.ID),
            description: contentAsset.description,
        };
    });
};

function ContentSearch(contentSearchResult, count, queryPhrase, startingPage, pageSize) {
    base.call(this,contentSearchResult, count, queryPhrase, startingPage, pageSize)
    var ps = pageSize == null ? DEFAULT_PAGE_SIZE : pageSize;
    var pagingModel = getPagingModel(contentSearchResult, count, ps, startingPage);
    var contents = getContentSearchPageJSON(pagingModel.pageElements.asList());

    this.contents = contents;
}

module.exports = ContentSearch;

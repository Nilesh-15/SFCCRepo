var base = module.superModule;

var URLUtils = require("dw/web/URLUtils");

// extended method from base for search content through search key word and folder id
base.setupContentSearch = function (params) {
    var ContentSearchModel = require("dw/content/ContentSearchModel");
    var ContentSearch = require("*/cartridge/models/search/contentSearch");
    var apiContentSearchModel = new ContentSearchModel();

    if (params.key != null) {
        apiContentSearchModel.setRecursiveFolderSearch(true);
        apiContentSearchModel.setSearchPhrase(params.key);
        apiContentSearchModel.setFilteredByFolder(false);
    } else{  
        // line for search content by folder      
        apiContentSearchModel.setFolderID(params.blogFolderID);
    } 

    apiContentSearchModel.search();
    var contentSearchResult = apiContentSearchModel.getContent();
    var count = Number(apiContentSearchModel.getCount());
    var contentElements = new ContentSearch(
        contentSearchResult,
        count,
        params.q,
        params.startingPage,
        null
    );
    return contentElements.contents;
};

// method for get page of blog detail for tile through id's then set through array
base.searchBlogContent = function (contentData) {
    var collections = require('*/cartridge/scripts/util/collections');
    var ArrayList = require('dw/util/ArrayList');
    var PageMgr = require('dw/experience/PageMgr');
    var contentArray = new ArrayList();

    contentData.forEach((content) => {
        var page = PageMgr.getPage(content.ID);
        var region = page.getRegion("blogRegion");

        if (!empty(page) && page.isVisible() && region) {
            var visibleComponents = region.getVisibleComponents();

            collections.forEach(visibleComponents, function (component) {
                if (component.typeID.replace("custom_assets.", "") == "blogDetail") {
                    var blog = {};
                    
                    if ( component.getAttribute("title")) {
                        blog.titleImg = component.getAttribute("title").replace(/(<([^>]+)>)/gi, "");
                    }
                    if (component.getAttribute("title")) {
                        blog.title = component.getAttribute("title").replace(/(<([^>]+)>)/gi, "");
                    }

                    if (component.getAttribute("tileImage")) {
                        var image = component.getAttribute("tileImage").path;
                        blog.imagePath = URLUtils.imageURL(
                            URLUtils.CONTEXT_LIBRARY,
                            null,
                            image,
                            null
                        );
                    }
                    if (component.getAttribute("creationdate")) {
                        var date = new Date(
                            component.getAttribute("creationdate")
                        );
                        var creationDate = date.toLocaleDateString();
                        blog.creationDate = creationDate;
                    }
                    if (component.getAttribute("readtime")) {
                        blog.readTime = component.getAttribute("readtime").replace(/(<([^>]+)>)/gi, "");
                    }
                    blog.isOnline = true
                    blog.pageID = content.ID;
                    contentArray.add(blog);
                }
            });
        }
        contentArray.sort(function(blog1, blog2) {
            return new Date(blog2.creationDate) - new Date(blog1.creationDate);
        });
    });
    return contentArray;
};

module.exports = base;

'use strict';

var base = module.superModule;

/**
 * Get breadcrumbs schema object
 * @param {Array} breadcrumbs - Breadcrumbs
 *
 * @returns {Object} - Schema object
 */
function getSchemaFromBreadcrumbs(breadcrumbs) {
    var schema = {
        '@context': 'http://schema.org/',
        '@type': 'BreadcrumbList',
        itemListElement: []
    };

    if (!empty(breadcrumbs)) {
        schema.itemListElement.push((breadcrumbs || []).map(function (breadcrumb, idx) {
            var schemaObj = {
                '@type': 'ListItem',
                position: Number(idx) + 1,
                name: breadcrumb.htmlValue
            };
            if (breadcrumb.url) {
                schemaObj.item = breadcrumb.url.toString();
            }
            return schemaObj;
        }));
    }

    return schema;
}

/**
 * Get web page schema information from the base schema
 *
 * @param {Object} baseSchema - base schema
 * @param {Object} breadcrumbs - breadcrumbs
 *
 * @returns {Object} - Web Page Schema object
 */
function getWebPageSchema(baseSchema, breadcrumbs) {
    return {
        '@context': 'http://schema.org/',
        '@type': 'WebPage',
        name: baseSchema.name,
        breadcrumb: getSchemaFromBreadcrumbs(breadcrumbs),
        mainEntity: baseSchema
    };
}

/**
 * Get schema
 * @param {Object} viewData - Route view data object
 *
 * @returns {Object} - Schema object
 */
function getSchema(viewData) {
    var schema;

    if (empty(viewData.breadcrumbs)) {
        schema = viewData.schemaData;
    } else if (empty(viewData.schemaData)) {
        schema = getSchemaFromBreadcrumbs(viewData.breadcrumbs);
    } else {
        schema = getWebPageSchema(viewData.schemaData, viewData.breadcrumbs);
    }

    // Fire a hook to allow schema extention from higher cartridges
    if (require('dw/system/HookMgr').hasHook('app.seo.schema')) {
        schema = require('dw/system/HookMgr').callHook('app.seo.schema', 'schema', schema, viewData);
    }

    return schema;
}

base.getSchema = getSchema;
module.exports = base;

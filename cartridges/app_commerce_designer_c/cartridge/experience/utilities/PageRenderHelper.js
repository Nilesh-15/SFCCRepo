var superModule = module.superModule;

/**
 * Normalize provided HTML markup for banners
 *
 * @param  {string} markup - HTML markup
 * @returns {string} - normalized HTML markup
 */
function getBannerMarkup(markup) {
    return markup.replace(
        /<h4([^>]*)>([\s\S]*?)<\/h4>/gm,
        "<small$1>$2</small>"
    );
}

module.exports = superModule;
module.exports.getBannerMarkup = getBannerMarkup;
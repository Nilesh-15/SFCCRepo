var URLUtils = require("dw/web/URLUtils");
var ArrayList = require("dw/util/ArrayList");
var Site = require("dw/system/Site");

// var System = require('dw/system/System');
var ProductVariationAttributeValue = require("dw/catalog/ProductVariationAttributeValue");
var ProductVariationModel = require("dw/catalog/ProductVariationModel");
// configuration 'singleton' for the duration of a request
var cvDISConfiguration = JSON.parse(
    Site.current.getCustomPreferenceValue("disImageConfig")
);

/**
 * Initializes the ProductImage wrapper object
 *
 * @param {String} viewType type of view (resolution) that should be generated (required)
 * @param {Object} imageObject Product or ProductVariationAttributeValue (required)
 * @param {number} index Number position of the image in the list of images for the view type. Defaults to 0 if not provided
 *
 * @returns {Object} Initialized Image object that is MedialFile API neutral
 */
function ProductImage(imageObject, viewType, index) {
    // init basic object attributes
    // --> keeps the image reference
    this.image = null;
    // --> defines if image needs to be scaled
    this.scaleImage = true;
    // --> view type that should be rendered
    this.viewType = viewType;
    // --> the image object --> escape empty object
    this.imageObject = imageObject;

    if (this.imageObject === null) {
        return;
    }

    // Check what type of image object the wrapper got
    if (this.imageObject instanceof ProductVariationAttributeValue) {
        this.referenceType = "ProductVariationAttributeValue";
    } else if (this.imageObject instanceof ProductVariationModel) {
        this.referenceType = "ProductVariationModel";
    } else {
        this.referenceType = "Product";
    }

    // --> the view type that can be scaled - typically high resolution
    this.scalableViewType = null;
    // --> index of the image
    this.index = !index ? 0 : index;
    // --> defines if the image needs to be scaled. That's not necessary if a product has an image for the given view type configured
    this.scaleImage = true;

    this.transformationObj = cvDISConfiguration.hasOwnProperty(viewType)
        ? cvDISConfiguration[viewType]
        : {};

    // determine the scaleableImageType that correspoonds with the viewType
    // set the default viewtype if no specific configuration was found
    this.scalableViewType = this.viewType;

    // use the JSON configuration in 'disConfiguration' to determine scaleableImageType
    if (
        Object.prototype.hasOwnProperty.call(
            cvDISConfiguration,
            "viewTypeMapping"
        ) &&
        cvDISConfiguration.viewTypeMapping[this.viewType]
    ) {
        this.scalableViewType =
            cvDISConfiguration.viewTypeMapping[this.viewType];
    }

    this.scaleableImage = this.imageObject.getImage(
        this.scalableViewType,
        this.index
    );
    // Get the image for the image object if not only test images should be used
    this.image = this.imageObject.getImage(this.viewType, this.index);

    if (!this.image) {
        // there hasn't been a image configured and we fall back to the highres one which needs to be scaled
        this.image = this.scaleableImage;
        this.scaleImage = true;
    }
    this.alt = this.getAlt();
    this.title = this.getTitle();
}

/** ***********************************************************************************************
 ******************************** API Methods *****************************************************
 ************************************************************************************************ */

ProductImage.prototype.getURL = function () {
    if (this.imageObject === null) {
        return null;
    }
    return this.getImageURL();
};

ProductImage.prototype.getHttpURL = function () {
    if (this.imageObject === null) {
        return null;
    }
    return this.getImageURL("Http");
};

ProductImage.prototype.getHttpsURL = function () {
    if (this.imageObject === null) {
        return null;
    }
    return this.getImageURL("Https");
};

ProductImage.prototype.getAbsURL = function () {
    if (this.imageObject === null) {
        return null;
    }
    return this.getImageURL("Abs");
};

/**
 * Gets the actual image URL for different API calls.
 *
 * @param {String} imageFunctionID
 */
ProductImage.prototype.getImageURL = function (imageFunctionID, breakpoint) {
    if (this.imageObject === null) {
        return null;
    }
    var imageURL = null;
    var finalStaticFunctionID = imageFunctionID
        ? imageFunctionID.toLowerCase() + "Static"
        : "staticURL";

    if (breakpoint && this.transformationObj[breakpoint]) {
        this.transformationObj.scaleWidth =
            this.transformationObj[breakpoint].scaleWidth;
        this.transformationObj.scaleHeight =
            this.transformationObj[breakpoint].scaleHeight;

        if (this.transformationObj[breakpoint].scaleMode) {
            this.transformationObj.scaleMode =
                this.transformationObj[breakpoint].scaleMode;
        }

        if (this.transformationObj[breakpoint].quality) {
            this.transformationObj.quality =
                this.transformationObj[breakpoint].quality;
        }
    }

    if (!this.image) {
        // check if test images should be used --> makes sense in cases where the product images haven't yet been configured
        let testImage = null;
        if (cvDISConfiguration.missingImages) {
            if (cvDISConfiguration.missingImages[this.viewType]) {
                testImage = cvDISConfiguration.missingImages[this.viewType];
                this.scaleImage = true;
            }
            if (
                !testImage &&
                this.scalableViewType !== this.viewType &&
                cvDISConfiguration.missingImages[this.scalableViewType]
            ) {
                testImage =
                    cvDISConfiguration.missingImages[this.scalableViewType];
                this.scaleImage = true;
            }
        }
        if (testImage) {
            if (this.scaleImage) {
                imageURL = URLUtils[
                    imageFunctionID
                        ? imageFunctionID.toLowerCase() + "Static"
                        : "imageURL"
                ](
                    URLUtils.CONTEXT_SITE,
                    Site.current.ID,
                    testImage,
                    this.transformationObj
                );
            } else {
                imageURL = URLUtils[finalStaticFunctionID](
                    URLUtils.CONTEXT_SITE,
                    Site.current.ID,
                    testImage
                );
            }
            return this.getFinalUrlAsString(imageURL);
        }
        return URLUtils[finalStaticFunctionID](
            "/images/noimage" + this.viewType + ".png"
        );
    }
    if (this.scaleImage) {
        return this.getFinalUrlAsString(
            this.image[
                imageFunctionID
                    ? "get" + imageFunctionID + "ImageURL"
                    : "getImageURL"
            ](this.transformationObj)
        );
    }
    return this.getFinalUrlAsString(
        this.image[
            imageFunctionID ? "get" + imageFunctionID + "URL" : "getURL"
        ]()
    );
};

/**
 * If a URL replacement is used it would return the final URL, otherwise the given URL object
 */
ProductImage.prototype.getFinalUrlAsString = function (imageURL) {
    // In case the site preference is set, update the instance used as image source
    let current = imageURL.toString();
    let replacement = Site.current.getCustomPreferenceValue(
        "disImageSourceEnvironment"
    );
    if (replacement && replacement.value) {
        return current.replace(
            /(^.*_)[a-zA-Z0-9]{3}(\/on\/demandware.*$)/,
            "$1" + replacement.value + "$2"
        );
    }
    return current;
};

/**
 * Gets the tile for images.
 */
ProductImage.prototype.getTitle = function () {
    if (this.imageObject === null) {
        return null;
    }
    if (
        this.referenceType === "ProductVariationAttributeValue" &&
        this.viewType === "swatch"
    ) {
        return this.imageObject.displayValue;
    }
    if (this.referenceType === "ProductVariationModel") {
        return this.imageObject.master.name;
    }
    if (!this.image || !this.image.title) {
        if (cvDISConfiguration.imageMissingText) {
            return cvDISConfiguration.imageMissingText;
        } else if (this.referenceType === "Product") {
            return this.imageObject.name;
        }
        return this.imageObject.displayValue;
    }
    return this.image.title;
};

/**
 * Gets the alternative text for images.
 */
ProductImage.prototype.getAlt = function () {
    if (this.imageObject === null) {
        return null;
    }
    if (
        this.referenceType === "ProductVariationAttributeValue" &&
        this.viewType === "swatch"
    ) {
        return this.imageObject.displayValue;
    }
    if (this.referenceType === "ProductVariationModel") {
        return this.imageObject.master.name;
    }
    if (!this.image || !this.image.alt) {
        // same as above
        if (cvDISConfiguration.imageMissingText) {
            return cvDISConfiguration.imageMissingText;
        } else if (this.referenceType === "Product") {
            return this.imageObject.name;
        }
        return this.imageObject.displayValue;
    }
    return this.image.alt;
};

/**
 * Gets image sources
 */
ProductImage.prototype.getSources = function () {
    return {
        mobile: this.getImageURL("Https", "mobile"),
        tablet: this.getImageURL("Https", "tablet"),
        desktop: this.getImageURL("Https", "desktop"),
    };
};

/**
 * Gets image width
 *
 * @param {String} [breakpoint]
 */
ProductImage.prototype.getWidth = function (breakpoint) {
    var type = breakpoint || "desktop";

    if (
        type &&
        this.transformationObj[type] &&
        this.transformationObj[type].scaleWidth
    ) {
        return this.transformationObj[type].scaleWidth;
    }

    return 0;
};

/**
 * Gets image height
 *
 * @param {String} [breakpoint]
 */
ProductImage.prototype.getHeight = function (breakpoint) {
    var type = breakpoint || "desktop";

    if (
        type &&
        this.transformationObj[type] &&
        this.transformationObj[type].scaleHeight
    ) {
        return this.transformationObj[type].scaleHeight;
    }

    return 0;
};

/**
 * Gets all images for the given view type and image object
 */
ProductImage.prototype.getImages = function () {
    return this.getAllImages();
};

/**
 * Returns a Collection of ProductImage Instances of the productimages assigned for this viewtype.
 */
ProductImage.prototype.getAllImages = function () {
    var result = new ArrayList();
    if (this.imageObject !== null) {
        var images = this.imageObject.getImages(this.scalableViewType);
        // in the case where getImages response is empty, add a new image to handle missing image scenario
        if (images.length === 0) {
            result.add(
                ProductImage.getImage(this.imageObject, this.viewType, 0)
            );
        }
        for (let i = 0; i < images.length; i++) {
            if (i === this.index) {
                result.add(this);
            } else {
                result.add(
                    ProductImage.getImage(this.imageObject, this.viewType, i)
                );
            }
        }
    }
    return result;
};

/**
 * Gets a new Product Image Wrapper object if it hasn't been initialized during the request,
 * otherwise the already initialzed version will be returned.
 *
 * @param {String} viewType Type of view (resolution) that should be generated (required)
 * @param {Object} imageObject Product or ProductVariationAttributeValue(required)
 * @param {Number} index Position of the image in the list of images for the view type. Defaults to 0 if not provided
 *
 * @returns {ProductImage} A wrapped image that does not need to be initialized if already created in context of the current request.
 */
ProductImage.getImage = function (imageObject, viewType, index) {
    if (!imageObject || !viewType) {
        return null;
    }
    return new ProductImage(imageObject, viewType, index);
};

/**
 * Gets a all images for a given image object
 *
 * @param {String} viewType Type of view (resolution) that should be generated (required)
 * @param {Object} imageObject Product or ProductVariationAttributeValue(required)
 *
 * @returns {Collection} Collection of images assiciated with the image object and the view type
 */
ProductImage.getImages = function (imageObject, viewType) {
    if (!imageObject || !viewType) {
        return null;
    }
    return ProductImage.getImage(imageObject, viewType, 0).getImages();
};

module.exports = ProductImage;

'use strict';

var ImageTransformation = require('*/cartridge/experience/utilities/ImageTransformation.js');

module.exports = {
    /**
     * Get transformed image object
     *
     * @param {dw.experience.image.Image} image The image object
     * @param {string} imageType Type of the image
     * @param {Object} [focalPoint] Focal point of the image
     *
     * @returns {Object} Transformed image object
     */
    getTransformedImage: function (image, imageType, focalPoint) {
        var transformedImage = ImageTransformation.getScaledImage(image, imageType, focalPoint);

        return transformedImage;
    }
};

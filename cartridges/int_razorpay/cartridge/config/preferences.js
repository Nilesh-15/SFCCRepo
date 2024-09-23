'use strict';
var Site = require('dw/system/Site');
var base = module.superModule;
Object.defineProperty(base, 'razorEnable', {
    enumerable: true,
    value: Site.current.getCustomPreferenceValue('razorEnable')
});
Object.defineProperty(base, 'razorAuthStatus', {
    enumerable: true,
    value: Site.current.getCustomPreferenceValue('razorAuthStatus')
});
Object.defineProperty(base, 'razorpayPriceConversionFactor', {
    enumerable: true,
    value: Site.current.getCustomPreferenceValue('razorpayPriceConversionFactor')
});
Object.defineProperty(base, 'razorPayStoreName', {
    enumerable: true,
    value: Site.current.getCustomPreferenceValue('razorPayStoreName')
});
Object.defineProperty(base, 'razorpayCaptureStatus', {
    enumerable: true,
    value: Site.current.getCustomPreferenceValue('razorpayCaptureStatus')
});
Object.defineProperty(base, 'razorpayCheckouturlPreference', {
    enumerable: true,
    value: Site.current.getCustomPreferenceValue('razorpayCheckouturlPreference')
});
Object.defineProperty(base, 'razorId', {
    enumerable: true,
    value: Site.current.getCustomPreferenceValue('razorId')
});
Object.defineProperty(base, 'razorKey', {
    enumerable: true,
    value: Site.current.getCustomPreferenceValue('razorKey')
});

module.exports = base;

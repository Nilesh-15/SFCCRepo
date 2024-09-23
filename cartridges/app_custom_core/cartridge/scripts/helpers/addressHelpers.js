'use strict';

var base = module.superModule;

/**
 * Stores a new address for a given customer
 * @param {Object} address - New address to be saved
 * @param {Object} customer - Current customer
 * @param {string} addressId - Id of a new address to be created
 * @returns {void}
 */
function saveAddress(address, customer, addressId) {
    var Transaction = require('dw/system/Transaction');

    var addressBook = customer.raw.getProfile().getAddressBook();
    Transaction.wrap(function () {
        var newAddress = addressBook.createAddress(addressId);
        if (newAddress) {
            base.updateAddressFields(newAddress, address);
        }
    });
}

module.exports = {
    generateAddressName: base.generateAddressName,
    checkIfAddressStored: base.checkIfAddressStored,
    saveAddress: saveAddress,
    copyShippingAddress: base.copyShippingAddress,
    updateAddressFields: base.updateAddressFields,
    gatherShippingAddresses: base.gatherShippingAddresses
};

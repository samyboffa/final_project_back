const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
    sellerId: String,
    sellerName: String,
    sellerPhoneNumber: String,
    itemName: String,
    itemDescription: String,
    itemPrice: String,
    itemType: String,
    sellerRate: Array,
    status: { type: String, default: "Pending" },
    itemNumber: String,
    date: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = mongoose.model("Offer", offerSchema);

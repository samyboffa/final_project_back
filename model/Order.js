const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    clientId: String,
    products: Array,
    totalPrice: String,
    orderNumber: String,
    seller: String,
    status: { type: String, default: "Pending" },
    date: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = mongoose.model("Order", orderSchema);

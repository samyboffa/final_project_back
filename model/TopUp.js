const mongoose = require("mongoose");

const topUpSchema = new mongoose.Schema({
    name: String,
    platform: String,
    currency: String,
    topUp: Array,
    description: String,
    img: String,
    currencyImg: String,
    region: String,
    accountOrId: String,
    searchName: String,
    gameName: String,
});

module.exports = mongoose.model("TopUp", topUpSchema);

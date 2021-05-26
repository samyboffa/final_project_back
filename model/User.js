const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },
    email: {
        type: String,
        required: true,
        min: 8,
        max: 255,
    },
    password: {
        type: String,
        required: true,
        min: 8,
        max: 1024,
    },
    phoneNumber: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },
    date: {
        type: Date,
        default: Date.now(),
    },
    role: {
        type: Number,
        default: 0,
    },
    cart: {
        type: Array,
        default: [],
    },
    rate: {
        type: Array,
        default: [],
    },
    notifications: {
        type: Array,
        default: [],
    },
});

module.exports = mongoose.model("User", userSchema);

/**
 * This is the product schema used for defining products
 * Consists of product name, price, category, description, and the quantity of the item in inventory
 */
const mongoose = require("mongoose");
const Product = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    item_quantity: {
        type: Number,
        required: true,
    },
});
module.exports = mongoose.model("Product", Product);

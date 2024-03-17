/**
 * This is the Order Schema used for storing orders that have made.
 * Consists of the fields products_ordered, purchase_total, customer_info
 */
const mongoose = require("mongoose");
const Order = new mongoose.Schema({
    order_date: {
        type: Date,
        required: true,
    },
    products_ordered: {
        type: Array,
        required: true,
    },
    order_total: {
        type: Number,
        required: true,
    },
    customer_info: {
        customer_ID: {
            type: String,
            required: true,
        },
        full_name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone_number: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
    },
});
module.exports = mongoose.model("Order", Order);

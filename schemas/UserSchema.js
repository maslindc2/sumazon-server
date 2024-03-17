/**
 * This is the user schema for defining the username, email, phone_number, password, and role
 * The role will always be user when someone creates account using the client.
 * The only time the role will be set to admin is if someone has access to the MongoDB instance and sets the role manually.
 */
const mongoose = require("mongoose");
const Users = new mongoose.Schema({
    username: {
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
    address: {
        type: String,
        required: true,
    },
    phone_number: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
});
module.exports = mongoose.model("User", Users);

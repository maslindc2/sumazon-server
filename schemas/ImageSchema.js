/**
 * This is the Image schema used for MongoDB
 * Consits of the fields product_id which is associated with the product when it's created
 *  - When the product image is updated for a particular product, the server finds the matching image
 *    in the schema and updates the image data.
 *  - Image data stores the image's binary data
 *  - Image content type stores the image's mimetype
 */
const mongoose = require("mongoose");
const Image = new mongoose.Schema({
    product_id: {
        type: String,
        required: true,
    },
    image_data: {
        type: Buffer,
        required: true,
    },
    image_content_type: {
        type: String,
        required: true,
    },
});
module.exports = mongoose.model("Image", Image);

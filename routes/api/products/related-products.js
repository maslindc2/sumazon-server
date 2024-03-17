// Import the product schema used for finding products in the same category
const productSchema = require("../../../schemas/ProductSchema");

/**
 * This is function responsible for finding related products.
 * This function is called when the client navigates to an individual product page.
 * @param {*} req Contains the product ID of the individual product page the client navigated to
 * @param {*} res Used for sending the related products back as JSON
 * @param {*} cache Used for storing the related products.
 * @returns The products in the same category as the current individual product
 */
module.exports = async (req, res) => {
    // Otherwise find the current productID's category
    const productFromDB = await productSchema.findById(req.body.productID);
    // If the product that was requested was not found then send 404
    if (productFromDB === null) {
        return res.sendStatus(404);
    } else {
        // Next find all products matching that category
        const relatedProductsFromDB = await productSchema.find({
            category: productFromDB.category,
        });
        // Related products will be stored here
        const relatedProducts = [];
        // Iterate through the respone and only store the products id, name, and price
        relatedProductsFromDB.forEach((key) => {
            if (productFromDB.name !== key.name) {
                relatedProducts.push({
                    _id: key._id,
                    name: key.name,
                    price: key.price,
                    item_quantity: key.item_quantity,
                });
            }
        });
        // Send the related products back to the client
        return res.status(200).json(relatedProducts);
    }
};

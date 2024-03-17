// Import product Schema used for fetching product information for a specific product
const productSchema = require("../../../schemas/ProductSchema");

/**
 * This function is repsonsible for fetching product information for the individual product pages.
 * @param {*} req Contains the product ID to fetch the description, name, and price from
 * @param {*} res Used for sending the information back to the client
 * @returns The product information as JSON back to the client
 */
module.exports = async (req, res) => {
    // Store the product ID
    const productID = req.body.productID;
    // Fetch the information from MongoDB using mongoose's findById.
    const productFromDB = await productSchema.findById(productID);
    // If the product that was requested was not found then send 404
    if (productFromDB === null) {
        return res.sendStatus(404);
    } else {
        // Populate the needed fields for the individual product information page
        const productInfo = {
            name: productFromDB.name,
            price: productFromDB.price,
            category: productFromDB.category,
            description: productFromDB.description,
            quantity: productFromDB.item_quantity,
        };
        // return succcess and the product info as a JSON
        return res.status(200).json(productInfo);
    }
};

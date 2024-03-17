// Used for fetching products from the product schema
const productSchema = require("../../../schemas/ProductSchema");

/**
 * This function is used for getting all the products to display on the homepage
 * @param {*} req Not used, Node has a panic attack when I remove this
 * @param {*} res Sends the products to display on the homepage as JSON
 * @returns
 */
module.exports = async (req, res) => {
    // Find all products in the product schema
    await productSchema.find({}).then((doc) => {
        // Store the products to this array
        const homepageProducts = [];
        // For each product returned we only want the id, name, and price
        doc.forEach((key) => {
            homepageProducts.push({
                _id: key._id,
                name: key.name,
                price: key.price,
                item_quantity: key.item_quantity,
            });
        });
        // Send the products back to the client
        return res.status(200).json(homepageProducts);
    });
};

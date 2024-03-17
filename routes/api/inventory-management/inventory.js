/**
 * Returns all products in the Product Schema a.k.a Inventory
 * Uses the product schema to and the empty find filter which returns all entries in the product schema as an array
 */
const productSchema = require("../../../schemas/ProductSchema");
module.exports = async (req, res) => {
    await productSchema.find({}).then((doc) => {
        res.json(doc);
    });
};

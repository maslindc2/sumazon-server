/**
 * Add Product end point used for adding products to the store's inventory.
 * Utilizes the User Schema for checking admin role and the Product Schema for duplicate product checking and saving the new product
 */

// Import the user schema we are going to use this to check that the current session is an admin user
const userSchema = require("../../../schemas/UserSchema");
// Import the product schema we will use to store the new product
const productSchema = require("../../../schemas/ProductSchema");

module.exports = async (req, res) => {
    // Get the current user's session from passport
    const userID = req.session.passport.user;
    // Find a user in the User Schema on Mongo that matches the current user's ID
    const userFromDB = await userSchema.findById(userID);
    // Extract and store the current user's role
    const userRoleFromDB = userFromDB.role;

    // Check if the userRoleFromDB is admin, this checks to make sure the current session is an admin account
    if (userRoleFromDB === "admin") {
        // Store the new product from the requests body in the formData productInfo
        const newProductFromClient = req.body;

        // Check if the new product already exists in the inventory
        // duplicateProduct is an array containing the product if it exists already
        // If the product doesn't exist it will be an array of length 0.
        const duplicateProduct = await productSchema.find({
            name: newProductFromClient.name,
        });

        // Check if the length of the array stored to duplicateProduct is of length 0
        // meaning there is no product in the inventory with the same name
        if (duplicateProduct.length === 0) {
            // Create the new product and populate the fields
            const newProduct = new productSchema({
                name: newProductFromClient.name,
                price: newProductFromClient.price,
                category: newProductFromClient.category,
                description: newProductFromClient.description,
                item_quantity: newProductFromClient.quantity,
            });
            // Store the product and then sendStatus 200 if it was successful otherwise send 500
            await newProduct
                .save()
                .then((savedProduct) => {
                    return res
                        .status(200)
                        .json({ product_id: savedProduct.id });
                })
                .catch((error) => {
                    console.error(error);
                    return res.sendStatus(500);
                });
        } else {
            // Send status code 409 = Conflict for attempting to create a duplicate product
            return res.sendStatus(409);
        }
    } else {
        // Send status 401 if the current session for the user is not an admin account
        return res.sendStatus(401);
    }
    return res.status(200);
};

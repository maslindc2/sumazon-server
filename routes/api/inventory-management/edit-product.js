/**
 * Edit Product end point used for editing an individual product in the database
 */
// Import the user schema we are going to use this to check that the current session is an admin user
const userSchema = require("../../../schemas/UserSchema");
// Import the product schema we will use to edit the current product
const productSchema = require("../../../schemas/ProductSchema");

module.exports = async (req, res) => {
    // Get the current user's session from passport
    const userID = req.session.passport.user;
    // Find a user in the User Schema on Mongo that matches the current user's ID
    const userFromDB = await userSchema.find({ _id: userID });
    // Extract and store the current user's role
    const userRoleFromDB = userFromDB[0].role;
    // Check if the userRoleFromDB is admin, this checks to make sure the current session is an admin account
    if (userRoleFromDB === "admin") {
        const productToEdit = req.body;
        if (productToEdit.deleteProduct) {
            await productSchema
                .findByIdAndDelete({ _id: productToEdit._id })
                .then(() => {
                    return res.status(200);
                })
                .catch(() => {
                    return res.status(500);
                });
        }
        // Check if the product we are editing already exists in the inventory
        // This would prevent the admin from adding a product with the exact same name again to the DB
        // If the new product name doesn't exist it will be an array of length 0.
        const duplicateProduct = await productSchema.find({
            name: productToEdit.name,
        });

        // Check if the length of the array stored to duplicateProduct is of length 0
        // meaning there is no product in the inventory with the same name
        if (duplicateProduct.length === 0) {
            await productSchema
                .findByIdAndUpdate({ _id: productToEdit._id }, productToEdit, {
                    new: true,
                })
                .then(() => {
                    return res.sendStatus(200);
                })
                .catch(() => {
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
};

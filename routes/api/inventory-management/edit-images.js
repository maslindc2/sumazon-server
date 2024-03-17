// Import the user schema we are going to use this to check that the current session is an admin user
const userSchema = require("../../../schemas/UserSchema");
// Import the product schema we will use to edit the current product
const imageSchema = require("../../../schemas/ImageSchema");
// Import the fetch image function to populate the image cache with the new changes
const productImages = require("../../api/products/product-images");
module.exports = async (req, res, cache) => {
    // Get the current user's session from passport
    const userID = req.session.passport.user;

    // Find a user in the User Schema on Mongo that matches the current user's ID
    const userFromDB = await userSchema.find({ _id: userID });

    // Extract and store the current user's role
    const userRoleFromDB = userFromDB[0].role;

    // Check that we are an admin
    if (userRoleFromDB === "admin") {
        cache.flushAll();
        if (req.body.deleteProduct === true) {
            await imageSchema
                .findOneAndDelete({ product_id: req.body.product_id })
                .then(() => {
                    productImages.initializeImageCache(cache);
                    return res.sendStatus(200);
                })
                .catch((error) => {
                    console.log(error);
                    return res.status(500);
                });
        } else {
            // Parse the product_id for the product image we want to change
            const productID = JSON.parse(req.body.productID);
            // Store the uploaded file to imageData
            const imageData = req.file.buffer;
            // Store the image's content type to contentTpe
            const contentType = req.file.mimetype;
            // Find the image associated with the product id we recevied
            // Once we found one then update the imageData and the content type entries with the new image
            await imageSchema
                .findOneAndUpdate(
                    { product_id: productID },
                    { image_data: imageData, image_content_type: contentType },
                    { upsert: true }
                )
                .then(() => {
                    return res.sendStatus(200);
                })
                .catch(() => {
                    return res.sendStatus(500);
                });
        }
    } else {
        // Return 401 if the user is not an admin
        return res.sendStatus(401);
    }
};

const userSchema = require("../../../schemas/UserSchema");
const imageSchema = require("../../../schemas/ImageSchema");
const productImages = require("../../api/products/product-images");

module.exports = async (req, res, cache) => {
    // Get the current user's session from passport
    const userID = req.session.passport.user;
    // Find a user in the User Schema on Mongo that matches the current user's ID
    const userFromDB = await userSchema.find({ _id: userID });
    // Extract and store the current user's role
    const userRoleFromDB = userFromDB[0].role;
    if (userRoleFromDB === "admin") {
        cache.flushAll();
        const productID = JSON.parse(req.body.productID);

        const newImage = new imageSchema({
            product_id: productID,
            image_data: req.file.buffer,
            image_content_type: req.file.mimetype,
        });
        await newImage
            .save()
            .then(() => {
                productImages.initializeImageCache(cache);
                return res.sendStatus(200);
            })
            .catch(() => {
                return res.sendStatus(500);
            });
    } else {
        return res.sendStatus(401);
    }
};

// Import the image schema
const imageSchema = require("../../../schemas/ImageSchema");
// Import the image utility function
const imgUtil = require("../../../utils/b64ToImg");

/**
 * This function is responsible for fetching images on BOOT.
 * When the server starts and starts listening for requests this function executes
 * and stores the images to the cache.
 * @param {*} cache Used for storing images in the cache.
 */
exports.initializeImageCache = async function (cache) {
    // Create the product image cache key
    const cacheKey = "product_images";
    // Find all images in the product schema
    await imageSchema.find({}).then((doc) => {
        // Store the product images to this array
        const productImages = [];
        // For each image we want to the product id and the converted Binary
        doc.forEach((key) => {
            productImages.push({
                product_id: key.product_id,
                image_data: imgUtil(key.image_data, key.image_content_type),
            });
        });
        // Set the product images to the cache
        cache.set(cacheKey, productImages, process.env.CACHE_EXPIRATION);
    });
};
/**
 * This function is responible for fetching and returning the images to the client.
 * This function only runs when the product inventory is updated.
 * @param {*} req Not used as this is a get endpoint. Node has a meltdown if I don't pass it req ¯\_(ツ)_/¯
 * @param {*} res Used for sending the product images back as JSON
 * @param {*} cache Used for storing the images to the cache for future requests
 * @returns Sends the product images back to the client as JSON
 */
exports.fetchImages = async function (req, res, cache) {
    // Create the product image cache key
    const cacheKey = "product_images";
    // Get the product images from the cache
    const productImages = cache.get(cacheKey);
    // If the product images cache entry is defined the return it
    if (productImages) {
        return res.status(200).json(productImages);
    } else {
        // Otherwise find all images in the product schema
        await imageSchema.find({}).then((doc) => {
            // Store the product images to this array
            const productImages = [];
            // For each image we want to the product id and the converted Binary
            doc.forEach((key) => {
                productImages.push({
                    product_id: key.product_id,
                    image_data: imgUtil(key.image_data, key.image_content_type),
                });
            });
            // Set the product images to the cache
            cache.set(cacheKey, productImages, process.env.CACHE_EXPIRATION);
            //Sends the product images back to the client as JSON
            return res.status(200).json(productImages);
        });
    }
};

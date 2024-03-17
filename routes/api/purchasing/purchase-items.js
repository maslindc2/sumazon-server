/**
 * This is the function responsible for processing orders and adding them to the orders schema
 */
const ProductSchema = require("../../../schemas/ProductSchema");
const OrderSchema = require("../../../schemas/OrderSchema");
const UserSchema = require("../../../schemas/UserSchema");

module.exports = async (req, res) => {
    // Create an array from the Object Array that was passed in the body of the request
    const shoppingCart = Array.from(req.body.cart);
    // Store the cart's sub-total from the request body's total field
    const subTotal = req.body.total;

    // Fetch the user information
    const customer = await UserSchema.findById(req.session.passport.user);
    const newOrder = OrderSchema({
        order_date: new Date(),
        products_ordered: shoppingCart,
        order_total: subTotal,
        customer_info: {
            customer_ID: req.session.passport.user,
            full_name: customer.full_name,
            email: customer.email,
            phone_number: customer.phone_number,
            address: customer.address,
        },
    });

    for (const product of shoppingCart) {
        const productFromDB = await ProductSchema.findById(product.productID);
        const inventoryQuantityAfterPurchase =
            productFromDB.item_quantity - product.quantity_purchased;
        if (inventoryQuantityAfterPurchase < 0) {
            return res.sendStatus(406);
        } else {
            // All safe to make the purchase
            // Update the store inventory to reflect the amount of inventory left after purchase
            await ProductSchema.findByIdAndUpdate(product.productID, {
                item_quantity: inventoryQuantityAfterPurchase,
            })
                .then()
                .catch((error) => console.error(error));
        }
    }
    // Save the new order created to the order schema
    await newOrder
        .save()
        .then(() => {
            return res.sendStatus(200);
        })
        .catch((error) => console.error(error));
};

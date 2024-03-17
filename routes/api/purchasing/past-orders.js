/**
 * This function is used for fetching orders from the DB
 */
const OrderSchema = require("../../../schemas/OrderSchema");
const UserSchema = require("../../../schemas/UserSchema");

module.exports = async (req, res) => {
    // Get the current user's role this will determine the response we send back
    const currentUserRole = await UserSchema.findById(
        req.session.passport.user
    );
    // If the user is an admin then return all of the orders in the database
    if (currentUserRole.role === "admin") {
        const orders = await OrderSchema.find({});
        return res.status(200).json(orders);
        // If the user is just a user then return their specific orders in the database
    } else if (currentUserRole.role === "user") {
        const order = await OrderSchema.find({
            "customer_info.customer_ID": `${req.session.passport.user._id}`,
        });
        // We only need the date of their order, the total of their order, and the products they have ordered
        const pastOrders = order.map((key) => ({
            order_date: key.order_date,
            order_total: key.order_total,
            products_ordered: key.products_ordered,
        }));
        return res.status(200).json(pastOrders);
    } else {
        // Return 401 as the user is unauthorized
        return res.sendStatus(401);
    }
};

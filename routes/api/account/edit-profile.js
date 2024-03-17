/**
 * This end point is used for editing the user's profile
 * The request body will contain all fields that the user has edited.
 * -- If the user only changed their username the only field in the request body will be the username field.
 */
const userSchema = require("../../../schemas/UserSchema");
const bCrypt = require("bcrypt");

module.exports = (req, res) => {
    // Get the current user's ID from the passport session
    const filterByUserID = { _id: req.session.passport.user._id };
    if (req.body.password !== undefined) {
        const userChanges = {};
        Object.keys(req.body).forEach((key) => {
            if (req.body[key] !== "" && req.body[key] !== undefined) {
                userChanges[key] = req.body[key];
            }
        });
        const hashedPassword = bCrypt.hashSync(req.body.password, 10);

        userChanges.password = hashedPassword;
        userSchema
            // Find the current user in the db using the userID and passing the request body to it.
            // This will update all fields that are in the request body. If it only contains the email it will only update the email.
            .findOneAndUpdate(filterByUserID, userChanges)
            .then(() => {
                // Return the status 200 with the updated profile information to the client.
                return res.sendStatus(200);
            });
    } else {
        // Check if username is defined or the email is defined
        if (req.body.username !== undefined || req.body.email !== undefined) {
            // We then need to check if the db has a record for the username or email address
            userSchema
                .findOne({
                    $or: [
                        { username: req.body.username },
                        { email: req.body.email },
                    ],
                })
                .then((user) => {
                    // If we got a record then send back error 403
                    if (user) {
                        return res.sendStatus(403);
                    } else {
                        // If mongoose didn't return a user then we are safe to update the email or the username
                        userSchema
                            // Find the current user in the db using the userID and passing the request body to it.
                            // This will update all fields that are in the request body. If it only contains the email it will only update the email.
                            .findOneAndUpdate(filterByUserID, req.body)
                            .then(() => {
                                // Return the status 200 with the updated profile information to the client.
                                return res.sendStatus(200);
                            });
                    }
                });
        } else {
            // If the user only wanted to change Full Name, Street Address, or Phone Number then we can do that here.
            userSchema
                // Find the current user in the db using the userID and passing the request body to it.
                // This will update all fields that are in the request body. If it only contains the email it will only update the email.
                .findOneAndUpdate(filterByUserID, req.body)
                .then(() => {
                    // Return the status 200 with the updated profile information to the client.
                    return res.sendStatus(200);
                });
        }
    }
};

const LocalStrategy = require("passport-local");
const userSchema = require("../../schemas/UserSchema");
const bCrypt = require("bcrypt");

module.exports = function (passport) {
    // Use the passport register local strategy
    passport.use(
        "register",
        new LocalStrategy(
            // Defining the username field we will use for registering the account
            // Also passing the request to callback
            { usernameField: "username", passReqToCallback: true },
            (req, username, password, callBack) => {
                // Attempt to find the user if they are registering in the databse using the username
                userSchema
                    .findOne({
                        $or: [
                            { username: username },
                            { email: req.body.email },
                        ],
                    })
                    .then((user) => {
                        // If the username already exists in the databse then return an error with account already exists
                        if (user) {
                            return callBack(null, false, {
                                message: "Account already exists!",
                            });
                        } else {
                            // The username does not exist so we can safely create the account
                            // Hash the password using a salt round of 10
                            const hashedPassword = bCrypt.hashSync(
                                password,
                                10
                            );
                            // Create a new user schema and define all of the fields required for registering a user
                            const newUser = new userSchema({
                                username: username,
                                full_name: req.body.full_name,
                                email: req.body.email,
                                address: req.body.address,
                                phone_number: req.body.phone_number,
                                password: hashedPassword,
                            });
                            // Save the new user
                            newUser
                                .save()
                                .then(() => {
                                    return callBack(null, newUser);
                                })
                                .catch((error) => {
                                    if (error) {
                                        throw error;
                                    }
                                });
                        }
                    })
                    .catch((error) => {
                        return callBack(error);
                    });
            }
        )
    );
};

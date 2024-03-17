// Using local strategy for passportJS
const LocalStrategy = require("passport-local").Strategy;
// Import the user schema
const userSchema = require("../../schemas/UserSchema");
// Used for hashing the user's password
const bCrypt = require("bcrypt");

module.exports = function (passport) {
    passport.use(
        "login",
        new LocalStrategy(
            { usernameField: "username" },
            (username, password, callBack) => {
                userSchema
                    .findOne({ username: username })
                    .then((user) => {
                        if (!user) {
                            return callBack(null, false, {
                                status: 404,
                                message: "Account does not exist!",
                            });
                        }
                        const isCorrectPassword = bCrypt.compareSync(
                            password,
                            user.password
                        );
                        if (isCorrectPassword) {
                            return callBack(null, user);
                        } else {
                            return callBack(null, false, {
                                status: 401,
                                message:
                                    "Incorrect password, please try again!",
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

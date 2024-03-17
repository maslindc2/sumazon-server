const login = require("./login");
const register = require("./register");
const userSchema = require("../../schemas/UserSchema");

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, {
            _id: user._id,
        });
    });
    passport.deserializeUser(function (userSession, done) {
        userSchema
            .findById(userSession._id)
            .then((user) => {
                done(null, user);
            })
            .catch((err) => {
                done(err);
            });
    });
    login(passport);
    register(passport);
};

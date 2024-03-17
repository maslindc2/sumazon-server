module.exports = (req, res, next, passport) => {
    passport.authenticate("register", (error, user, callBackError) => {
        if (error) {
            return res.status(500).json({ message: error });
        }
        // If the username already exists send back error 403
        if (!user) {
            return res.status(403).json({ message: callBackError.message });
        }
        if (user) {
            req.logIn(user, (error) => {
                if (error) {
                    return res.status(500).json({ message: error });
                }
                //Log our cookie and then send success back to 200
                const userInfoForClient = {
                    username: user.username,
                    full_name: user.full_name,
                    email: user.email,
                    address: user.address,
                    phone_number: user.phone_number,
                    role: user.role,
                };
                return res.status(200).json(userInfoForClient);
            });
        }
    })(req, res, next);
};

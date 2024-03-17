module.exports = (req, res, next, passport) => {
    passport.authenticate("login", (error, user, callBackError) => {
        if (error) {
            // If passport fails to authenticate send back status code 400
            return res.status(400);
        }
        // If the user exists (passport retruns false if the account exists, true if it doesn't)
        if (!user) {
            // Send 401 authentication http code
            if (callBackError.status === 401) {
                return res.status(401).json({ message: callBackError.message });
                // Send 404 for user not found
            } else if (callBackError.status === 404) {
                return res.status(404).json({ message: callBackError.message });
            } else {
                // Send 500 if something went wrong
                return res.status(500);
            }
        }
        req.logIn(user, (error) => {
            if (error) {
                return next(error);
            }
            // Here we create userObject the concept is the user exists in the DB so we send the information
            // back to the client.  We do this so the client can store this information in localStorage for the account page and editing information.
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
    })(req, res, next);
};

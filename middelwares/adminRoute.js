//importing jwt
const jwt = require("jsonwebtoken");
const User = require("../model/User");

//declaring a function that verify the token we can put it anywhere we want as a middelware
module.exports = async function adminRoute(req, res, next) {
    const token = req.headers.authorization;

    if (!token) return res.status(401).send("acces denied");
    try {
        const verified = jwt.verify(token, process.env.TOKEN);
        req.user = verified;
        const user = await User.findById(verified._id);
        if (user.role == 2) {
            next();
        } else res.status(401).send("Sorry You Are Not Allowed");
    } catch (error) {
        res.status(401).send("Invalid Token");
    }
};

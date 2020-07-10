const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

const auth = async (req, res, next) => {
  try {
    const key = process.env.JWT_KEY;
    const token = req.header("Authorization").replace("Bearer ", "");
    const decodedToken = jwt.verify(token, key);
    const user = await User.findOne({
      _id: decodedToken._id,
      "tokens.token": token,
    });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    res.status(401).send({
      error: "Unathorized Access",
    });
  }
};

module.exports = auth;

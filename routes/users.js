const express = require("express");
const router = express.Router();
const User = require("../models/users");

// GET all users
router.get("/", async (req, res, next) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    res.status(400).send({
      error: err,
    });
  }
});

// POST create new user
router.post("/new", async (req, res) => {
  const new_user = await new User(req.body);

  try {
    await new_user.save();
    res.status(201).send(new_user);
  } catch (err) {
    res.status(400).send({
      error: err,
    });
  }
});

module.exports = router;

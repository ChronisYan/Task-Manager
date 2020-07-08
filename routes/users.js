const express = require("express");
const router = express.Router();
const User = require("../models/users");
const validUpdate = require("../middleware/validUpdate");

// GET all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    res.status(500).send({
      error: err,
    });
  }
});

// GET specific user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).send({
        error: "User was not found",
      });
    }

    res.send(user);
  } catch (err) {
    res.status(500).send({
      error: err,
    });
  }
});

// POST create new user
router.post("/", async (req, res) => {
  const new_user = new User(req.body);

  try {
    await new_user.save();
    res.status(201).send(new_user);
  } catch (err) {
    res.status(400).send({
      error: err,
    });
  }
});

// Fields allowed to be modified
const validUpdateFields = [
  "first_name",
  "last_name",
  "username",
  "email",
  "password",
];
// PATCH update existing user
router.patch("/:id", validUpdate(validUpdateFields), async (req, res) => {
  try {
    // The model.findByIdAndUpdate method bypasses mongoose middleware

    // Find user by id
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).send({
        error: "User was not found",
      });
    }
    // Manually update user and save
    Object.keys(req.body).forEach((field) => (user[field] = req.body[field]));
    await user.save();

    res.send(user);
  } catch (err) {
    res.status(400).send({
      error: err,
    });
  }
});

//DELETE delete user by id
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).send({
        error: "User was not found",
      });
    }

    res.send(user);
  } catch (err) {
    res.status(500).send({
      error: err,
    });
  }
});

// LOGIN USER
router.post("/login", async (req, res) => {
  try {
    const user = await User.findAndAuthenticate(
      req.body.identification,
      req.body.password
    );

    // DO STUFF .....
    res.send(user);
  } catch (err) {
    res.status(400).send({
      error: err,
    });
  }
});

module.exports = router;

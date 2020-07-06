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
router.post("/new", async (req, res) => {
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
router.patch("/:id/edit", validUpdate(validUpdateFields), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return the updated resource
      runValidators: true, //re-run all existing validations
    });

    if (!user) {
      return res.status(404).send({
        error: "User was not found",
      });
    }

    res.send(user);
  } catch (err) {
    res.status(400).send({
      error: err,
    });
  }
});

//DELETE delete user by id

module.exports = router;

const express = require("express");
const router = express.Router();
const User = require("../models/users");
const validUpdate = require("../middleware/validUpdate");
const auth = require("../middleware/auth");

// POST create new user
router.post("/", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (err) {
    res.status(400).send({
      error: err,
    });
  }
});

//GET logged in user
router.get("/me", auth, (req, res) => {
  res.send(req.user);
});

// Fields allowed to be modified
const validUpdateFields = [
  "first_name",
  "last_name",
  "username",
  "email",
  "password",
];
// PATCH update logged in user
router.patch(
  "/me",
  [auth, validUpdate(validUpdateFields)],
  async (req, res) => {
    try {
      // Manually update user and save
      Object.keys(req.body).forEach(
        (field) => (req.user[field] = req.body[field])
      );

      await req.user.save();
      res.send(req.user);
    } catch (err) {
      res.status(400).send({
        error: err,
      });
    }
  }
);

//DELETE delete logged in user
router.delete("/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
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

    const token = await user.generateAuthToken();

    res.send({ user, token });
  } catch (err) {
    res.status(400).send({
      error: "Unable to login",
    });
  }
});

// LOGOUT USER
router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((t) => t.token != req.token);
    await req.user.save();
    res.send({
      msg: "You've logged out succesfully",
    });
  } catch (err) {
    res.status(500).send({
      error: err,
    });
  }
});

// LOGOUT USER (ALL TOKENS REVOKED)
router.post("/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens.length = 0;
    await req.user.save();
    res.send({
      msg: "You've succesfully logged out from all deviced",
    });
  } catch (err) {
    res.status(500).send({
      error: err,
    });
  }
});

module.exports = router;

const express = require("express");
const multer = require("multer");
const multers3 = require("multer-s3");
const s3 = require("../db/S3.config");
const router = express.Router();
const User = require("../models/user");
const validUpdate = require("../middleware/validUpdate");
const auth = require("../middleware/auth");
const deleteAvatar = require("../utils/deleteS3");

// Fields allowed to be modified
const validUpdateFields = [
  "first_name",
  "last_name",
  "username",
  "email",
  "password",
];

// POST create new user
router.post("/", validUpdate(validUpdateFields), async (req, res) => {
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

// Mutler and AWS S3 config for avatar uploading
const upload = multer({
  storage: multers3({
    s3,
    acl: "public-read",
    bucket: "bbcodetaskmanagerapi",
    metadata(req, file, cb) {
      cb(null, { filedName: file.fieldname });
    },
    key(req, file, cb) {
      cb(null, Date.now().toString() + req.user.username + file.originalname);
    },
  }),
  limits: {
    fileSize: 1048576, // max size 1MB
  },
  fileFilter(req, file, cb) {
    // allow only jpg, jped, or png
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Upload an image of types: jpg, jpeg, or png"));
    }
    cb(null, true);
  },
});
// POST upload and update profile picture
router.post(
  "/me/avatar",
  [auth, upload.single("avatar")],
  async (req, res) => {
    // console.log(req.file);
    if (req.user.avatarKey) {
      await deleteAvatar(req.user.avatarKey);
    }
    req.user.avatarKey = req.file.key;
    req.user.avatarUrl = req.file.location;
    await req.user.save();
    res.send({
      msg: "File was uploaded",
    });
  },
  (error, req, res, next) => {
    res.status(400).send({
      error: error.message,
    });
  }
);

// DELETE avatar
router.delete("/me/avatar", auth, async (req, res) => {
  try {
    if (req.user.avatarKey) {
      await deleteAvatar(req.user.avatarKey);
    }
    req.user.avatarKey = "";
    req.user.avatarUrl =
      "https://bbcodetaskmanagerapi.s3.eu-central-1.amazonaws.com/User.png";
    await req.user.save();
    res.send({
      msg: "Avatar was deleted",
    });
  } catch (err) {
    res.status(500).send({
      error: err,
    });
  }
});

module.exports = router;

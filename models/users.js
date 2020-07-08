const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Schema = mongoose.Schema;

const userSchema = new Schema({
  first_name: {
    type: String,
    required: true,
    trim: true,
  },
  last_name: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 3,
    maxlength: 35,
    validate(value) {
      if (value.includes(" ")) {
        throw new Error("Username can't include spaces");
      }
      if (value.includes("@")) {
        throw new Error("Username can't include the '@' character");
      }
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid Email");
      }
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

// Hide private data from response
userSchema.methods.toJSON = function () {
  const userObj = this.toObject();

  delete userObj.password;
  delete userObj.tokens;

  return userObj;
};

// Find and authenticate user by email/usernam and password
userSchema.statics.identifyUser = async (identification) => {
  if (validator.isEmail(identification)) {
    const user = await User.findOne({ email: identification });
    return user;
  }

  const user = await User.findOne({ username: identification });
  return user;
};
userSchema.statics.findAndAuthenticate = async (identification, password) => {
  // Find user by email or username
  const user = await User.identifyUser(identification);
  // throw error if user doesn't exist
  if (!user) {
    throw new Error("Unable to login");
  }
  // Compare passwords, throw error if it's invalid
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error("Unable to login");
  }
  // return user if password matches
  return user;
};

// Generate Auth Token method of a User instance
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const key = process.env.JWT_KEY;
  const token = jwt.sign({ _id: user._id.toString() }, key);

  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

//password hashing middleware run before saving
userSchema.pre("save", async function (next) {
  const user = this;
  // run only when the password has been modified
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;

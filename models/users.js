const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

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
    lowercase: true,
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
});

// Find and authenticate user by email/usernam and password
userSchema.statics.findAndAuthenticate = async (identification, password) => {
  // Find user by email or username
  let user;
  if (validator.isEmail(identification)) {
    user = await User.findOne({ email: identification });
  } else {
    user = await User.findOne({ username: identification });
  }
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

const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {},
  password: {},
});

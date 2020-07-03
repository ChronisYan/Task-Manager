const mongoose = require("mongoose");
const validator = require("validator");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;

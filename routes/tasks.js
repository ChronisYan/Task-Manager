const express = require("express");
const router = express.Router();
const Task = require("../models/tasks");
const validUpdate = require("../middleware/validUpdate");

// GET all tasks
router.get("/", async (req, res, next) => {
  try {
    const tasks = await Task.find({});
    res.send(tasks);
  } catch (err) {
    res.status(500).send({
      error: err,
    });
  }
});

// GET specific task by ID
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).send({
        error: "Task was not found",
      });
    }

    Object.keys(req.body).forEach((field) => (task[field] = req.body[field]));
    await task.save();

    res.send(task);
  } catch (err) {
    res.status(500).send({
      error: err,
    });
  }
});

// POST create new task
router.post("/", async (req, res) => {
  const new_task = new Task(req.body);

  try {
    await new_task.save();
    res.status(201).send(new_task);
  } catch (err) {
    res.status(400).send({
      error: err,
    });
  }
});

// Fields allowed to be modified
const validUpdateFields = ["description", "completed"];

// PATCH update existing task
router.patch("/:id", validUpdate(validUpdateFields), async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      res.status(404).send({
        error: "Task was not found",
      });
    }

    res.send(task);
  } catch (err) {
    res.status(400).send({
      error: err,
    });
  }
});

//DELETE delete user by id
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).send({
        error: "Task was not found",
      });
    }
    res.send(task);
  } catch (err) {
    res.status(500).send({
      error: err,
    });
  }
});

module.exports = router;

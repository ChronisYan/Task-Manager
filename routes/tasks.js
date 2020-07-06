const express = require("express");
const router = express.Router();
const Task = require("../models/tasks");

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

    res.send(task);
  } catch (err) {
    res.status(500).send({
      error: err,
    });
  }
});

// POST create new task
router.post("/new", async (req, res) => {
  const new_task = await new Task(req.body);

  try {
    await new_task.save();
    res.status(201).send(new_task);
  } catch (err) {
    res.status(400).send({
      error: err,
    });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Task = require("../models/tasks");

// GET all tasks
router.get("/", async (req, res, next) => {
  try {
    const tasks = await Task.find({});
    res.send(tasks);
  } catch (err) {
    res.status(400).send({
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

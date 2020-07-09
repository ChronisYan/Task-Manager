const express = require("express");
const router = express.Router();
const Task = require("../models/tasks");
const validUpdate = require("../middleware/validUpdate");
const auth = require("../middleware/auth");

// Fields allowed to be modified
const validUpdateFields = ["description", "completed"];

// POST create new task
router.post("/", [auth, validUpdate(validUpdateFields)], async (req, res) => {
  const new_task = new Task({
    owner: req.user._id,
    ...req.body,
  });

  try {
    await new_task.populate("owner").execPopulate();
    await new_task.save();
    res.status(201).send(new_task);
  } catch (err) {
    res.status(400).send({
      error: err,
    });
  }
});

// GET all user's tasks
router.get("/", auth, async (req, res, next) => {
  const match = {};
  let path = "tasks";
  let order = 1;
  let sortBy = "createdAt";
  const validOrderBy = { description: 1, completed: 1, updatedAt: 1 };

  // FILTER: completed
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }
  // SEND: only number of tasks
  if (req.query.count === "true") {
    path = "nTasks";
  }
  // OPTION: descending order (default === ascending)
  if (req.query.desc === "true" || req.query.asc === "false") {
    order = -1;
  }
  // OPTION: field to sort by
  if (req.query.sortBy in validOrderBy) {
    sortBy = req.query.sortBy;
  }

  try {
    await req.user
      .populate({
        path,
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort: {
            [sortBy]: order,
          },
        },
      })
      .execPopulate();
    if (path === "nTasks") {
      res.send({
        task_count: req.user.nTasks,
      });
    } else {
      res.send(req.user.tasks);
    }
  } catch (err) {
    res.status(500).send({
      error: err,
    });
  }
});

// GET specific user's task by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

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

// PATCH update existing task
router.patch(
  "/:id",
  [auth, validUpdate(validUpdateFields)],
  async (req, res) => {
    try {
      const task = await Task.findOne({
        _id: req.params.id,
        owner: req.user._id,
      });

      if (!task) {
        res.status(404).send({
          error: "Task was not found",
        });
      }

      Object.keys(req.body).forEach((field) => (task[field] = req.body[field]));
      await task.save();

      res.send(task);
    } catch (err) {
      res.status(400).send({
        error: err,
      });
    }
  }
);

//DELETE delete user's task by id
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

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

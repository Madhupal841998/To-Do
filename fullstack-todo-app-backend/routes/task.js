// routes/task.js
const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = express.Router();

// Create new task
router.post('/', auth, async (req, res) => {
  try {
    const task = new Task({ ...req.body, createdBy: req.user.id });
    await task.save();
    req.app.get('socketio').emit('taskCreated', task); // WebSocket notification
    res.status(201).send(task);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Update a task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true }
    );
    console.log(task);
    
    if (!task) return res.status(404).send('Task not found');

    req.app.get('socketio').emit('taskUpdated', task); // WebSocket notification
    res.send(task);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Delete a task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!task) return res.status(404).send('Task not found');

    req.app.get('socketio').emit('taskDeleted', req.params.id); // WebSocket notification
    res.send({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get all tasks for a user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user.id });
    res.send(tasks);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Get all tasks for a specific board
router.get('/board/:boardId', protect, getTasks);

// Create task in a specific board
router.post('/board/:boardId', protect, createTask);

// Update/Delete specific task
router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, deleteTask);

module.exports = router;

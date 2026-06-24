const Board = require('../models/Board');
const Task = require('../models/Task');

const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json({ boards: [], tasks: [] });
    }

    const regex = new RegExp(q, 'i'); // Case-insensitive regex

    // Search Boards
    const boards = await Board.find({
      owner: req.user._id,
      $or: [
        { title: { $regex: regex } },
        { description: { $regex: regex } }
      ]
    }).limit(5);

    // Search Tasks
    const tasks = await Task.find({
      owner: req.user._id,
      $or: [
        { title: { $regex: regex } },
        { description: { $regex: regex } }
      ]
    }).populate('board', 'title').limit(5);

    res.json({ boards, tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { globalSearch };

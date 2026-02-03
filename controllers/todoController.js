const Todo = require('../model/todoModel');
const Joi = require('joi');
const mongoose = require('mongoose'); // Add this import for ObjectId

// Joi schema for Todo validation
const todoSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().allow(''), // Optional
  category: Joi.string().allow(''), // Optional
  dueDate: Joi.date().optional() // Optional
});

// Create Todo
exports.createTodo = async (req, res) => {
  try {
    const { error } = todoSchema.validate(req.body);
    if (error) return res.status(400).json({ isSuccess: false, message: error.details[0].message });

    const { title, description, category, dueDate } = req.body;

    const todo = new Todo({
      title,
      description,
      category,
      dueDate,
      createdBy: new mongoose.Types.ObjectId(req.user.id) // Ensure ObjectId
    });

    await todo.save();
    res.status(201).json({ isSuccess: true, message: 'Todo created successfully', data: todo });
  } catch (err) {
    res.status(500).json({ isSuccess: false, message: 'Internal server error' });
  }
};

// Get all Todos for logged-in user (with pagination)
exports.getTodos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fix: Cast to ObjectId
    const userId = new mongoose.Types.ObjectId(req.user.id);
    console.log('Fetching todos for user:', userId); // Temporary debug log

    const todos = await Todo.find({ createdBy: userId }).skip(skip).limit(limit);
    const total = await Todo.countDocuments({ createdBy: userId });

    res.json({ isSuccess: true, message: 'Todos fetched successfully', data: { todos, total, page, limit } });
  } catch (err) {
    res.status(500).json({ isSuccess: false, message: 'Internal server error' });
  }
};

// Get single Todo by ID
exports.getTodoById = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const todo = await Todo.findOne({ _id: req.params.id, createdBy: userId });
    if (!todo) return res.status(404).json({ isSuccess: false, message: 'Todo not found' });
    res.json({ isSuccess: true, message: 'Todo fetched successfully', data: todo });
  } catch (err) {
    res.status(500).json({ isSuccess: false, message: 'Internal server error' });
  }
};

// Update Todo
exports.updateTodo = async (req, res) => {
  try {
    const { error } = todoSchema.validate(req.body);
    if (error) return res.status(400).json({ isSuccess: false, message: error.details[0].message });

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, createdBy: userId },
      req.body,
      { new: true }
    );

    if (!todo) return res.status(404).json({ isSuccess: false, message: 'Todo not found' });
    res.json({ isSuccess: true, message: 'Todo updated successfully', data: todo });
  } catch (err) {
    res.status(500).json({ isSuccess: false, message: 'Internal server error' });
  }
};

// Delete Todo
exports.deleteTodo = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, createdBy: userId });
    if (!todo) return res.status(404).json({ isSuccess: false, message: 'Todo not found' });
    res.json({ isSuccess: true, message: 'Todo deleted successfully' });
  } catch (err) {
    res.status(500).json({ isSuccess: false, message: 'Internal server error' });
  }
};
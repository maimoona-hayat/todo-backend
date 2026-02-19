const Todo = require('../model/Todo');
const Joi = require('joi');

// Todo validation schema
const todoSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().allow(''),
  category: Joi.string().allow(''),
  dueDate: Joi.date().required(),
  isCompleted: Joi.boolean().optional()
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
      createdBy: req.user.id
    });

    await todo.save();

    res.status(201).json({ isSuccess: true, message: 'Todo created', data: todo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ isSuccess: false, message: 'Internal server error' });
  }
};

// Get Todos
exports.getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ isSuccess: true, data: { todos, total: todos.length } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ isSuccess: false, message: 'Internal server error' });
  }
};

// Get Todo by ID
exports.getTodoById = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ isSuccess: false, message: 'Todo not found' });
    res.json({ isSuccess: true, data: todo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ isSuccess: false, message: 'Internal server error' });
  }
};

// Update Todo
exports.updateTodo = async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;

    const { error } = todoSchema.validate(updateData);
    if (error) return res.status(400).json({ isSuccess: false, message: error.details[0].message });

    const todo = await Todo.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!todo) return res.status(404).json({ isSuccess: false, message: 'Todo not found' });

    res.json({ isSuccess: true, message: 'Todo updated', data: todo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ isSuccess: false, message: 'Internal server error' });
  }
};

// Delete Todo
exports.deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ isSuccess: false, message: 'Todo not found' });
    res.json({ isSuccess: true, message: 'Todo deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ isSuccess: false, message: 'Internal server error' });
  }
};
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
// Create Todo
exports.createTodo = async (req, res) => {
  try {
    // ✅ Remove createdBy from req.body before validation
    const { createdBy, ...validData } = req.body;
    
    const { error } = todoSchema.validate(validData);
    if (error) return res.status(400).json({ isSuccess: false, message: error.details[0].message });

    const { title, description, category, dueDate } = validData;

    const todo = new Todo({
      title,
      description,
      category,
      dueDate,
      createdBy: req.user.id  // Set by server from token
    });

    await todo.save();

    res.status(201).json({ isSuccess: true, message: 'Todo created', data: todo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ isSuccess: false, message: 'Internal server error' });
  }
};

// Get Todos (with pagination)
exports.getTodos = async (req, res) => {
  try {
    // Get page from query params, default to 1
    const page = parseInt(req.query.page) || 1;
    const limit = 6; // 6 todos per page
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Todo.countDocuments({ createdBy: req.user.id });

    // Get paginated todos
    const todos = await Todo.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ 
      isSuccess: true, 
      data: { 
        todos, 
        total,
        page,
        totalPages: Math.ceil(total / limit)
      } 
    });
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
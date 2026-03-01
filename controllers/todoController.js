const Todo = require("../model/Todo");
const Joi = require("joi");
const redisClient = require("../config/redis");

// Todo validation schema
const todoSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().allow(""),
  category: Joi.string().allow(""),
  dueDate: Joi.date().required(),
  isCompleted: Joi.boolean().optional(),
});

// Create Todo
exports.createTodo = async (req, res) => {
  try {
    const { createdBy, ...validData } = req.body;

    const { error } = todoSchema.validate(validData);
    if (error)
      return res
        .status(400)
        .json({ isSuccess: false, message: error.details[0].message });

    const { title, description, category, dueDate } = validData;

    const todo = new Todo({
      title,
      description,
      category,
      dueDate,
      createdBy: req.user.id,
    });

    await todo.save();

    res
      .status(201)
      .json({ isSuccess: true, message: "Todo created", data: todo });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ isSuccess: false, message: "Internal server error" });
  }
};

// Get Todos
exports.getTodos = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `todos:${userId}:all`; // key for all todos

    //  Check Redis cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json({
        isSuccess: true,
        data: JSON.parse(cached),
        source: "cache", // indicates data came from Redis
      });
    }

    //  Fetch from MongoDB
    const todos = await Todo.find({ createdBy: userId }).sort({
      createdAt: -1,
    });

    //  Save to Redis (expire in 60 sec)
    await redisClient.setEx(cacheKey, 60, JSON.stringify(todos));

    //  Send response
    res.json({
      isSuccess: true,
      data: todos,
      source: "db", // indicates data came from MongoDB
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ isSuccess: false, message: "Internal server error" });
  }
};
// Get Todo by ID
exports.getTodoById = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo)
      return res
        .status(404)
        .json({ isSuccess: false, message: "Todo not found" });
    res.json({ isSuccess: true, data: todo });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ isSuccess: false, message: "Internal server error" });
  }
};

// Update Todo
exports.updateTodo = async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;

    const { error } = todoSchema.validate(updateData);
    if (error)
      return res
        .status(400)
        .json({ isSuccess: false, message: error.details[0].message });

    const todo = await Todo.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!todo)
      return res
        .status(404)
        .json({ isSuccess: false, message: "Todo not found" });

    res.json({ isSuccess: true, message: "Todo updated", data: todo });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ isSuccess: false, message: "Internal server error" });
  }
};

// Delete Todo
exports.deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo)
      return res
        .status(404)
        .json({ isSuccess: false, message: "Todo not found" });
    res.json({ isSuccess: true, message: "Todo deleted" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ isSuccess: false, message: "Internal server error" });
  }
};

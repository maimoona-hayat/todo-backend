const Todo = require("../model/Todo");
const Joi = require("joi");
const redisClient = require("../config/redis");

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
    await redisClient.del(`todos:${req.user.id}:page:1`);  // ✅ After save

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
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;
    const cacheKey = `todos:${userId}:page:${page}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json({
        isSuccess: true,
        data: JSON.parse(cached),
        source: "cache",
      });
    }

    const todos = await Todo.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Todo.countDocuments({ createdBy: userId });

    const responseData = {
      todos,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };

    await redisClient.setEx(cacheKey, 60, JSON.stringify(responseData));

    res.json({
      isSuccess: true,
      data: responseData,
      source: "db",
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

    await redisClient.del(`todos:${req.user.id}:page:1`);  // ✅ AFTER update, BEFORE response

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

    await redisClient.del(`todos:${req.user.id}:page:1`);  // ✅ AFTER delete, BEFORE response

    res.json({ isSuccess: true, message: "Todo deleted" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ isSuccess: false, message: "Internal server error" });
  }
};
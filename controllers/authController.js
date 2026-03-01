const Joi = require("joi");
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// -------------------- Schemas --------------------

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// -------------------- Register --------------------
exports.register = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ isSuccess: false, message: error.details[0].message });

    const { username, email, password } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser)
      return res
        .status(400)
        .json({
          isSuccess: false,
          message: "Email or username already exists",
        });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get profile image URL from Cloudinary (if uploaded)
    const profileImage = req.file ? req.file.path : "";

    // Save user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      profileImage,
    });
    await user.save();

    const { password: pwd, ...userData } = user._doc;

    res.status(201).json({
      isSuccess: true,
      message: "User registered successfully",
      data: userData,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ isSuccess: false, message: "Internal server error" });
  }
};

// -------------------- Login --------------------
exports.login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ isSuccess: false, message: error.details[0].message });

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ isSuccess: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ isSuccess: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const { password: pwd, ...userData } = user._doc;

    res.json({
      isSuccess: true,
      message: "Login successful",
      data: { token, user: userData },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ isSuccess: false, message: "Internal server error" });
  }
};

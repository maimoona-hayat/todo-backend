const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const { register, login } = require('../controllers/authController');

const upload = multer({ storage: storage });

router.post('/register', upload.single('profileImage'), register);
router.post('/login', login);

module.exports = router;
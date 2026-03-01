const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('x-auth-token');
  console.log("Backend received token:", authHeader); 
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, auth denied' });
  }

  try {
    const decoded = jwt.verify(authHeader, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("Token error:", err.message);
    res.status(401).json({ message: 'Token invalid' });
  }
};

module.exports = authMiddleware;
//src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 1️⃣ التحقق من التوكن
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader)
    return res.status(401).json({ success: false, message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token)
    return res.status(401).json({ success: false, message: 'Malformed token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, username, role }
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
}

// 2️⃣ التحقق من صلاحية Admin
function authorizeAdmin(req, res, next) {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
}

module.exports = {
  authMiddleware,
  authorizeAdmin
};

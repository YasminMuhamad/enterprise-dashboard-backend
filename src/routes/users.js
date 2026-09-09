//src/routes/users.js
const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeAdmin } = require('../middlewares/authMiddleware');
const {
  getUsers,
  createUser,
  updateUser,
  disableUser
} = require('../controllers/usersController');

// Admin فقط
router.get('/', authMiddleware, authorizeAdmin, getUsers);
router.post('/', authMiddleware, authorizeAdmin, createUser);
router.put('/:id', authMiddleware, authorizeAdmin, updateUser);
router.patch('/:id/disable', authMiddleware, authorizeAdmin, disableUser);

module.exports = router;
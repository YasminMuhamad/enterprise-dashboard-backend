//src/routes/spaces.js
const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeAdmin } = require('../middlewares/authMiddleware');
const {
  getAllSpaces,
  createSpace,
  updateSpaceStatus,
} = require('../controllers/spacesController');

// كل اليوزرات مسموح لهم يشوفوا المساحات
router.get('/', authMiddleware, getAllSpaces);

// Admin فقط يقدر يعمل تعديل، إضافة، حذف
router.post('/', authMiddleware, authorizeAdmin, createSpace);
router.patch('/:id/status', authMiddleware, authorizeAdmin, updateSpaceStatus);

module.exports = router;
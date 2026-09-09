//src/routes/events.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware').authMiddleware;
const admin = require('../middlewares/authMiddleware').authorizeAdmin;

const {
  getAllEvents,
  createEvent,
  updateEvent,
  archiveEvent
} = require('../controllers/eventsController');

// عرض الفعاليات
router.get('/', auth, getAllEvents);

// إنشاء وتعديل (Admin + DataEntry)
router.post('/', auth, createEvent);
router.put('/:id', auth, updateEvent);

// أرشفة (Admin فقط)
router.patch('/:id/archive', auth, admin, archiveEvent);

module.exports = router;
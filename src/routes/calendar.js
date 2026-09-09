//src/routes/calendar.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware').authMiddleware;

const { getCalendarDays } = require('../controllers/calendarController');

// Range Calendar
router.get('/range', auth, getCalendarDays);

module.exports = router;
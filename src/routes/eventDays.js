//src/routes/eventDays.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware').authMiddleware;

const { getEventDays } = require('../controllers/eventDaysController');

router.get('/', auth, getEventDays);

module.exports = router;
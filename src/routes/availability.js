//src/routes/availability.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware').authMiddleware;

const { checkAvailability } = require('../controllers/availabilityController');

router.get('/', auth, checkAvailability);

module.exports = router;
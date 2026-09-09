//src/routes/bookingPeriods.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');

const {
  getBookingPeriods,
  createBookingPeriod,
  updateBookingPeriod,
  deleteBookingPeriod
} = require('../controllers/bookingPeriodsController');

router.get('/', authMiddleware, getBookingPeriods);
router.post('/', authMiddleware, createBookingPeriod);
router.put('/:id', authMiddleware, updateBookingPeriod);
router.delete('/:id', authMiddleware, deleteBookingPeriod);

module.exports = router;
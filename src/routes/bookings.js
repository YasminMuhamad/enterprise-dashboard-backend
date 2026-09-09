//src/routes/bookings.js
const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeAdmin } = require('../middlewares/authMiddleware');
const {
  getBookings,
  createBooking,
  updateBooking,
  archiveBooking
} = require('../controllers/bookingsController');

router.get('/', authMiddleware, getBookings);
router.post('/', authMiddleware, createBooking);
router.put('/:id', authMiddleware, updateBooking);
router.patch('/:id/archive', authMiddleware, authorizeAdmin, archiveBooking);

module.exports = router;
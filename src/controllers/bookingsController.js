//src/controllers/bookingsController.js
const { getConnection } = require('../config/db');
const { logAction } = require('../utils/auditLog');

// ==============================
// جلب كل الحجوزات
// ==============================
async function getBookings(req, res) {
  try {
    const conn = await getConnection();

    let query = `
      SELECT 
        b.booking_id,
        b.event_id,
        b.status,
        b.created_by,
        b.created_at,
        e.event_name
      FROM Bookings b
      JOIN Events e ON b.event_id = e.event_id
    `;

    const params = [];

    if (req.user.role === 'DataEntry') {
      query += ' WHERE b.created_by = ?';
      params.push(req.user.userId);
    }

    const [rows] = await conn.query(query, params);
    res.json({ success: true, bookings: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ==============================
// إنشاء حجز جديد
// ==============================
async function createBooking(req, res) {
  const { event_id } = req.body;

  if (!event_id) {
    return res.status(400).json({ success: false, message: 'event_id is required' });
  }

  try {
    const conn = await getConnection();

    const [result] = await conn.query(
      `INSERT INTO Bookings (event_id, created_by)
       VALUES (?, ?)`,
      [event_id, req.user.userId]
    );

    await logAction({
      userId: req.user.userId,
      action: 'Create',
      tableName: 'Bookings',
      recordId: result.insertId,
      details: `Booking created for event ${event_id}`
    });

    res.json({ success: true, booking_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ==============================
// تعديل الحجز (مثلاً تغيير الفعالية)
// ==============================
async function updateBooking(req, res) {
  const { id } = req.params;
  const { event_id, status } = req.body;

  if (!event_id && !status) {
    return res.status(400).json({
      success: false,
      message: 'Nothing to update'
    });
  }

  try {
    const conn = await getConnection();

    const fields = [];
    const params = [];

    if (event_id) {
      fields.push('event_id = ?');
      params.push(event_id);
    }

    if (status) {
      fields.push('status = ?');
      params.push(status);
    }

    params.push(id);

    const [result] = await conn.query(
      `UPDATE Bookings SET ${fields.join(', ')} WHERE booking_id = ?`,
      params
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await logAction({
      userId: req.user.userId,
      action: 'Update',
      tableName: 'Bookings',
      recordId: id,
      details: `Booking updated`
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ==============================
// أرشفة الحجز (Soft Delete)
// ==============================
async function archiveBooking(req, res) {
  const { id } = req.params;

  try {
    const conn = await getConnection();

    const [result] = await conn.query(
      `UPDATE Bookings SET status = 'Archived' WHERE booking_id = ?`,
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await logAction({
      userId: req.user.userId,
      action: 'Archive',
      tableName: 'Bookings',
      recordId: id,
      details: 'Booking archived'
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getBookings,
  createBooking,
  updateBooking,
  archiveBooking
};
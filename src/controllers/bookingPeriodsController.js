// controllers/bookingPeriodsController.js
const { getConnection } = require('../config/db');
const { logAction } = require('../utils/auditLog');

// ==============================
// GET Booking Periods
// ==============================
async function getBookingPeriods(req, res) {
  try {
    const conn = await getConnection();
    const { booking_id } = req.query;

    // ✅ لو جاي booking_id نتحقق إنه موجود
    if (booking_id) {
      const [[booking]] = await conn.query(
        `SELECT booking_id FROM Bookings WHERE booking_id = ?`,
        [booking_id]
      );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
    }

    let query = `
      SELECT bp.*, s.name_en AS space_name
      FROM Booking_Periods bp
      JOIN Spaces s ON bp.space_id = s.space_id
      WHERE 1=1
    `;
    const params = [];

    if (booking_id) {
      query += ' AND bp.booking_id = ?';
      params.push(booking_id);
    }

    const [rows] = await conn.query(query, params);

    res.json({ success: true, periods: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ==============================
// CREATE Booking Period + EventDays
// ==============================
async function createBookingPeriod(req, res) {
  const { booking_id, space_id, start_date, end_date, usage_type } = req.body;

  try {
    const conn = await getConnection();

    // 🔴 Check conflicts
    const [conflict] = await conn.query(
      `SELECT 1 FROM EventDays
       WHERE space_id = ? AND event_date BETWEEN ? AND ?`,
      [space_id, start_date, end_date]
    );

    if (conflict.length) {
      return res.status(400).json({
        success: false,
        message: 'Space already booked in this period'
      });
    }

    // Insert period
    const [result] = await conn.query(
      `INSERT INTO Booking_Periods
       (booking_id, space_id, start_date, end_date, usage_type)
       VALUES (?, ?, ?, ?, ?)`,
      [booking_id, space_id, start_date, end_date, usage_type]
    );

    const period_id = result.insertId;

    // Generate EventDays
    const start = new Date(start_date);
    const end = new Date(end_date);
    const days = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push([
        booking_id,
        space_id,
        d.toISOString().slice(0, 10),
        usage_type,
        period_id
      ]);
    }

    await conn.query(
      `INSERT INTO EventDays
       (booking_id, space_id, event_date, usage_type, period_id)
       VALUES ?`,
      [days]
    );

    await logAction({
      userId: req.user.userId,
      action: 'Create',
      tableName: 'Booking_Periods',
      recordId: period_id,
      details: `Space ${space_id} from ${start_date} to ${end_date}`
    });

    res.json({ success: true, period_id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ==============================
// UPDATE Booking Period
// ==============================
async function updateBookingPeriod(req, res) {
  const { id } = req.params;
  const { start_date, end_date, usage_type } = req.body;

  try {
    const conn = await getConnection();

    // 🔴 Check conflicts
    const [[period]] = await conn.query(
      `SELECT * FROM Booking_Periods WHERE period_id=?`,
      [id]
    );

    if (!period) {
      return res.status(404).json({ success: false, message: 'Period not found' });
    }

    const [conflict] = await conn.query(
      `SELECT 1 FROM EventDays
       WHERE space_id = ? AND event_date BETWEEN ? AND ? AND period_id <> ?`,
      [period.space_id, start_date, end_date, id]
    );

    if (conflict.length) {
      return res.status(400).json({
        success: false,
        message: 'Space already booked in this period'
      });
    }

    // Update period
    await conn.query(
      `UPDATE Booking_Periods
       SET start_date=?, end_date=?, usage_type=?
       WHERE period_id=?`,
      [start_date, end_date, usage_type, id]
    );

    // Delete old EventDays
    await conn.query(`DELETE FROM EventDays WHERE period_id=?`, [id]);

    // Regenerate EventDays
    const days = [];
    for (let d = new Date(start_date); d <= new Date(end_date); d.setDate(d.getDate() + 1)) {
      days.push([
        period.booking_id,
        period.space_id,
        d.toISOString().slice(0, 10),
        usage_type,
        id
      ]);
    }

    await conn.query(
      `INSERT INTO EventDays
       (booking_id, space_id, event_date, usage_type, period_id)
       VALUES ?`,
      [days]
    );

    await logAction({
      userId: req.user.userId,
      action: 'Update',
      tableName: 'Booking_Periods',
      recordId: id
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ==============================
// DELETE Booking Period
// ==============================
async function deleteBookingPeriod(req, res) {
  const { id } = req.params;

  try {
    const conn = await getConnection();

    await conn.query(`DELETE FROM EventDays WHERE period_id=?`, [id]);
    await conn.query(`DELETE FROM Booking_Periods WHERE period_id=?`, [id]);

    await logAction({
      userId: req.user.userId,
      action: 'Delete',
      tableName: 'Booking_Periods',
      recordId: id
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getBookingPeriods,
  createBookingPeriod,
  updateBookingPeriod,
  deleteBookingPeriod
};
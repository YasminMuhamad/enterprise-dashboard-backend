// controllers/eventDaysController.js
const { getConnection } = require('../config/db');

async function getEventDays(req, res) {
  const { space_id, from, to } = req.query;

  try {
    const conn = await getConnection();

    let query = `
      SELECT 
        ed.event_day_id,
        ed.event_date,
        ed.usage_type,

        s.space_id,
        s.name_en AS space_name,

        e.event_id,
        e.event_name,

        bp.period_id,
        bp.start_date,
        bp.end_date

      FROM EventDays ed
      JOIN Booking_Periods bp ON ed.period_id = bp.period_id
      JOIN Spaces s ON bp.space_id = s.space_id
      JOIN Bookings b ON bp.booking_id = b.booking_id
      JOIN Events e ON b.event_id = e.event_id
      WHERE 1=1
    `;

    const params = [];

    if (space_id) {
      query += ` AND s.space_id = ?`;
      params.push(space_id);
    }

    if (from && to) {
      query += ` AND ed.event_date BETWEEN ? AND ?`;
      params.push(from, to);
    }

    // DataEntry يشوف بس اللي هو عامله
    if (req.user.role === 'DataEntry') {
      query += ` AND b.created_by = ?`;
      params.push(req.user.userId);
    }

    const [rows] = await conn.query(query, params);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getEventDays };
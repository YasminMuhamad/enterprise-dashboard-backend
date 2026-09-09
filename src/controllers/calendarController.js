// controllers/calendarController.js
const { getConnection } = require('../config/db');

// 📅 Range calendar (Timeline / Gantt)
async function getCalendarDays(req, res) {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({
      success: false,
      message: 'start and end dates are required'
    });
  }

  try {
    const conn = await getConnection();

    let query = `
      SELECT 
        ed.event_date,
        ed.usage_type,
        s.space_id,
        s.space_code,
        s.name_en AS space_name,
        e.event_id,
        e.event_name,
        b.booking_id
      FROM EventDays ed
      JOIN Spaces s ON ed.space_id = s.space_id
      JOIN Bookings b ON ed.booking_id = b.booking_id
      JOIN Events e ON b.event_id = e.event_id
      WHERE ed.event_date BETWEEN ? AND ?
    `;

    const params = [start, end];

    if (req.user.role === 'DataEntry') {
      query += ' AND b.created_by = ?';
      params.push(req.user.userId);
    }

    query += ' ORDER BY ed.event_date, s.space_id';

    const [rows] = await conn.query(query, params);

    res.json({ success: true, calendar: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load calendar' });
  }
}

module.exports = {
  getCalendarDays
};
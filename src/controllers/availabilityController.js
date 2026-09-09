//src/controllers/availabilityController.js
const { getConnection } = require('../config/db');

async function checkAvailability(req, res) {
  const { space_id, from, to } = req.query;

  try {
    const conn = await getConnection();

    // كل الأيام المحجوزة
    const [bookedDays] = await conn.query(
      `SELECT event_date, usage_type
       FROM EventDays
       WHERE space_id = ?
       AND event_date BETWEEN ? AND ?`,
      [space_id, from, to]
    );

    const bookedMap = {};
    bookedDays.forEach(d => {
      bookedMap[d.event_date.toISOString().slice(0,10)] = d.usage_type;
    });

    const days = [];
    for (
      let d = new Date(from);
      d <= new Date(to);
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().slice(0, 10);

      days.push({
        date: dateStr,
        available: !bookedMap[dateStr],
        usage_type: bookedMap[dateStr] || null
      });
    }

    res.json({
      success: true,
      space_id,
      days
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { checkAvailability };
// controllers/eventsController.js
const { getConnection } = require('../config/db');
const { logAction } = require('../utils/auditLog');

// جلب كل الفعاليات
async function getAllEvents(req, res) {
  try {
    const conn = await getConnection();
    const [rows] = await conn.query(`
      SELECT e.*, u.username AS created_by_name
      FROM Events e
      LEFT JOIN Users u ON e.created_by = u.user_id
    `);

    res.json({ success: true, events: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// إنشاء فعالية
async function createEvent(req, res) {
  const { event_code, event_name, organizer_name } = req.body;

  try {
    const conn = await getConnection();
    const [result] = await conn.query(
      `INSERT INTO Events 
       (event_code, event_name, organizer_name, created_by)
       VALUES (?, ?, ?, ?)`,
      [event_code, event_name, organizer_name, req.user.userId]
    );

    // AUDIT LOG
    await logAction({
      userId: req.user.userId,
      action: 'Create',
      tableName: 'Events',
      recordId: result.insertId,
      details: `Created event ${event_name}`
    });

    res.json({ success: true, message: 'Event created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// تعديل فعالية
async function updateEvent(req, res) {
  const { id } = req.params;
  const { event_name, organizer_name, status } = req.body;

  try {
    const conn = await getConnection();
    const [result] = await conn.query(
      `UPDATE Events 
       SET event_name = ?, organizer_name = ?, status = ?
       WHERE event_id = ?`,
      [event_name, organizer_name, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // AUDIT LOG
    await logAction({
      userId: req.user.userId,
      action: 'Update',
      tableName: 'Events',
      recordId: id,
      details: `Updated event ${id}`
    });

    res.json({ success: true, message: 'Event updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// أرشفة فعالية
async function archiveEvent(req, res) {
  const { id } = req.params;

  try {
    const conn = await getConnection();
    const [result] = await conn.query(
      `UPDATE Events SET status = 'Archived' WHERE event_id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // AUDIT LOG
    await logAction({
      userId: req.user.userId,
      action: 'Archive',
      tableName: 'Events',
      recordId: id,
      details: 'Event archived'
    });

    res.json({ success: true, message: 'Event archived successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getAllEvents,
  createEvent,
  updateEvent,
  archiveEvent
};
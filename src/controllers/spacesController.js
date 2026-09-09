// controllers/spacesController.js
const { getConnection } = require('../config/db');
const { logAction } = require('../utils/auditLog');

// جلب كل المساحات
async function getAllSpaces(req, res) {
  try {
    const conn = await getConnection();
    const [rows] = await conn.query('SELECT * FROM Spaces');
    res.json({ success: true, spaces: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// إضافة مساحة جديدة
async function createSpace(req, res) {
  const { space_code, name_en, category, zone, status } = req.body;

  try {
    const conn = await getConnection();
    const [result] = await conn.query(
      `INSERT INTO Spaces (space_code, name_en, category, zone, status)
       VALUES (?, ?, ?, ?, ?)`,
      [space_code, name_en, category, zone, status || 'Available']
    );

    // AUDIT LOG
    await logAction({
      userId: req.user.userId,
      action: 'Create',
      tableName: 'Spaces',
      recordId: result.insertId,
      details: `Created space ${name_en}`
    });

    res.json({ success: true, message: 'Space created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// تعديل حالة المساحة
async function updateSpaceStatus(req, res) {
  const { id } = req.params;
  const { status, disable_reason } = req.body;

  try {
    const conn = await getConnection();
    const [result] = await conn.query(
      `UPDATE Spaces 
       SET status = ?, disable_reason = ?
       WHERE space_id = ?`,
      [status, disable_reason || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Space not found' });
    }

    // AUDIT LOG
    await logAction({
      userId: req.user.userId,
      action: 'Update',
      tableName: 'Spaces',
      recordId: id,
      details: `Status changed to ${status}`
    });

    res.json({ success: true, message: 'Space status updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getAllSpaces,
  createSpace,
  updateSpaceStatus
};
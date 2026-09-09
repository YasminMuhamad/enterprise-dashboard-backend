const { getConnection } = require('../config/db');

async function logAction({ userId, action, tableName, recordId, details }) {
  try {
    const conn = await getConnection();
    await conn.query(
      `INSERT INTO AuditLog (user_id, action, table_name, record_id, details)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, action, tableName, recordId, details || null]
    );
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
}

module.exports = { logAction };
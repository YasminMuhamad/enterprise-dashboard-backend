// controllers/usersController.js
const { getConnection } = require('../config/db');
const bcrypt = require('bcrypt');
const { logAction } = require('../utils/auditLog');

// جلب كل المستخدمين
async function getUsers(req, res) {
  try {
    const conn = await getConnection();
    const [rows] = await conn.query(
      'SELECT user_id, username, role, status, created_at FROM Users'
    );
    res.json({ success: true, users: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// إنشاء مستخدم
async function createUser(req, res) {
  const { username, password, role, status } = req.body;

  try {
    const conn = await getConnection();
    const hashed = await bcrypt.hash(password, 10);

    const [result] = await conn.query(
      `INSERT INTO Users (username, password_hash, role, status)
       VALUES (?, ?, ?, ?)`,
      [username, hashed, role, status || 'Active']
    );

    await logAction({
      userId: req.user.userId,
      action: 'Create',
      tableName: 'Users',
      recordId: result.insertId,
      details: `Created user ${username}`
    });

    res.json({ success: true, message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// تعديل مستخدم
async function updateUser(req, res) {
  const { id } = req.params;
  const { username, password, role, status } = req.body;

  try {
    const conn = await getConnection();

    let query = 'UPDATE Users SET username=?, role=?, status=?';
    let params = [username, role, status];

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      query += ', password_hash=?';
      params.push(hashed);
    }

    query += ' WHERE user_id=?';
    params.push(id);

    const [result] = await conn.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await logAction({
      userId: req.user.userId,
      action: 'Update',
      tableName: 'Users',
      recordId: id,
      details: `Updated user ${id}`
    });

    res.json({ success: true, message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// تعطيل مستخدم (Soft Delete)
async function disableUser(req, res) {
  const { id } = req.params;

  try {
    const conn = await getConnection();
    const [result] = await conn.query(
      'UPDATE Users SET status="Inactive" WHERE user_id=?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await logAction({
      userId: req.user.userId,
      action: 'Disable',
      tableName: 'Users',
      recordId: id,
      details: 'User deactivated'
    });

    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getUsers,
  createUser,
  updateUser,
  disableUser
};
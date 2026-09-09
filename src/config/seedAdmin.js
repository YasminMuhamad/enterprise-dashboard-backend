// src/config/seedAdmin.js
const { getConnection } = require('./db');
const bcrypt = require('bcrypt');

async function seedAdmin() {
  try {
    const conn = await getConnection();
    const hashed = await bcrypt.hash('Admin@123', 10);
    await conn.query(
      'INSERT INTO Users (username, password_hash, role, status) VALUES (?, ?, ?, ?)',
      ['admin', hashed, 'Admin', 'Active']
    );
    console.log('✅ Admin user created successfully!');
  } catch (err) {
    console.error('❌ Failed to create admin:', err);
  }
}

seedAdmin();
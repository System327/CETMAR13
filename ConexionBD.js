const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',               // ← tu usuario de MySQL
  password: 'root', // ← tu contraseña
  database: 'cetmar13',     // ← nombre de tu base de datos
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;



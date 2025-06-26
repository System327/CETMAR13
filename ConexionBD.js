const mysql = require('mysql2/promise');

const pool = mysql.createPool(process.env.MYSQL_URL); // Aquí se usa la URL completa

module.exports = pool;

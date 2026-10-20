const mysql = require('mysql2/promise');
const { db } = require('./config');

// Pool de connexions. decimalNumbers : DECIMAL renvoyé comme nombre JS (pas string).
const pool = mysql.createPool({
  host: db.host,
  port: db.port,
  user: db.user,
  password: db.password,
  database: db.database,
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
  charset: 'utf8mb4',
});

module.exports = pool;

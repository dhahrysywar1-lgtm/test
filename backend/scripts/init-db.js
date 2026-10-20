const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { db } = require('../src/config');

const DB_DIR = path.join(__dirname, '..', '..', 'database');

// Crée la base (si besoin), la table products, et optionnellement insère les données de démo.
async function run({ seed = false } = {}) {
  const conn = await mysql.createConnection({
    host: db.host,
    port: db.port,
    user: db.user,
    password: db.password,
    multipleStatements: true,
  });
  try {
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await conn.query(`USE \`${db.database}\``);
    await conn.query(fs.readFileSync(path.join(DB_DIR, 'schema.sql'), 'utf8'));
    if (seed) await conn.query(fs.readFileSync(path.join(DB_DIR, 'seed.sql'), 'utf8'));
  } finally {
    await conn.end();
  }
}

module.exports = { run };

if (require.main === module) {
  run()
    .then(() => console.log(`✔ Base "${db.database}" et table "products" prêtes`))
    .catch((err) => {
      console.error('✘ Initialisation impossible :', err.message);
      process.exit(1);
    });
}

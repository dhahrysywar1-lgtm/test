const { run } = require('./init-db');
const pool = require('../src/db');

run({ seed: true })
  .then(async () => {
    const [[row]] = await pool.query('SELECT COUNT(*) AS total FROM products');
    console.log(`✔ Seed terminé (sans doublons) — ${row.total} produits en base`);
  })
  .catch((err) => {
    console.error('✘ Seed impossible :', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());

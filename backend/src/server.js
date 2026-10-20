const app = require('./app');
const pool = require('./db');
const { port, db } = require('./config');

const server = app.listen(port, () => {
  console.log(`NOVA STORE API  → http://localhost:${port}/api  (base MySQL : ${db.database})`);
});

pool.query('SELECT 1').catch((err) => {
  console.error('⚠ Connexion MySQL impossible :', err.code || err.message);
  console.error('  Vérifiez que MySQL est démarré (sudo service mysql start) et le fichier .env.');
});

function shutdown() {
  server.close(() => pool.end().finally(() => process.exit(0)));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

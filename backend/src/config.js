require('dotenv').config();

const dbName = process.env.DB_NAME || 'nova_store';
if (!/^[A-Za-z0-9_]+$/.test(dbName)) {
  throw new Error('DB_NAME invalide : seuls lettres, chiffres et _ sont autorisés');
}

module.exports = {
  port: parseInt(process.env.PORT || '8000', 10),
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:4200')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'nova',
    password: process.env.DB_PASSWORD || '',
    database: dbName,
  },
};

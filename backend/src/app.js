const express = require('express');
const cors = require('cors');
const pool = require('./db');
const { corsOrigins } = require('./config');
const productsRouter = require('./routes/products');

const app = express();

app.use(cors({ origin: corsOrigins }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'up' });
  } catch (_err) {
    res.status(503).json({ status: 'degraded', database: 'down' });
  }
});

app.use('/api/products', productsRouter);

app.use((_req, res) => res.status(404).json({ error: 'Route introuvable' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON invalide' });
  }
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Un produit avec ce nom existe déjà' });
  }
  console.error(err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

module.exports = app;

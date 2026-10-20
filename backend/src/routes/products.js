const express = require('express');
const pool = require('../db');
const { validateProduct, parseId } = require('../validators');

const router = express.Router();

const COLUMNS = 'id, name, description, price, category, image_url, stock, created_at, updated_at';
// Liste blanche : jamais d'entrée utilisateur directement dans ORDER BY
const SORTS = {
  price_asc: 'price ASC, id ASC',
  price_desc: 'price DESC, id ASC',
  newest: 'created_at DESC, id DESC',
  name: 'name ASC',
};

const invalid = (res, errors) =>
  res.status(422).json({ error: 'Données invalides', details: errors });
const notFound = (res) => res.status(404).json({ error: 'Produit introuvable' });

async function findById(id) {
  const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM products WHERE id = ?`, [id]);
  return rows[0] || null;
}

// READ ALL  (filtres optionnels : ?q=...&category=...&sort=price_asc|price_desc|newest|name)
router.get('/', async (req, res, next) => {
  try {
    const where = [];
    const params = [];
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    if (q) {
      where.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }
    if (category) {
      where.push('category = ?');
      params.push(category);
    }
    const orderBy = SORTS[req.query.sort] || 'id ASC';
    const sql = `SELECT ${COLUMNS} FROM products ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ${orderBy}`;
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// READ ONE
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return invalid(res, [{ field: 'id', message: "L'identifiant doit être un entier positif" }]);
    const product = await findById(id);
    if (!product) return notFound(res);
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// CREATE
router.post('/', async (req, res, next) => {
  try {
    const { errors, value } = validateProduct(req.body);
    if (errors.length) return invalid(res, errors);
    const [result] = await pool.execute(
      'INSERT INTO products (name, description, price, category, image_url, stock) VALUES (?, ?, ?, ?, ?, ?)',
      [value.name, value.description, value.price, value.category, value.image_url, value.stock]
    );
    res.status(201).json(await findById(result.insertId));
  } catch (err) {
    next(err);
  }
});

// UPDATE (remplacement complet)
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return invalid(res, [{ field: 'id', message: "L'identifiant doit être un entier positif" }]);
    const { errors, value } = validateProduct(req.body);
    if (errors.length) return invalid(res, errors);
    if (!(await findById(id))) return notFound(res);
    await pool.execute(
      'UPDATE products SET name = ?, description = ?, price = ?, category = ?, image_url = ?, stock = ? WHERE id = ?',
      [value.name, value.description, value.price, value.category, value.image_url, value.stock, id]
    );
    res.json(await findById(id));
  } catch (err) {
    next(err);
  }
});

// DELETE
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return invalid(res, [{ field: 'id', message: "L'identifiant doit être un entier positif" }]);
    const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) return notFound(res);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;

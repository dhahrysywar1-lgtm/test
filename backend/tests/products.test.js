const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db');
const { run } = require('../scripts/init-db');

const sample = {
  name: 'Test Keyboard',
  description: 'Clavier de test',
  price: 49.9,
  category: 'Accessories',
  image_url: '/assets/products/p06.svg',
  stock: 10,
};

beforeAll(async () => {
  await run(); // crée nova_store_test + table products
  await pool.query('TRUNCATE TABLE products');
});

afterAll(async () => {
  await pool.end();
});

describe('Santé', () => {
  test('GET /api/health → 200 et base up', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', database: 'up' });
  });
});

describe('CRUD /api/products', () => {
  let id;

  test('POST crée un produit (201)', async () => {
    const res = await request(app).post('/api/products').send(sample);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Test Keyboard', price: 49.9, stock: 10 });
    expect(typeof res.body.id).toBe('number');
    id = res.body.id;
  });

  test('POST avec un nom déjà existant → 409', async () => {
    const res = await request(app).post('/api/products').send(sample);
    expect(res.status).toBe(409);
  });

  test('GET liste les produits (200)', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body.some((p) => p.id === id)).toBe(true);
  });

  test('GET ?q= et ?category= filtrent la liste', async () => {
    const hit = await request(app).get('/api/products').query({ q: 'keyboard', category: 'Accessories' });
    expect(hit.body.length).toBe(1);
    const miss = await request(app).get('/api/products').query({ category: 'Gaming' });
    expect(miss.body.length).toBe(0);
  });

  test('GET /:id retourne le produit (200)', async () => {
    const res = await request(app).get(`/api/products/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.name).toBe('Test Keyboard');
  });

  test('PUT /:id modifie le produit (200) et la modification est persistée', async () => {
    const res = await request(app)
      .put(`/api/products/${id}`)
      .send({ ...sample, name: 'Test Keyboard V2', price: 59, stock: 3 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: 'Test Keyboard V2', price: 59, stock: 3 });
    const [[row]] = await pool.query('SELECT name, price, stock FROM products WHERE id = ?', [id]);
    expect(row).toEqual({ name: 'Test Keyboard V2', price: 59, stock: 3 });
  });

  test('DELETE /:id supprime le produit (204) puis GET → 404', async () => {
    const del = await request(app).delete(`/api/products/${id}`);
    expect(del.status).toBe(204);
    const get = await request(app).get(`/api/products/${id}`);
    expect(get.status).toBe(404);
    const [rows] = await pool.query('SELECT id FROM products WHERE id = ?', [id]);
    expect(rows.length).toBe(0);
  });
});

describe('Cas d erreur', () => {
  test('GET produit inexistant → 404', async () => {
    const res = await request(app).get('/api/products/999999');
    expect(res.status).toBe(404);
  });

  test('PUT produit inexistant → 404', async () => {
    const res = await request(app).put('/api/products/999999').send(sample);
    expect(res.status).toBe(404);
  });

  test('DELETE produit inexistant → 404', async () => {
    const res = await request(app).delete('/api/products/999999');
    expect(res.status).toBe(404);
  });

  test('POST avec données invalides → 422 et détails par champ', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: '', price: -5, category: '', stock: 1.5, image_url: 'javascript:alert(1)' });
    expect(res.status).toBe(422);
    const fields = res.body.details.map((d) => d.field).sort();
    expect(fields).toEqual(['category', 'image_url', 'name', 'price', 'stock']);
  });

  test('PUT avec données invalides → 422', async () => {
    const res = await request(app).put('/api/products/1').send({ name: 'x' });
    expect(res.status).toBe(422);
  });

  test('identifiant non numérique → 422', async () => {
    const res = await request(app).get('/api/products/abc');
    expect(res.status).toBe(422);
  });

  test('tentative d injection SQL dans ?q= est inoffensive', async () => {
    const res = await request(app).get('/api/products').query({ q: "'; DROP TABLE products; --" });
    expect(res.status).toBe(200);
    const [[row]] = await pool.query('SELECT COUNT(*) AS n FROM products');
    expect(typeof row.n).toBe('number');
  });

  test('JSON malformé → 400', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Content-Type', 'application/json')
      .send('{"name": ');
    expect(res.status).toBe(400);
  });
});

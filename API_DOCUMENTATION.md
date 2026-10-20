# API REST — NOVA STORE

Base URL : `http://localhost:8000/api` — format JSON (`Content-Type: application/json`).

## Modèle `Product`

| Champ | Type | Règle |
|---|---|---|
| id | integer | généré |
| name | string | obligatoire, ≤ 150, unique |
| description | string \| null | ≤ 5000 |
| price | number | ≥ 0 (2 décimales) |
| category | string | obligatoire, ≤ 80 |
| image_url | string \| null | `http(s)://…` ou chemin `/…` |
| stock | integer | ≥ 0 |
| created_at / updated_at | ISO date | générés par MySQL |

## GET /api/health
```bash
curl http://localhost:8000/api/health
```
`200` → `{"status":"ok","database":"up"}` · `503` → `{"status":"degraded","database":"down"}`

## GET /api/products
Filtres optionnels : `q` (nom/description), `category`, `sort` = `price_asc` | `price_desc` | `newest` | `name`.
```bash
curl "http://localhost:8000/api/products?category=Audio&sort=price_desc"
```
`200` →
```json
[
  {
    "id": 1,
    "name": "Nova Air Pro Headphones",
    "description": "Over-ear wireless headphones…",
    "price": 199,
    "category": "Audio",
    "image_url": "/assets/products/p01.svg",
    "stock": 25,
    "created_at": "2026-10-19T20:43:31.000Z",
    "updated_at": "2026-10-19T20:43:31.000Z"
  }
]
```

## GET /api/products/:id
```bash
curl http://localhost:8000/api/products/1
```
`200` → produit · `404` → `{"error":"Produit introuvable"}` · `422` si l'id n'est pas un entier positif.

## POST /api/products
```bash
curl -X POST http://localhost:8000/api/products -H "Content-Type: application/json" \
  -d '{"name":"Demo Produit TP","description":"cree par curl","price":12.5,"category":"Home","image_url":"","stock":4}'
```
`201` → produit créé (avec `id`) · `409` → `{"error":"Un produit avec ce nom existe déjà"}`

`422` (exemple, corps `{"name":"","price":-1}`) :
```json
{
  "error": "Données invalides",
  "details": [
    { "field": "name", "message": "Le nom est obligatoire" },
    { "field": "price", "message": "Le prix doit être un nombre positif" },
    { "field": "category", "message": "La catégorie est obligatoire" },
    { "field": "stock", "message": "Le stock doit être un entier positif ou nul" }
  ]
}
```

## PUT /api/products/:id
Remplacement complet (mêmes champs que POST).
```bash
curl -X PUT http://localhost:8000/api/products/15 -H "Content-Type: application/json" \
  -d '{"name":"Demo Produit TP","description":"modifie","price":15,"category":"Home","image_url":null,"stock":9}'
```
`200` → produit mis à jour · `404` · `409` · `422`

## DELETE /api/products/:id
```bash
curl -X DELETE http://localhost:8000/api/products/15
```
`204` (sans corps) · `404` si inexistant.

## Autres réponses
`400` JSON malformé · `404` route inconnue · `500` erreur interne (message générique, détails dans les logs serveur).

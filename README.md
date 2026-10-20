# NOVA STORE — Premium E-commerce (Angular + Express + MySQL)

TP1 — Application CRUD Full Stack exécutée entièrement sous **WSL2 Ubuntu**, **sans Docker**.

```
Angular (4200)  →  API REST JSON (Express, 8000)  →  MySQL (3306)
```

## 1. Présentation

Boutique e-commerce moderne : accueil, boutique (recherche, filtre par catégorie, tri par prix, pagination), fiche produit, panier et **dashboard d'administration** (CRUD complet des produits). Tous les produits viennent de MySQL via l'API : rien n'est codé en dur dans Angular.

## 2. Objectifs du TP

- Ajouter / lister / consulter / modifier / supprimer un produit (CRUD).
- Frontend ↔ backend via **API REST**, backend ↔ **MySQL**, données réellement persistées.
- Projet organisé en `frontend/` et `backend/`, exécuté dans WSL2 Ubuntu.

## 3. Technologies et choix du backend

| Couche | Technologie |
|---|---|
| Frontend | Angular 19, TypeScript, Angular Router, Reactive Forms, HttpClient |
| Backend | **Node.js + Express** + `mysql2` |
| Base de données | MySQL 8 |
| Tests | Jest + Supertest (contre un vrai MySQL) |

**Pourquoi Express ?** Même langage (TypeScript/JavaScript) que le frontend, installation simple (`npm install`), très bien documenté, et `mysql2` permet des **requêtes paramétrées** (protection contre l'injection SQL) sans configuration lourde.

## 4. Architecture

```
nova-store/
├── frontend/            Angular (pages, components, services, models)
├── backend/
│   ├── src/             app.js, server.js, db.js, config.js, validators.js, routes/products.js
│   ├── scripts/         init-db.js (crée base + table), seed.js (données de démo)
│   ├── tests/           products.test.js (Jest + Supertest)
│   └── .env.example
├── database/            schema.sql, seed.sql, init.sql, create-user.sql
├── API_DOCUMENTATION.md
└── README.md
```

## 5. Prérequis (WSL2 Ubuntu)

Ouvrez le terminal **Ubuntu** (pas PowerShell).

```bash
sudo apt update
sudo apt install -y mysql-server curl unzip
```

Node.js 20+ (si `node -v` donne moins de 20 ou rien) :
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 20
```

## 6. MySQL : démarrage et création de l'utilisateur

```bash
sudo service mysql start
sudo mysql < database/create-user.sql      # crée l'utilisateur "nova" (pas root)
```
> Le mot de passe par défaut `nova_password_change_me` est un exemple : changez-le dans `database/create-user.sql` **et** dans `backend/.env`. Ne le réutilisez jamais ailleurs.

## 7. Backend

```bash
cd backend
cp .env.example .env          # puis adaptez DB_PASSWORD si vous l'avez changé
npm install
npm run db:init               # crée la base nova_store + la table products
npm run db:seed               # insère 14 produits (relançable, sans doublons)
npm start                     # API sur http://localhost:8000
```
Mode développement (rechargement auto) : `npm run dev`.
Alternative SQL pur : `mysql -u nova -p < ../database/init.sql`.

## 8. Frontend (nouveau terminal)

```bash
cd frontend
npm install
npm start                     # http://localhost:4200
```
Ouvrez **http://localhost:4200** dans le navigateur Windows (WSL2 redirige `localhost`).
L'URL de l'API est dans `frontend/src/app/core/config.ts` (`http://localhost:8000/api`).

## 9. Arrêter les services

- Backend / frontend : `Ctrl + C` dans leur terminal.
- MySQL : `sudo service mysql stop`.
- Au prochain démarrage : `sudo service mysql start`, puis `npm start` dans `backend/` et dans `frontend/`.

## 10. Endpoints REST

| Méthode | URL | Action | Codes |
|---|---|---|---|
| GET | `/api/health` | État de l'API et de la base | 200 / 503 |
| GET | `/api/products` | Liste (`?q=`, `?category=`, `?sort=`) | 200 |
| GET | `/api/products/:id` | Détail | 200 / 404 / 422 |
| POST | `/api/products` | Création | 201 / 409 / 422 |
| PUT | `/api/products/:id` | Modification | 200 / 404 / 422 |
| DELETE | `/api/products/:id` | Suppression | 204 / 404 |

Détails et exemples JSON : voir `API_DOCUMENTATION.md`.

## 11. Tests

Les tests utilisent une base séparée `nova_store_test` (vos données ne sont jamais touchées). MySQL doit être démarré.
```bash
cd backend
npm test
```
Couverture : santé de l'API, création, liste, filtres, consultation, modification (+ vérification directe en base), suppression, produit inexistant (404), données invalides (422), identifiant invalide, doublon (409), JSON malformé (400), tentative d'injection SQL.

Vérifier que le frontend compile : `cd frontend && npx ng build`.

## 12. Démonstration CRUD (checklist depuis Angular)

Ouvrez **Admin** (`/admin`) :

1. **Create** : « + Add product » → remplir (ex. *Test TP*, 20, Home, stock 5) → *Create product* → toast de succès, ligne visible.
2. **Read all** : le tableau liste tous les produits ; les statistiques se mettent à jour.
3. **Read one** : bouton **View** → fenêtre de détails (avec dates de création/modification).
4. **Update** : bouton **Edit** → changer le prix → *Save changes* → toast, valeur mise à jour.
5. **Delete** : bouton **Delete** → confirmation → le produit disparaît.
6. Côté boutique : `/shop` (recherche, catégorie, tri), fiche produit, ajout au panier, `/cart`.
7. **Preuve en base** après chaque étape :
```bash
mysql -u nova -p -e "SELECT id,name,price,stock,updated_at FROM nova_store.products ORDER BY id DESC LIMIT 5;"
```
Les modifications faites dans Angular doivent apparaître dans MySQL.
Faites des captures d'écran de chaque étape pour le compte rendu.

## 13. Sécurité (à mentionner dans le compte rendu)

- Requêtes **paramétrées** partout ; `ORDER BY` limité à une liste blanche.
- Validation des entrées côté backend (422) et côté Angular (Reactive Forms).
- Aucun secret dans le code : configuration via `.env` (ignoré par git).
- **L'administration n'a pas d'authentification** : c'est une démonstration pédagogique, à ne pas exposer publiquement.
- Pas de paiement : le bouton *Checkout* est une démo.

## 14. Dépannage

| Problème | Solution |
|---|---|
| `ECONNREFUSED 127.0.0.1:3306` | `sudo service mysql start` |
| `Access denied for user 'nova'` | Relancez `sudo mysql < database/create-user.sql` et vérifiez `DB_PASSWORD` dans `.env` |
| `ER_ACCESS_DENIED` / `Unknown database` | `npm run db:init` dans `backend/` |
| Angular : « Impossible de joindre le serveur » | Backend non démarré, ou mauvais port dans `core/config.ts` |
| Erreur CORS dans la console | `CORS_ORIGINS` dans `backend/.env` doit contenir `http://localhost:4200` |
| `Port 8000 already in use` | Changez `PORT` dans `.env` **et** `API_URL` dans `core/config.ts` |
| `node: command not found` / version < 20 | Installez Node avec nvm (section 5) |
| Images produits absentes | Elles sont dans `frontend/public/assets/products/` ; un placeholder s'affiche sinon |

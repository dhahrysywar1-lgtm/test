# NOVA STORE — Frontend (Angular 19)

```bash
npm install
npm start        # http://localhost:4200  (le backend doit tourner sur :8000)
npm run build    # build de production dans dist/
```

- `src/app/pages/` : home, shop, product-details, cart, admin
- `src/app/components/` : navbar, footer, product-card, confirm-modal, toast-container
- `src/app/services/` : ProductService (HttpClient → API REST), CartService (localStorage), ToastService
- `src/app/core/config.ts` : URL de l'API

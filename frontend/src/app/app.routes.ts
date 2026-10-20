import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', title: 'NOVA STORE — Premium E-commerce', loadComponent: () => import('./pages/home.component').then((m) => m.HomeComponent) },
  { path: 'shop', title: 'Shop — NOVA STORE', loadComponent: () => import('./pages/shop.component').then((m) => m.ShopComponent) },
  { path: 'product/:id', title: 'Product — NOVA STORE', loadComponent: () => import('./pages/product-details.component').then((m) => m.ProductDetailsComponent) },
  { path: 'cart', title: 'Cart — NOVA STORE', loadComponent: () => import('./pages/cart.component').then((m) => m.CartComponent) },
  { path: 'admin', title: 'Admin — NOVA STORE', loadComponent: () => import('./pages/admin.component').then((m) => m.AdminComponent) },
  { path: '**', redirectTo: '' },
];

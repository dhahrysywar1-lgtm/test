import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from '../components/product-card.component';
import { apiErrorMessage } from '../core/api-error';
import { categoryIcon } from '../core/config';
import { Product } from '../models/product';
import { CartService } from '../services/cart.service';
import { ProductService } from '../services/product.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductCardComponent],
  template: `
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-text">
          <span class="eyebrow">New season · 2026</span>
          <h1>Premium tech,<br /><span class="grad">designed to be loved.</span></h1>
          <p>Discover headphones, wearables, accessories and smart-home essentials selected for quality and style.</p>
          <div class="hero-cta">
            <a routerLink="/shop" class="btn btn-primary btn-lg">Shop Now</a>
            <a routerLink="/admin" class="btn btn-ghost btn-lg">Admin dashboard</a>
          </div>
        </div>
        <div class="hero-art" aria-hidden="true">
          <div class="orb o1">🎧</div>
          <div class="orb o2">⌚</div>
          <div class="orb o3">🎮</div>
        </div>
      </div>
    </section>

    <section class="container section">
      <div class="section-head">
        <h2>Popular products</h2>
        <a routerLink="/shop" class="link">View all →</a>
      </div>
      @if (loading()) {
        <div class="grid">@for (i of [1, 2, 3, 4]; track i) { <div class="skeleton card-skeleton"></div> }</div>
      } @else if (error()) {
        <div class="alert error">{{ error() }} <button class="btn btn-outline btn-sm" (click)="load()">Retry</button></div>
      } @else {
        <div class="grid">
          @for (p of popular(); track p.id) {
            <app-product-card [product]="p" (add)="addToCart($event)" />
          }
        </div>
      }
    </section>

    <section class="container section">
      <div class="section-head"><h2>Shop by category</h2></div>
      <div class="cat-grid">
        @for (c of categories(); track c.name) {
          <a class="cat-card" routerLink="/shop" [queryParams]="{ category: c.name }">
            <span class="cat-icon">{{ c.icon }}</span>
            <strong>{{ c.name }}</strong>
            <span class="muted">{{ c.count }} products</span>
          </a>
        }
      </div>
    </section>

    <section class="container section">
      <div class="perks">
        <div class="perk"><span>🚚</span><h4>Free delivery</h4><p class="muted">On every order over $100.</p></div>
        <div class="perk"><span>🛡️</span><h4>2-year warranty</h4><p class="muted">Peace of mind on all products.</p></div>
        <div class="perk"><span>↩️</span><h4>30-day returns</h4><p class="muted">Changed your mind? No problem.</p></div>
        <div class="perk"><span>💬</span><h4>Friendly support</h4><p class="muted">We answer within 24 hours.</p></div>
      </div>
    </section>
  `,
})
export class HomeComponent {
  private api = inject(ProductService);
  private cart = inject(CartService);
  private toast = inject(ToastService);

  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal('');

  popular = computed(() => this.products().slice(0, 4));
  categories = computed(() => {
    const counts = new Map<string, number>();
    for (const p of this.products()) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    return [...counts].map(([name, count]) => ({ name, count, icon: categoryIcon(name) }));
  });

  constructor() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.api.getAll().subscribe({
      next: (p) => { this.products.set(p); this.loading.set(false); },
      error: (e) => { this.error.set(apiErrorMessage(e)); this.loading.set(false); },
    });
  }

  addToCart(p: Product) {
    if (this.cart.add(p)) this.toast.success(`${p.name} added to cart`);
    else this.toast.info('Maximum available stock already in your cart');
  }
}

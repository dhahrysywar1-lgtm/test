import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { apiErrorMessage } from '../core/api-error';
import { LOW_STOCK_THRESHOLD, PLACEHOLDER_IMG } from '../core/config';
import { Product } from '../models/product';
import { ImgFallbackDirective } from '../shared/img-fallback.directive';
import { CartService } from '../services/cart.service';
import { ProductService } from '../services/product.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-product-details',
  imports: [RouterLink, CurrencyPipe, ImgFallbackDirective],
  template: `
    <section class="container section">
      <a routerLink="/shop" class="link">← Back to shop</a>

      @if (loading()) {
        <div class="details"><div class="skeleton" style="aspect-ratio:1"></div><div class="skeleton" style="height:320px"></div></div>
      }
      @if (error()) {
        <div class="empty"><span>😕</span><h3>{{ error() }}</h3><a routerLink="/shop" class="btn btn-primary">Back to shop</a></div>
      }
      @if (product(); as p) {
        <div class="details">
          <div class="details-img"><img appImgFallback [src]="p.image_url || placeholder" [alt]="p.name" /></div>
          <div class="details-info">
            <span class="badge">{{ p.category }}</span>
            <h1>{{ p.name }}</h1>
            <p class="price">{{ p.price | currency }}</p>
            <p class="desc">{{ p.description || 'No description available.' }}</p>

            <p class="stock" [class.low]="p.stock <= low && p.stock > 0" [class.out]="p.stock === 0">
              @if (p.stock === 0) { Out of stock }
              @else if (p.stock <= low) { Only {{ p.stock }} left in stock }
              @else { In stock ({{ p.stock }} available) }
            </p>

            @if (p.stock > 0) {
              <div class="buy-row">
                <div class="qty">
                  <button type="button" aria-label="Decrease" (click)="change(-1, p)">−</button>
                  <span>{{ qty() }}</span>
                  <button type="button" aria-label="Increase" (click)="change(1, p)">+</button>
                </div>
                <button type="button" class="btn btn-primary btn-lg" (click)="add(p)">Add to Cart</button>
              </div>
            }
          </div>
        </div>
      }
    </section>
  `,
})
export class ProductDetailsComponent {
  private api = inject(ProductService);
  private cart = inject(CartService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  product = signal<Product | null>(null);
  loading = signal(true);
  error = signal('');
  qty = signal(1);
  placeholder = PLACEHOLDER_IMG;
  low = LOW_STOCK_THRESHOLD;

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getOne(id).subscribe({
      next: (p) => { this.product.set(p); this.loading.set(false); },
      error: (e) => { this.error.set(e?.status === 404 ? 'Product not found' : apiErrorMessage(e)); this.loading.set(false); },
    });
  }

  change(delta: number, p: Product) {
    this.qty.update((q) => Math.min(Math.max(1, q + delta), p.stock));
  }

  add(p: Product) {
    if (this.cart.add(p, this.qty())) this.toast.success(`${this.qty()} × ${p.name} added to cart`);
    else this.toast.info('Maximum available stock already in your cart');
  }
}

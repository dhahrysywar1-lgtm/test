import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { apiErrorMessage } from '../core/api-error';
import { PLACEHOLDER_IMG } from '../core/config';
import { Product } from '../models/product';
import { ImgFallbackDirective } from '../shared/img-fallback.directive';
import { CartService } from '../services/cart.service';
import { ProductService } from '../services/product.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, CurrencyPipe, ImgFallbackDirective],
  template: `
    <section class="container section">
      <div class="page-head"><h1>Shopping Cart</h1></div>

      @if (loading()) {
        <div class="skeleton" style="height:220px"></div>
      } @else if (error()) {
        <div class="alert error">{{ error() }}</div>
      } @else if (lines().length === 0) {
        <div class="empty">
          <span>🛒</span><h3>Your cart is empty</h3>
          <p class="muted">Add a few products to get started.</p>
          <a routerLink="/shop" class="btn btn-primary">Continue shopping</a>
        </div>
      } @else {
        <div class="cart-layout">
          <div class="cart-lines">
            @for (l of lines(); track l.product.id) {
              <div class="cart-line">
                <img appImgFallback [src]="l.product.image_url || placeholder" [alt]="l.product.name" />
                <div class="cl-info">
                  <a [routerLink]="['/product', l.product.id]"><strong>{{ l.product.name }}</strong></a>
                  <span class="muted">{{ l.product.category }} · {{ l.product.price | currency }}</span>
                </div>
                <div class="qty">
                  <button type="button" aria-label="Decrease" (click)="setQty(l.product, l.quantity - 1)">−</button>
                  <span>{{ l.quantity }}</span>
                  <button type="button" aria-label="Increase" [disabled]="l.quantity >= l.product.stock" (click)="setQty(l.product, l.quantity + 1)">+</button>
                </div>
                <strong class="cl-total">{{ l.product.price * l.quantity | currency }}</strong>
                <button type="button" class="icon-btn" aria-label="Remove" (click)="remove(l.product)">🗑️</button>
              </div>
            }
          </div>

          <aside class="cart-summary card">
            <h3>Order summary</h3>
            <div class="sum-row"><span>Items</span><span>{{ itemCount() }}</span></div>
            <div class="sum-row"><span>Shipping</span><span>{{ total() >= 100 ? 'Free' : (7.9 | currency) }}</span></div>
            <div class="sum-row total"><span>Total</span><span>{{ total() + (total() >= 100 ? 0 : 7.9) | currency }}</span></div>
            <button type="button" class="btn btn-primary btn-block" (click)="checkout()">Checkout</button>
            <button type="button" class="btn btn-outline btn-block" (click)="clear()">Clear cart</button>
            <p class="muted small">Demo project: no real payment, no banking data collected.</p>
          </aside>
        </div>
      }
    </section>
  `,
})
export class CartComponent {
  private api = inject(ProductService);
  private cart = inject(CartService);
  private toast = inject(ToastService);

  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal('');
  placeholder = PLACEHOLDER_IMG;

  lines = computed(() => {
    const map = new Map(this.products().map((p) => [p.id, p]));
    const out: { product: Product; quantity: number }[] = [];
    for (const i of this.cart.items()) {
      const product = map.get(i.productId);
      if (product && product.stock > 0) out.push({ product, quantity: Math.min(i.quantity, product.stock) });
    }
    return out;
  });
  itemCount = computed(() => this.lines().reduce((s, l) => s + l.quantity, 0));
  total = computed(() => this.lines().reduce((s, l) => s + l.product.price * l.quantity, 0));

  constructor() {
    this.api.getAll().subscribe({
      next: (p) => {
        this.products.set(p);
        this.syncCart(p);
        this.loading.set(false);
      },
      error: (e) => { this.error.set(apiErrorMessage(e)); this.loading.set(false); },
    });
  }

  /** Retire du panier les produits supprimés ou épuisés, et ajuste les quantités au stock. */
  private syncCart(products: Product[]) {
    const map = new Map(products.map((p) => [p.id, p]));
    for (const i of this.cart.items()) {
      const p = map.get(i.productId);
      if (!p || p.stock === 0) this.cart.remove(i.productId);
      else if (i.quantity > p.stock) this.cart.setQuantity(i.productId, p.stock);
    }
  }

  setQty(p: Product, q: number) { this.cart.setQuantity(p.id, Math.min(q, p.stock)); }
  remove(p: Product) { this.cart.remove(p.id); this.toast.info(`${p.name} removed`); }
  clear() { this.cart.clear(); }
  checkout() { this.toast.info('Demo only: checkout is not implemented (no real payment).'); }
}

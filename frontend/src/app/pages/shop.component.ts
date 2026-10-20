import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductCardComponent } from '../components/product-card.component';
import { apiErrorMessage } from '../core/api-error';
import { Product } from '../models/product';
import { CartService } from '../services/cart.service';
import { ProductService } from '../services/product.service';
import { ToastService } from '../services/toast.service';

const PAGE_SIZE = 8;

@Component({
  selector: 'app-shop',
  imports: [ProductCardComponent],
  template: `
    <section class="container section">
      <div class="page-head">
        <h1>Shop</h1>
        <p class="muted">{{ filtered().length }} product(s) found</p>
      </div>

      <div class="toolbar">
        <input type="search" class="input" placeholder="Search a product…" [value]="search()" (input)="onSearch($any($event.target).value)" />
        <select class="input" [value]="category()" (change)="onCategory($any($event.target).value)">
          <option value="">All categories</option>
          @for (c of categories(); track c) { <option [value]="c">{{ c }}</option> }
        </select>
        <select class="input" [value]="sort()" (change)="sort.set($any($event.target).value); page.set(1)">
          <option value="default">Sort: Featured</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      @if (loading()) {
        <div class="grid">@for (i of [1, 2, 3, 4, 5, 6, 7, 8]; track i) { <div class="skeleton card-skeleton"></div> }</div>
      } @else if (error()) {
        <div class="alert error">{{ error() }} <button class="btn btn-outline btn-sm" (click)="load()">Retry</button></div>
      } @else if (filtered().length === 0) {
        <div class="empty"><span>🔍</span><h3>No product found</h3><p class="muted">Try another search or category.</p></div>
      } @else {
        <div class="grid">
          @for (p of paged(); track p.id) {
            <app-product-card [product]="p" (add)="addToCart($event)" />
          }
        </div>
        @if (totalPages() > 1) {
          <nav class="pagination" aria-label="Pagination">
            <button class="btn btn-outline btn-sm" [disabled]="page() === 1" (click)="page.set(page() - 1)">‹ Prev</button>
            @for (n of pages(); track n) {
              <button class="btn btn-sm" [class.btn-primary]="n === page()" [class.btn-outline]="n !== page()" (click)="page.set(n)">{{ n }}</button>
            }
            <button class="btn btn-outline btn-sm" [disabled]="page() === totalPages()" (click)="page.set(page() + 1)">Next ›</button>
          </nav>
        }
      }
    </section>
  `,
})
export class ShopComponent {
  private api = inject(ProductService);
  private cart = inject(CartService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal('');
  search = signal('');
  category = signal('');
  sort = signal('default');
  page = signal(1);

  categories = computed(() => [...new Set(this.products().map((p) => p.category))].sort());

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const cat = this.category();
    let list = this.products().filter(
      (p) => (!cat || p.category === cat) && (!q || p.name.toLowerCase().includes(q))
    );
    if (this.sort() === 'price_asc') list = [...list].sort((a, b) => a.price - b.price);
    if (this.sort() === 'price_desc') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE)));
  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
  paged = computed(() => {
    const start = (Math.min(this.page(), this.totalPages()) - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  constructor() {
    this.category.set(this.route.snapshot.queryParamMap.get('category') ?? '');
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

  onSearch(v: string) { this.search.set(v); this.page.set(1); }
  onCategory(v: string) { this.category.set(v); this.page.set(1); }

  addToCart(p: Product) {
    if (this.cart.add(p)) this.toast.success(`${p.name} added to cart`);
    else this.toast.info('Maximum available stock already in your cart');
  }
}

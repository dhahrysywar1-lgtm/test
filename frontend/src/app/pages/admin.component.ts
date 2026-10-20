import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmModalComponent } from '../components/confirm-modal.component';
import { apiErrorMessage } from '../core/api-error';
import { LOW_STOCK_THRESHOLD, PLACEHOLDER_IMG } from '../core/config';
import { Product, ProductInput } from '../models/product';
import { ImgFallbackDirective } from '../shared/img-fallback.directive';
import { ProductService } from '../services/product.service';
import { ToastService } from '../services/toast.service';

type Mode = 'view' | 'create' | 'edit' | null;

@Component({
  selector: 'app-admin',
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe, ConfirmModalComponent, ImgFallbackDirective],
  template: `
    <section class="container section admin">
      <div class="page-head row-between">
        <div>
          <h1>Admin Dashboard</h1>
          <p class="muted">Educational demo — no authentication. Do not expose this page publicly.</p>
        </div>
        <button type="button" class="btn btn-primary" (click)="openCreate()">+ Add product</button>
      </div>

      <div class="stats">
        <div class="stat"><span class="stat-ico">📦</span><div><p class="muted">Total products</p><strong>{{ products().length }}</strong></div></div>
        <div class="stat"><span class="stat-ico">🗂️</span><div><p class="muted">Categories</p><strong>{{ categories().length }}</strong></div></div>
        <div class="stat"><span class="stat-ico">💰</span><div><p class="muted">Stock value</p><strong>{{ stockValue() | currency }}</strong></div></div>
        <div class="stat warn"><span class="stat-ico">⚠️</span><div><p class="muted">Low stock (≤ {{ low }})</p><strong>{{ lowStock().length }}</strong></div></div>
      </div>

      @if (lowStock().length > 0) {
        <div class="alert warn">
          <strong>Low stock:</strong>
          @for (p of lowStock(); track p.id; let last = $last) { {{ p.name }} ({{ p.stock }}){{ last ? '' : ', ' }} }
        </div>
      }

      <div class="toolbar">
        <input type="search" class="input" placeholder="Search by name…" [value]="search()" (input)="search.set($any($event.target).value)" />
        <select class="input" [value]="category()" (change)="category.set($any($event.target).value)">
          <option value="">All categories</option>
          @for (c of categories(); track c) { <option [value]="c">{{ c }}</option> }
        </select>
        <label class="check"><input type="checkbox" [checked]="onlyLow()" (change)="onlyLow.set($any($event.target).checked)" /> Low stock only</label>
      </div>

      @if (loading()) {
        <div class="skeleton" style="height:260px"></div>
      } @else if (error()) {
        <div class="alert error">{{ error() }} <button class="btn btn-outline btn-sm" (click)="load()">Retry</button></div>
      } @else {
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th class="right">Actions</th></tr></thead>
            <tbody>
              @for (p of filtered(); track p.id) {
                <tr>
                  <td>
                    <div class="cell-product">
                      <img appImgFallback [src]="p.image_url || placeholder" [alt]="p.name" />
                      <div><strong>{{ p.name }}</strong><span class="muted small">#{{ p.id }}</span></div>
                    </div>
                  </td>
                  <td><span class="badge">{{ p.category }}</span></td>
                  <td>{{ p.price | currency }}</td>
                  <td><span class="pill" [class.low]="p.stock > 0 && p.stock <= low" [class.out]="p.stock === 0">{{ p.stock }}</span></td>
                  <td class="right actions">
                    <button type="button" class="btn btn-outline btn-sm" (click)="openView(p)">View</button>
                    <button type="button" class="btn btn-outline btn-sm" (click)="openEdit(p)">Edit</button>
                    <button type="button" class="btn btn-danger btn-sm" (click)="askDelete(p)">Delete</button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="empty-cell">No product matches your filters.</td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>

    @if (mode() === 'view' && selected(); as p) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
          <div class="modal-head"><h3>Product #{{ p.id }}</h3><button type="button" class="icon-btn" aria-label="Close" (click)="closeModal()">✕</button></div>
          <div class="view-grid">
            <img appImgFallback [src]="p.image_url || placeholder" [alt]="p.name" />
            <dl>
              <dt>Name</dt><dd>{{ p.name }}</dd>
              <dt>Category</dt><dd>{{ p.category }}</dd>
              <dt>Price</dt><dd>{{ p.price | currency }}</dd>
              <dt>Stock</dt><dd>{{ p.stock }}</dd>
              <dt>Description</dt><dd>{{ p.description || '—' }}</dd>
              <dt>Created</dt><dd>{{ p.created_at | date: 'medium' }}</dd>
              <dt>Updated</dt><dd>{{ p.updated_at | date: 'medium' }}</dd>
            </dl>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" (click)="closeModal()">Close</button>
            <button type="button" class="btn btn-primary" (click)="openEdit(p)">Edit</button>
          </div>
        </div>
      </div>
    }

    @if (mode() === 'create' || mode() === 'edit') {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
          <div class="modal-head">
            <h3>{{ mode() === 'edit' ? 'Edit product #' + selected()?.id : 'Add a product' }}</h3>
            <button type="button" class="icon-btn" aria-label="Close" (click)="closeModal()">✕</button>
          </div>
          <form [formGroup]="form" (ngSubmit)="save()" novalidate>
            <label class="field">Name *
              <input class="input" formControlName="name" maxlength="150" />
              @if (invalid('name')) { <small class="err">Name is required (150 characters max).</small> }
            </label>
            <label class="field">Description
              <textarea class="input" rows="3" formControlName="description" maxlength="5000"></textarea>
            </label>
            <div class="two-cols">
              <label class="field">Price ($) *
                <input class="input" type="number" step="0.01" min="0" formControlName="price" />
                @if (invalid('price')) { <small class="err">Enter a positive price.</small> }
              </label>
              <label class="field">Stock *
                <input class="input" type="number" step="1" min="0" formControlName="stock" />
                @if (invalid('stock')) { <small class="err">Enter a whole number ≥ 0.</small> }
              </label>
            </div>
            <label class="field">Category *
              <input class="input" formControlName="category" list="cats" maxlength="80" />
              <datalist id="cats">@for (c of categories(); track c) { <option [value]="c"></option> }</datalist>
              @if (invalid('category')) { <small class="err">Category is required.</small> }
            </label>
            <label class="field">Image URL
              <input class="input" formControlName="image_url" placeholder="https://… or /assets/products/p01.svg" />
              @if (invalid('image_url')) { <small class="err">Use an http(s) URL or a path starting with /.</small> }
            </label>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving()">{{ saving() ? 'Saving…' : mode() === 'edit' ? 'Save changes' : 'Create product' }}</button>
            </div>
          </form>
        </div>
      </div>
    }

    @if (toDelete(); as d) {
      <app-confirm-modal
        title="Delete this product?"
        [message]="'“' + d.name + '” will be permanently removed from the database.'"
        [busy]="deleting()"
        (confirmed)="confirmDelete()"
        (cancelled)="toDelete.set(null)" />
    }
  `,
})
export class AdminComponent {
  private api = inject(ProductService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  low = LOW_STOCK_THRESHOLD;
  placeholder = PLACEHOLDER_IMG;

  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal('');
  search = signal('');
  category = signal('');
  onlyLow = signal(false);

  mode = signal<Mode>(null);
  selected = signal<Product | null>(null);
  saving = signal(false);
  toDelete = signal<Product | null>(null);
  deleting = signal(false);

  categories = computed(() => [...new Set(this.products().map((p) => p.category))].sort());
  stockValue = computed(() => this.products().reduce((s, p) => s + p.price * p.stock, 0));
  lowStock = computed(() => this.products().filter((p) => p.stock <= this.low));
  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.products().filter(
      (p) =>
        (!q || p.name.toLowerCase().includes(q)) &&
        (!this.category() || p.category === this.category()) &&
        (!this.onlyLow() || p.stock <= this.low)
    );
  });

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    category: ['', [Validators.required, Validators.maxLength(80)]],
    image_url: ['', [Validators.pattern(/^$|^(https?:\/\/|\/)\S*$/i)]],
    stock: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
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

  invalid(name: keyof typeof this.form.controls) {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  openView(p: Product) { this.selected.set(p); this.mode.set('view'); }

  openCreate() {
    this.selected.set(null);
    this.form.reset({ name: '', description: '', price: 0, category: '', image_url: '', stock: 0 });
    this.mode.set('create');
  }

  openEdit(p: Product) {
    this.selected.set(p);
    this.form.reset({
      name: p.name,
      description: p.description ?? '',
      price: p.price,
      category: p.category,
      image_url: p.image_url ?? '',
      stock: p.stock,
    });
    this.mode.set('edit');
  }

  closeModal() { this.mode.set(null); this.selected.set(null); }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Please fix the highlighted fields');
      return;
    }
    const v = this.form.getRawValue();
    const payload: ProductInput = {
      name: v.name.trim(),
      description: v.description.trim() || null,
      price: Number(v.price),
      category: v.category.trim(),
      image_url: v.image_url.trim() || null,
      stock: Number(v.stock),
    };
    const editing = this.mode() === 'edit' ? this.selected() : null;
    this.saving.set(true);
    const req = editing ? this.api.update(editing.id, payload) : this.api.create(payload);
    req.subscribe({
      next: (p) => {
        this.saving.set(false);
        this.toast.success(editing ? `“${p.name}” updated` : `“${p.name}” created`);
        this.closeModal();
        this.load();
      },
      error: (e) => { this.saving.set(false); this.toast.error(apiErrorMessage(e)); },
    });
  }

  askDelete(p: Product) { this.toDelete.set(p); }

  confirmDelete() {
    const p = this.toDelete();
    if (!p) return;
    this.deleting.set(true);
    this.api.delete(p.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.toDelete.set(null);
        this.toast.success(`“${p.name}” deleted`);
        this.load();
      },
      error: (e) => { this.deleting.set(false); this.toDelete.set(null); this.toast.error(apiErrorMessage(e)); },
    });
  }
}

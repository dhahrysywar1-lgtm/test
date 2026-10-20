import { Injectable, computed, effect, signal } from '@angular/core';
import { Product } from '../models/product';

export interface CartItem {
  productId: number;
  quantity: number;
}

const KEY = 'nova_cart';

/** Le panier ne stocke que id + quantité (localStorage). Les infos produit viennent de l'API. */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>(this.load());
  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((s, i) => s + i.quantity, 0));

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(this._items()));
      } catch {
        /* stockage indisponible : on ignore */
      }
    });
  }

  private load(): CartItem[] {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (i): i is CartItem => Number.isInteger(i?.productId) && Number.isInteger(i?.quantity) && i.quantity > 0
      );
    } catch {
      return [];
    }
  }

  quantityOf(productId: number): number {
    return this._items().find((i) => i.productId === productId)?.quantity ?? 0;
  }

  /** Ajoute au panier sans dépasser le stock. Retourne false si rien n'a pu être ajouté. */
  add(p: Product, qty = 1): boolean {
    const current = this.quantityOf(p.id);
    const next = Math.min(current + qty, p.stock);
    if (next <= current) return false;
    this.setQuantity(p.id, next);
    return true;
  }

  setQuantity(productId: number, quantity: number) {
    if (quantity <= 0) return this.remove(productId);
    this._items.update((items) =>
      items.some((i) => i.productId === productId)
        ? items.map((i) => (i.productId === productId ? { ...i, quantity } : i))
        : [...items, { productId, quantity }]
    );
  }

  remove(productId: number) {
    this._items.update((items) => items.filter((i) => i.productId !== productId));
  }

  clear() {
    this._items.set([]);
  }
}

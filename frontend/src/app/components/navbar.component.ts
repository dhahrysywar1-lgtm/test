import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="nav">
      <div class="container nav-inner">
        <a routerLink="/" class="logo" (click)="open.set(false)">
          <span class="logo-mark">N</span>NOVA<span class="logo-light">STORE</span>
        </a>
        <button class="nav-toggle" type="button" aria-label="Menu" (click)="toggle()">
          {{ open() ? '✕' : '☰' }}
        </button>
        <nav class="nav-links" [class.open]="open()">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="open.set(false)">Home</a>
          <a routerLink="/shop" routerLinkActive="active" (click)="open.set(false)">Shop</a>
          <a routerLink="/admin" routerLinkActive="active" (click)="open.set(false)">Admin</a>
          <a routerLink="/cart" routerLinkActive="active" class="cart-link" (click)="open.set(false)">
            🛒 Cart
            @if (cart.count() > 0) {
              <span class="cart-badge">{{ cart.count() }}</span>
            }
          </a>
        </nav>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  cart = inject(CartService);
  open = signal(false);
  toggle() { this.open.set(!this.open()); }
}

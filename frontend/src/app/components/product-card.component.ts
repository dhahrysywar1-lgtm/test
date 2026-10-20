import { CurrencyPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LOW_STOCK_THRESHOLD, PLACEHOLDER_IMG } from '../core/config';
import { Product } from '../models/product';
import { ImgFallbackDirective } from '../shared/img-fallback.directive';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CurrencyPipe, ImgFallbackDirective],
  template: `
    <article class="product-card">
      <a [routerLink]="['/product', product().id]" class="pc-image">
        <img appImgFallback [src]="product().image_url || placeholder" [alt]="product().name" loading="lazy" />
        <span class="pc-cat">{{ product().category }}</span>
        @if (product().stock === 0) {
          <span class="pc-badge out">Out of stock</span>
        } @else if (product().stock <= low) {
          <span class="pc-badge low">Only {{ product().stock }} left</span>
        }
      </a>
      <div class="pc-body">
        <h3>{{ product().name }}</h3>
        <div class="pc-meta">
          <strong>{{ product().price | currency }}</strong>
          <span class="muted">{{ product().stock }} in stock</span>
        </div>
        <div class="pc-actions">
          <a class="btn btn-outline btn-sm" [routerLink]="['/product', product().id]">View Details</a>
          <button type="button" class="btn btn-primary btn-sm" [disabled]="product().stock === 0" (click)="add.emit(product())">
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  `,
})
export class ProductCardComponent {
  product = input.required<Product>();
  add = output<Product>();
  placeholder = PLACEHOLDER_IMG;
  low = LOW_STOCK_THRESHOLD;
}

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container footer-grid">
        <div>
          <div class="logo logo-footer"><span class="logo-mark">N</span>NOVA<span class="logo-light">STORE</span></div>
          <p class="muted">Premium tech and lifestyle essentials. A university project built with Angular, Express and MySQL.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <a routerLink="/shop">Shop</a>
          <a routerLink="/cart">Cart</a>
          <a routerLink="/admin">Admin dashboard</a>
        </div>
        <div>
          <h4>Stack</h4>
          <span>Angular · TypeScript</span>
          <span>Node.js · Express</span>
          <span>MySQL</span>
        </div>
      </div>
      <div class="footer-bottom">© 2026 NOVA STORE — Demo project, no real payment.</div>
    </footer>
  `,
})
export class FooterComponent {}

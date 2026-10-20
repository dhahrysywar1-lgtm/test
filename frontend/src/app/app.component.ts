import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/footer.component';
import { NavbarComponent } from './components/navbar.component';
import { ToastContainerComponent } from './components/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastContainerComponent],
  template: `
    <app-navbar />
    <main><router-outlet /></main>
    <app-footer />
    <app-toast-container />
  `,
})
export class AppComponent {}

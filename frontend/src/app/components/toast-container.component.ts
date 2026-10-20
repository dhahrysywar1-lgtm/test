import { Component, inject } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="toasts" aria-live="polite">
      @for (t of toast.toasts(); track t.id) {
        <div [class]="'toast ' + t.type" role="status">
          <span>{{ t.type === 'success' ? '✔' : t.type === 'error' ? '✘' : 'ℹ' }}</span>
          <p>{{ t.message }}</p>
          <button type="button" aria-label="Close" (click)="toast.dismiss(t.id)">✕</button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  toast = inject(ToastService);
}

import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  template: `
    <div class="modal-backdrop" (click)="cancelled.emit()">
      <div class="modal modal-sm" role="alertdialog" aria-modal="true" (click)="$event.stopPropagation()">
        <h3>{{ title() }}</h3>
        <p class="muted">{{ message() }}</p>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" (click)="cancelled.emit()">Cancel</button>
          <button type="button" class="btn btn-danger" [disabled]="busy()" (click)="confirmed.emit()">
            {{ busy() ? 'Deleting…' : confirmLabel() }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmModalComponent {
  title = input('Are you sure?');
  message = input('');
  confirmLabel = input('Delete');
  busy = input(false);
  confirmed = output<void>();
  cancelled = output<void>();
}

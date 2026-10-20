import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private next = 1;
  readonly toasts = signal<Toast[]>([]);

  show(type: Toast['type'], message: string, ms = 4000) {
    const id = this.next++;
    this.toasts.update((t) => [...t, { id, type, message }]);
    setTimeout(() => this.dismiss(id), ms);
  }
  success(m: string) { this.show('success', m); }
  error(m: string) { this.show('error', m, 6000); }
  info(m: string) { this.show('info', m); }
  dismiss(id: number) { this.toasts.update((t) => t.filter((x) => x.id !== id)); }
}

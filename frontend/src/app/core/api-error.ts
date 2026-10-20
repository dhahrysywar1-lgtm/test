import { HttpErrorResponse } from '@angular/common/http';

/** Transforme une erreur HTTP en message lisible pour l'utilisateur. */
export function apiErrorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'Impossible de joindre le serveur. Le backend est-il démarré ?';
    const body = err.error as { error?: string; details?: { message: string }[] } | null;
    if (body?.details?.length) return body.details.map((d) => d.message).join(' · ');
    if (body?.error) return body.error;
    return `Erreur serveur (${err.status})`;
  }
  return 'Une erreur inattendue est survenue';
}

// URL de l'API REST (backend Express). À modifier si le port change.
export const API_URL = 'http://localhost:8000/api';
export const PLACEHOLDER_IMG = '/assets/placeholder.svg';
export const LOW_STOCK_THRESHOLD = 10;

export const CATEGORY_ICONS: Record<string, string> = {
  Audio: '🎧',
  Wearables: '⌚',
  Accessories: '⌨️',
  Home: '💡',
  Gaming: '🎮',
};
export const categoryIcon = (c: string) => CATEGORY_ICONS[c] ?? '🛍️';

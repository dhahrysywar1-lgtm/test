export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  stock: number;
  created_at: string;
  updated_at: string;
}

export type ProductInput = Pick<Product, 'name' | 'description' | 'price' | 'category' | 'image_url' | 'stock'>;

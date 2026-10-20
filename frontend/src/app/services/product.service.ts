import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../core/config';
import { Product, ProductInput } from '../models/product';

/** Toutes les opérations CRUD passent par l'API REST (jamais de données en dur). */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private url = `${API_URL}/products`;

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.url);
  }
  getOne(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.url}/${id}`);
  }
  create(p: ProductInput): Observable<Product> {
    return this.http.post<Product>(this.url, p);
  }
  update(id: number, p: ProductInput): Observable<Product> {
    return this.http.put<Product>(`${this.url}/${id}`, p);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

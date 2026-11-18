import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface IBanner {
  _id?: any;
  title?: string;
  subtitle?: string;
  tag?: string;
  image: string;
  link?: string;
}

export interface ICategory {
  _id?: any;
  id?: string;
  name: string;
  slug?: string;
  image: string;
  description?: string;
}

export interface ICollection {
  _id?: any;
  name: string;
  slug?: string;
  tag?: string;
  desc?: string;
  description?: string;
  image: string;
  coverImage?: string;
}

export interface IArticle {
  _id?: any;
  id?: string;
  title: string;
  slug?: string;
  tag?: string;
  category?: string;
  read?: string;
  date?: string;
  excerpt?: string;
  image: string;
  thumbnail?: string;
  content?: string;
}

export interface IVoucher {
  _id?: any;
  id?: string;
  code: string;
  title: string;
  desc?: string;
  discountAmount?: number;
  minOrderValue?: number;
  expiry?: string;
  statusKey?: string;
  boxTitle?: string;
  boxSub?: string;
  ctaLabel?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MasterDataService {
  private readonly BASE = '/api';

  // Signals
  banners = signal<IBanner[]>([]);
  categories = signal<ICategory[]>([]);
  collections = signal<ICollection[]>([]);
  articles = signal<IArticle[]>([]);
  vouchers = signal<IVoucher[]>([]);

  constructor(private _http: HttpClient) {}

  getBanners(): Observable<IBanner[]> {
    return this._http.get<IBanner[]>(`${this.BASE}/banners`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  getCategories(): Observable<ICategory[]> {
    return this._http.get<ICategory[]>(`${this.BASE}/categories`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  getCollections(): Observable<ICollection[]> {
    return this._http.get<ICollection[]>(`${this.BASE}/collections`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  getArticles(): Observable<IArticle[]> {
    return this._http.get<IArticle[]>(`${this.BASE}/articles`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  getVouchers(): Observable<IVoucher[]> {
    return this._http.get<IVoucher[]>(`${this.BASE}/vouchers`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  getGemstones(): Observable<any[]> {
    return this._http.get<any[]>(`${this.BASE}/gemstones`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  getElements(): Observable<any[]> {
    return this._http.get<any[]>(`${this.BASE}/elements`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('MasterDataService Error:', error.message);
    const msg = error.error?.message || error.message || 'Lỗi nạp dữ liệu từ máy chủ.';
    return throwError(() => new Error(msg));
  }
}

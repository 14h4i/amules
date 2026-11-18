import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private _items = signal<any[]>([]);

  // Số lượng yêu thích phản ứng thời gian thực (Angular Signals - Chương VIII)
  items = this._items.asReadonly();
  count = computed(() => {
    // Nếu chưa đăng nhập, số lượng yêu thích luôn là 0
    if (!this._auth.isLoggedIn()) {
      return 0;
    }
    return this._items().length;
  });

  constructor(
    private _auth: AuthService,
    private _http: HttpClient
  ) {
    this.loadFromStorage();
  }

  loadFromStorage(): void {
    if (this._auth.isLoggedIn()) {
      const saved = localStorage.getItem('amules_wishlist');
      if (saved) {
        try {
          this._items.set(JSON.parse(saved));
        } catch (e) {}
      }

      // Đồng bộ từ MongoDB collection 'wishlists'
      this._http.get<any>('/api/wishlists', { withCredentials: true }).subscribe({
        next: (res) => {
          if (res && res.items && res.items.length > 0) {
            this._items.set(res.items);
            localStorage.setItem('amules_wishlist', JSON.stringify(res.items));
          } else {
            this._items.set([]);
            localStorage.removeItem('amules_wishlist');
          }
        },
        error: () => {}
      });
    } else {
      this._items.set([]);
    }
  }

  toggleItem(product: any): boolean {
    if (!this._auth.isLoggedIn()) {
      return false;
    }
    const current = this._items();
    const pid = product.id || product._id || product.slug;
    const exists = current.some(i => (i.id === pid || i._id === pid || i.slug === pid));

    let updated: any[];
    if (exists) {
      updated = current.filter(i => (i.id !== pid && i._id !== pid && i.slug !== pid));
    } else {
      updated = [...current, { ...product, id: pid }];
    }

    this._items.set(updated);
    localStorage.setItem('amules_wishlist', JSON.stringify(updated));

    // Đồng bộ lên MongoDB API
    this._http.post('/api/wishlists/toggle', { productId: pid }, { withCredentials: true }).subscribe({
      error: () => {}
    });

    return !exists;
  }

  isWishlisted(productId: string): boolean {
    if (!this._auth.isLoggedIn()) return false;
    return this._items().some(i => (i.id === productId || i._id === productId || i.slug === productId));
  }

  clear(): void {
    this._items.set([]);
    localStorage.removeItem('amules_wishlist');
  }
}

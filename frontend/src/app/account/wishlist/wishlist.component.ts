import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';

interface WishProduct {
  id: any;
  categoryKey: string;
  categoryLabel: string;
  name: string;
  stoneTag: string;
  elementTag: string;
  specialBadge?: string;
  desc: string;
  price: number;
  inStock: boolean;
  image: string;
}

@Component({
  selector: 'app-wishlist',
  standalone: false,
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit {
  activeCat = 'all';
  toast: string | null = null;

  constructor(
    private _cartService: CartService,
    private _wishlistService: WishlistService,
    private _http: HttpClient
  ) {}

  categories = [
    { key: 'all', label: 'Tất cả (0)' },
    { key: 'bracelet', label: 'Vòng tay' },
    { key: 'necklace', label: 'Dây chuyền' },
    { key: 'ring', label: 'Nhẫn' },
    { key: 'stone', label: 'Tất cả loại đá' }
  ];

  items: WishProduct[] = [];

  ngOnInit(): void {
    this._http.get<any>('/api/wishlists', { withCredentials: true }).subscribe({
      next: (res) => {
        if (res && res.items && res.items.length > 0) {
          const mapped: WishProduct[] = res.items.map((p: any, idx: number) => {
            const cat = (p.category || '').toLowerCase();
            const catKey = cat.includes('vòng') || cat.includes('lac') ? 'bracelet' : cat.includes('nhẫn') ? 'ring' : cat.includes('dây') ? 'necklace' : 'bracelet';
            return {
              id: p._id || p.id || idx + 1,
              categoryKey: catKey,
              categoryLabel: catKey === 'bracelet' ? 'VÒNG TAY PHONG THỦY' : catKey === 'ring' ? 'NHẪN PHONG THỦY' : 'DÂY CHUYỀN NĂNG LƯỢNG',
              name: p.name,
              stoneTag: p.stone || 'Đá tự nhiên tuyển chọn',
              elementTag: p.element || 'Bảo vật ngũ hành',
              specialBadge: p.badge || (idx === 0 ? 'BESTSELLER' : ''),
              desc: p.description || 'Bạc S925 • Đá tự nhiên cao cấp',
              price: p.price,
              inStock: p.inStock !== false,
              image: p.image || 'images/lac_tay_bien.png'
            };
          });
          this.items = mapped;
          this.categories[0].label = `Tất cả (${this.items.length})`;
        } else {
          this.items = [];
          this.categories[0].label = 'Tất cả (0)';
        }
      },
      error: () => {
        this.items = [];
        this.categories[0].label = 'Tất cả (0)';
      }
    });
  }

  get filteredItems(): WishProduct[] {
    if (this.activeCat === 'all' || this.activeCat === 'stone') return this.items;
    return this.items.filter(i => i.categoryKey === this.activeCat);
  }

  removeItem(id: any) {
    this.items = this.items.filter(i => i.id !== id);
    this._wishlistService.toggleItem({ id });
    this.categories[0].label = `Tất cả (${this.items.length})`;
  }

  addToCart(p: WishProduct) {
    this._cartService.addToCart({
      productId: `wish_${p.id}`,
      name: p.name,
      price: p.price,
      originalPrice: p.price,
      image: p.image,
      quantity: 1,
      stone: p.stoneTag,
      size: '15 cm'
    }).subscribe();
    this.toast = `Đã thêm "${p.name}" vào giỏ hàng!`;
    setTimeout(() => (this.toast = null), 3000);
  }
}
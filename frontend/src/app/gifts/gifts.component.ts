import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProductService, IProduct } from '../services/product.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-gifts',
  standalone: false,
  templateUrl: './gifts.component.html',
  styleUrl: './gifts.component.css'
})
export class GiftsComponent implements OnInit {
  giftProducts: IProduct[] = [];
  packages: any[] = [];
  loading = false;
  addedToast: string | null = null;

  constructor(
    private _http: HttpClient,
    private _productService: ProductService,
    private _cartService: CartService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loading = true;

    // 1. Tải danh sách gói quà trực tiếp từ CSDL MongoDB
    this._http.get<any[]>('/api/gift-packages').subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.packages = data.map(p => ({
            ...p,
            name: p.name,
            desc: p.desc || p.description || p.shortDescription || 'Gói quà tặng ý nghĩa trang sức AMULES.',
            price: p.price || 99000,
            image: p.image || p.thumbnail || '',
            tag: p.tag || 'DỊCH VỤ QUÀ TẶNG'
          }));
        } else {
          this.packages = [];
        }
        this._cdr.detectChanges();
      },
      error: () => {
        this.packages = [];
        this._cdr.detectChanges();
      }
    });

    // 2. Tải danh sách bảo vật gợi ý quà tặng từ MongoDB
    this._productService.getProducts().subscribe({
      next: (prods) => {
        if (prods && prods.length > 0) {
          const giftSuitable = prods.filter(p => !(p as any).isGiftPackage && p.category !== 'Set quà tặng');
          this.giftProducts = (giftSuitable.length > 0 ? giftSuitable : prods).slice(0, 8);
        } else {
          this.giftProducts = [];
        }
        this.loading = false;
        this._cdr.detectChanges();
      },
      error: () => {
        this.giftProducts = [];
        this.loading = false;
        this._cdr.detectChanges();
      }
    });
  }

  addPackageToCart(pkg: any): void {
    this._cartService.addToCart({
      productId: pkg._id || pkg.id || pkg.slug,
      name: pkg.name,
      price: pkg.price,
      image: pkg.image,
      quantity: 1,
      stone: 'Gói quà tặng'
    }).subscribe({
      next: () => {
        this.showToast(`Đã thêm "${pkg.name}" vào giỏ hàng`);
      },
      error: () => {
        this.showToast(`Đã thêm "${pkg.name}" vào giỏ hàng`);
      }
    });
  }

  private showToast(msg: string): void {
    this.addedToast = msg;
    this._cdr.detectChanges();
    setTimeout(() => {
      this.addedToast = null;
      this._cdr.detectChanges();
    }, 3000);
  }
}

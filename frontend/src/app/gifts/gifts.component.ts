import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProductService, IProduct } from '../services/product.service';

@Component({
  selector: 'app-gifts',
  standalone: false,
  templateUrl: './gifts.component.html',
  styleUrl: './gifts.component.css'
})
export class GiftsComponent implements OnInit {
  giftProducts: IProduct[] = [];
  packages: any[] = [];
  loading = true;

  constructor(
    private _http: HttpClient,
    private _productService: ProductService
  ) {}

  ngOnInit(): void {
    // 1. Tải danh sách gói quà trực tiếp từ CSDL MongoDB
    this._http.get<any[]>('/api/gift-packages').subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.packages = data;
        }
      },
      error: () => {}
    });

    // 2. Tải danh sách bảo vật gợi ý quà tặng từ MongoDB
    this._productService.getProducts().subscribe({
      next: (prods) => {
        this.giftProducts = (prods || []).slice(0, 8);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { ProductService, IProduct } from '../services/product.service';

@Component({
  selector: 'app-gifts',
  standalone: false,
  templateUrl: './gifts.component.html',
  styleUrl: './gifts.component.css'
})
export class GiftsComponent implements OnInit {
  giftProducts: IProduct[] = [];
  loading = true;

  packages = [
    { name: 'Hộp Quà Tri Ân Nữ Thần', desc: 'Hộp nhung tím cao cấp, thiệp chúc mừng dập nhũ vàng 24K và túi giấy AMULES Signature.', price: 99000, image: 'images/banner_mrs.jpg' },
    { name: 'Combo Thanh Tẩy Năng Lượng', desc: 'Thanh trầm hương tự nhiên, tinh thể thạch anh trắng và chuông xoay thanh tẩy đá quý.', price: 150000, image: 'images/banner_mys.jpg' },
    { name: 'Gói Quà Sinh Nhật Chiêm Tinh', desc: 'Bao gồm phong thư thông điệp năng lượng chiêm tinh theo ngày tháng năm sinh của người nhận.', price: 120000, image: 'images/banner_muse.jpg' }
  ];

  constructor(private _productService: ProductService) {}

  ngOnInit(): void {
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

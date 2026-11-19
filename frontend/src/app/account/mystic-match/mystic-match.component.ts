import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ProductService, IProduct } from '../../services/product.service';

@Component({
  selector: 'app-mystic-match',
  standalone: false,
  templateUrl: './mystic-match.component.html',
  styleUrl: './mystic-match.component.css'
})
export class MysticMatchComponent implements OnInit {
  sharedToast = false;
  userName = '';

  energyPillars = [
    {
      icon: 'moon',
      label: 'CUNG HOÀNG ĐẠO',
      title: 'Song Ngư (Pisces) ♓',
      sub: 'Trực giác sâu sắc, nhạy cảm'
    },
    {
      icon: 'drop',
      label: 'MỆNH NGŨ HÀNH',
      title: 'Hải Trung Thủy',
      sub: 'Dòng nước biển sâu, bao dung'
    },
    {
      icon: 'sparkle',
      label: 'NGUYÊN TỐ TƯƠNG SINH',
      title: 'Kim sinh Thủy • Thủy hợp',
      sub: 'Cân bằng tài lộc & bình an'
    },
    {
      icon: 'globe',
      label: 'HÀNH TINH BẢO TRỢ',
      title: 'Sao Hải Vương ♆',
      sub: 'Thức tỉnh tâm linh & cảm xúc'
    }
  ];

  colors = [
    { name: 'Lam Biển Dịu Êm', sub: 'Màu bản mệnh • Bình an nội tâm', hex: '#4986a7' },
    { name: 'Trắng Ánh Bạc (Kim)', sub: 'Màu tương sinh • Khai mở trí tuệ', hex: '#d8dde6' },
    { name: 'Đen Huyền Bí', sub: 'Hộ thân & Trừ tà khí', hex: '#1e1c24' },
    { name: 'Xanh Thẫm Đại Dương', sub: 'Thu hút quý nhân phù trợ', hex: '#1d3658' }
  ];

  recommendedProducts: any[] = [];

  constructor(
    private _auth: AuthService,
    private _productService: ProductService,
    private _http: HttpClient,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // 1. Tải bản mệnh đã lưu của người dùng từ MongoDB profile
    this._http.get<any>('/api/auth/profile', { withCredentials: true }).subscribe({
      next: (res) => {
        const u = res?.user || this._auth.currentUser();
        if (u) {
          this.userName = u.fullName || u.name || '';
          if (u.zodiac) {
            this.energyPillars[0].title = u.zodiac;
          } else if (u.email !== 'lananh.gemini@gmail.com') {
            this.energyPillars[0].title = 'Chưa thiết lập';
            this.energyPillars[0].sub = 'Cập nhật ngày sinh tại Hồ sơ để kích hoạt';
          }
          if (u.element) {
            this.energyPillars[1].title = u.element;
            if (u.element.includes('Kim')) {
              this.energyPillars[2].title = 'Thổ sinh Kim • Kim hợp';
              this.colors[0] = { name: 'Vàng Hoàng Kim', sub: 'Màu tương sinh', hex: '#eab308' };
              this.colors[1] = { name: 'Trắng Tinh Khiết', sub: 'Màu bản mệnh', hex: '#f8fafc' };
            } else if (u.element.includes('Mộc')) {
              this.energyPillars[2].title = 'Thủy sinh Mộc • Mộc hợp';
              this.colors[0] = { name: 'Xanh Lục Bảo', sub: 'Màu bản mệnh', hex: '#16a34a' };
              this.colors[1] = { name: 'Xanh Biển Sâu', sub: 'Màu tương sinh', hex: '#0284c7' };
            } else if (u.element.includes('Hỏa')) {
              this.energyPillars[2].title = 'Mộc sinh Hỏa • Hỏa hợp';
              this.colors[0] = { name: 'Đỏ Ruby', sub: 'Màu bản mệnh', hex: '#dc2626' };
              this.colors[1] = { name: 'Hồng Thạch Anh', sub: 'Màu tương hợp', hex: '#f43f5e' };
            } else if (u.element.includes('Thổ')) {
              this.energyPillars[2].title = 'Hỏa sinh Thổ • Thổ hợp';
              this.colors[0] = { name: 'Vàng Hổ Phách', sub: 'Màu bản mệnh', hex: '#d97706' };
              this.colors[1] = { name: 'Nâu Đất Mẹ', sub: 'Màu tương hợp', hex: '#78350f' };
            }
          } else if (u.email !== 'lananh.gemini@gmail.com') {
            this.energyPillars[1].title = 'Chưa thiết lập';
            this.energyPillars[1].sub = 'Cập nhật ngày sinh tại Hồ sơ để kích hoạt';
            this.energyPillars[2].title = 'Đang chờ ngày sinh';
            this.energyPillars[3].title = 'Đang chờ ngày sinh';
          }
        }
      },
      error: () => {
        const u = this._auth.currentUser();
        if (u) this.userName = u.fullName || u.name || '';
      }
    });

    // 2. Tải sản phẩm tương sinh thật từ MongoDB products
    this._productService.getProducts().subscribe({
      next: (products) => {
        if (products && products.length > 0) {
          this.recommendedProducts = products.slice(0, 3).map((p, idx) => ({
            match: `TƯƠNG HỢP ${98 - idx * 3}%`,
            badge: idx === 0 ? 'BEST MATCH' : idx === 1 ? 'TƯƠNG SINH' : 'BÙA HỘ THÂN',
            stone: `${(p.stone || 'Đá tự nhiên').toUpperCase()} • Bạc 925`,
            name: p.name,
            desc: p.description || 'Bảo vật tương sinh được tuyển chọn theo ngũ hành chiêm tinh bản mệnh.',
            price: p.price,
            image: p.image || ''
          }));
          this._cdr.detectChanges();
        }
      },
      error: () => {}
    });
  }

  shareProfile(): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + '/mystic-match');
    }
    this.sharedToast = true;
    setTimeout(() => (this.sharedToast = false), 3000);
  }
}

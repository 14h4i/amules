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
  hasCompletedQuiz = false;
  latestSession: any = null;
  sessionDateStr = 'Hôm nay';
  elementName = 'Bản Mệnh Hộ Thân';
  dominantChakra = 'Luân xa Tim (Anahata)';

  energyPillars = [
    {
      icon: 'moon',
      label: 'CUNG HOÀNG ĐẠO',
      title: 'Đang tải...',
      sub: 'Tọa độ thiên thể lúc chào đời'
    },
    {
      icon: 'drop',
      label: 'MỆNH NGŨ HÀNH',
      title: 'Đang tải...',
      sub: 'Can Chi Nạp Âm phương Đông'
    },
    {
      icon: 'sparkle',
      label: 'LUÂN XA CỘNG HƯỞNG',
      title: 'Luân xa Tim (Anahata)',
      sub: 'Vùng năng lượng chủ đạo đã thức tỉnh'
    },
    {
      icon: 'globe',
      label: 'TẦN SỐ NGUYỆN ƯỚC',
      title: 'Bình An & Chữa Lành',
      sub: 'Thu hút phúc lành và định tĩnh'
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
    // 1. Tải thông tin người dùng từ profile
    this._http.get<any>('/api/auth/profile', { withCredentials: true }).subscribe({
      next: (res) => {
        const u = res?.user || this._auth.currentUser();
        if (u) {
          this.userName = u.fullName || u.name || '';
        }
      },
      error: () => {
        const u = this._auth.currentUser();
        if (u) this.userName = u.fullName || u.name || '';
      }
    });

    // 2. Tải phiên trắc nghiệm mới nhất từ CSDL MongoDB thật
    this._http.get<any>('/api/mystic-match/my-session', { withCredentials: true }).subscribe({
      next: (res) => {
        if (res && res.session) {
          this.hasCompletedQuiz = true;
          this.latestSession = res.session;

          if (res.session.createdAt) {
            const d = new Date(res.session.createdAt);
            this.sessionDateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
          }

          this.elementName = res.session.element || 'Bản Mệnh Hộ Thân';
          this.dominantChakra = res.session.dominantChakra || 'Luân xa Tim (Anahata)';

          const zName = res.session.zodiac || '';
          const zLatin = res.session.zodiacLatin ? `(${res.session.zodiacLatin})` : '';
          this.energyPillars[0].title = `${zName} ${zLatin}`.trim() || 'Cung Hoàng Đạo';

          this.energyPillars[1].title = res.session.element || 'Ngũ Hành Can Chi';
          this.energyPillars[2].title = this.dominantChakra;

          const wishMap: Record<string, string> = {
            peace: 'Bình An & Chữa Lành',
            love: 'Tình Duyên & Gắn Kết',
            wealth: 'Tài Lộc & Thịnh Vượng',
            clarity: 'Trực Giác & Trí Tuệ'
          };
          this.energyPillars[3].title = wishMap[res.session.wish] || 'Bình An & Hộ Thân';

          // Cập nhật bảng màu tương sinh
          this.updateColorsByElement(this.elementName);

          // Cập nhật bảo vật tương sinh từ MongoDB
          if (res.products && res.products.length > 0) {
            const recMap = new Map<string, any>();
            (res.recommendations || []).forEach((r: any) => {
              recMap.set(String(r.productId), r);
            });

            this.recommendedProducts = res.products.map((p: any, idx: number) => {
              const rec = recMap.get(String(p._id)) || recMap.get(String(p.id)) || {};
              return {
                match: `TƯƠNG HỢP ${rec.matchScore || (98 - idx * 3)}%`,
                badge: idx === 0 ? 'BEST MATCH' : idx === 1 ? 'TƯƠNG SINH' : 'BÙA HỘ THÂN',
                stone: `${(p.stone || 'Đá tự nhiên').toUpperCase()} • Bạc 925`,
                name: p.name,
                desc: (rec.matchReasons && rec.matchReasons.join(' • ')) || p.description || 'Bảo vật tương sinh được tuyển chọn theo ngũ hành chiêm tinh bản mệnh.',
                price: p.price,
                image: p.image || (p.images && p.images[0]) || '',
                slug: p.slug || p.id || p._id
              };
            });
            this._cdr.detectChanges();
            return;
          }
        } else {
          // Chưa có bài test trong MongoDB -> fallback lấy thông tin user profile
          this.hasCompletedQuiz = false;
          const u = this._auth.currentUser();
          if (u?.zodiac) {
            this.energyPillars[0].title = u.zodiac;
          } else {
            this.energyPillars[0].title = 'Chưa thiết lập';
            this.energyPillars[0].sub = 'Làm bài trắc nghiệm để mở khóa';
          }
          if (u?.element) {
            this.energyPillars[1].title = u.element;
            this.elementName = u.element;
            this.updateColorsByElement(u.element);
          } else {
            this.energyPillars[1].title = 'Chưa thiết lập';
            this.energyPillars[1].sub = 'Làm bài trắc nghiệm để mở khóa';
          }
        }

        // Tải sản phẩm tương sinh mặc định từ MongoDB
        this.loadProductsFallback();
      },
      error: () => {
        this.loadProductsFallback();
      }
    });
  }

  private loadProductsFallback(): void {
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
            image: p.image || (p.images && p.images[0]) || '',
            slug: p.slug || p.id || p._id
          }));
          this._cdr.detectChanges();
        }
      },
      error: () => {}
    });
  }

  private updateColorsByElement(el: string): void {
    if (el.includes('Kim')) {
      this.colors = [
        { name: 'Trắng Tinh Khiết', sub: 'Màu bản mệnh • Sáng suốt', hex: '#f8fafc' },
        { name: 'Vàng Hoàng Kim (Thổ)', sub: 'Màu tương sinh • Khai vận', hex: '#eab308' },
        { name: 'Xám Bạc Tinh Tế', sub: 'Hộ thân & Minh triết', hex: '#94a3b8' },
        { name: 'Nâu Hổ Phách', sub: 'Vững vàng cội nguồn', hex: '#b45309' }
      ];
    } else if (el.includes('Mộc')) {
      this.colors = [
        { name: 'Xanh Lục Bảo', sub: 'Màu bản mệnh • Tươi mới', hex: '#16a34a' },
        { name: 'Xanh Biển Sâu (Thủy)', sub: 'Màu tương sinh • Dưỡng sinh', hex: '#0284c7' },
        { name: 'Đen Huyền Bí', sub: 'Thủy sinh Mộc • Tích phúc', hex: '#1e1c24' },
        { name: 'Xanh Ngọc Lam', sub: 'Nuôi dưỡng trực giác', hex: '#0d9488' }
      ];
    } else if (el.includes('Hỏa')) {
      this.colors = [
        { name: 'Đỏ Ruby Quý Tộc', sub: 'Màu bản mệnh • Nhiệt huyết', hex: '#dc2626' },
        { name: 'Hồng Thạch Anh', sub: 'Tương hợp • Tình duyên', hex: '#f43f5e' },
        { name: 'Xanh Lá Tươi (Mộc)', sub: 'Màu tương sinh • Sinh sôi', hex: '#22c55e' },
        { name: 'Tím Hoàng Gia', sub: 'Khai mở linh thức', hex: '#7c3aed' }
      ];
    } else if (el.includes('Thổ')) {
      this.colors = [
        { name: 'Vàng Hổ Phách', sub: 'Màu bản mệnh • Vượng tài', hex: '#d97706' },
        { name: 'Nâu Đất Mẹ', sub: 'Bản mệnh • Điểm tựa vững bền', hex: '#78350f' },
        { name: 'Đỏ Ruby (Hỏa)', sub: 'Hỏa sinh Thổ • Tương sinh', hex: '#b91c1c' },
        { name: 'Cam Hoàng Hôn', sub: 'Thúc đẩy sinh khí', hex: '#ea580c' }
      ];
    } else {
      this.colors = [
        { name: 'Lam Biển Dịu Êm', sub: 'Màu bản mệnh • Bình an nội tâm', hex: '#4986a7' },
        { name: 'Trắng Ánh Bạc (Kim)', sub: 'Màu tương sinh • Khai mở trí tuệ', hex: '#d8dde6' },
        { name: 'Đen Huyền Bí', sub: 'Hộ thân & Trừ tà khí', hex: '#1e1c24' },
        { name: 'Xanh Thẫm Đại Dương', sub: 'Thu hút quý nhân phù trợ', hex: '#1d3658' }
      ];
    }
  }

  shareProfile(): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + '/mystic-match');
    }
    this.sharedToast = true;
    setTimeout(() => (this.sharedToast = false), 3000);
  }
}

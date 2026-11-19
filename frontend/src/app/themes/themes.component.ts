import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProductService, IProduct } from '../services/product.service';

interface IThemeItem {
  name: string;
  slug: string;
  tag?: string;
  description: string;
  image: string;
  productCodes?: string[];
  productIds?: any[];
}

const FALLBACK_THEMES: IThemeItem[] = [
  {
    name: "Tình yêu & Kết nối",
    slug: "tinh-yeu-ket-noi",
    tag: "TÌNH DUYÊN & HÀN GẮN",
    description: "Thạch anh hồng dịu dàng, khơi mở luồng yêu thương thuần khiết và gắn kết tâm hồn tri kỷ.",
    image: "https://i.pinimg.com/736x/47/9c/df/479cdf269b5b50948b8aef6103b475ed.jpg",
    productCodes: ["AM-RQ020", "AM-CH002"]
  },
  {
    name: "Bình an & Cân bằng",
    slug: "binh-an-can-bang",
    tag: "TĨNH TÂM & NĂNG LƯỢNG",
    description: "Aquamarine và Moonstone làm dịu tâm trí, giữ sự tĩnh tại, thông suốt trước mọi thử thách.",
    image: "https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg",
    productCodes: ["AM-AQ001", "AM-MS042", "AM-CH001", "AM-AQ003"]
  },
  {
    name: "Tự tin & Tỏa sáng",
    slug: "tu-tin-toa-sang",
    tag: "DŨNG KHÍ & BẢN LĨNH",
    description: "Citrine thắp sáng nguồn năng lượng thái dương, tiếp thêm dũng khí và sức hút rực rỡ.",
    image: "https://i.pinimg.com/736x/8b/56/4e/8b564e66f5a26e5a7761873879e15a44.jpg",
    productCodes: ["AM-CT004", "AM-CH003"]
  },
  {
    name: "May mắn & Cơ hội",
    slug: "may-man-co-hoi",
    tag: "TÀI LỘC & VẬN KHÍ",
    description: "Aventurine xanh ngọc bích mở lối tài lộc, đón nhận vận may bất ngờ và cát khí dồi dào.",
    image: "https://i.pinimg.com/736x/1c/26/6c/1c266ca556baad51cba3d0fa8514949a.jpg",
    productCodes: ["AM-AV005", "AM-CH004"]
  },
  {
    name: "Chữa lành & Thư giãn",
    slug: "chua-lanh-thu-gian",
    tag: "THANH TẨY & AN YÊN",
    description: "Thạch anh tím Amethyst xua tan âu lo, bảo hộ giấc ngủ an lành và nâng đỡ tần số tinh thần.",
    image: "https://i.pinimg.com/736x/67/20/bb/6720bb1b590c9b0e1a12903333333333.jpg",
    productCodes: ["AM-AM006", "AM-CH005"]
  },
  {
    name: "Tình bạn & Gắn kết",
    slug: "tinh-ban-gan-ket",
    tag: "TRI KỶ & BỀN VỮNG",
    description: "Ngọc bích Nephrite kết nối sự đồng điệu, giữ gìn mối thâm giao chân thành và trọn vẹn.",
    image: "https://i.pinimg.com/736x/43/5e/5f/435e5fe6e3c545362ffb7623a31c5ee9.jpg",
    productCodes: ["AM-JD063", "AM-AQ001"]
  },
  {
    name: "Năng lượng sáng tạo",
    slug: "nang-luong-sang-tao",
    tag: "TRỰC GIÁC & CẢM HỨNG",
    description: "Fluorite đa sắc kích hoạt trí tuệ mẫn tiệp, mở ra tầm nhìn trực giác và ý tưởng đột phá.",
    image: "https://i.pinimg.com/736x/e8/3b/bc/e83bbc521fc41e97669d675681c625ae.jpg",
    productCodes: ["AM-FL064", "AM-MS010"]
  },
  {
    name: "Quà tặng ý nghĩa",
    slug: "qua-tang-y-nghia",
    tag: "TRAO GỬI YÊU THƯƠNG",
    description: "Những tuyệt tác trang sức tinh tuyển trong hộp nhung hoàng gia, gửi gắm lời chúc bình an sâu sắc.",
    image: "https://i.pinimg.com/736x/d9/3e/26/d93e26bbbbff2a9bb411ce4999999999.jpg",
    productCodes: ["AM-GS065", "AM-PR030"]
  }
];

@Component({
  selector: 'app-themes',
  standalone: false,
  templateUrl: './themes.component.html',
  styleUrl: './themes.component.css'
})
export class ThemesComponent implements OnInit {
  themes: IThemeItem[] = FALLBACK_THEMES;
  selectedTheme: IThemeItem = FALLBACK_THEMES[0];
  allProducts: IProduct[] = [];
  products: IProduct[] = [];
  loading = false;
  private _routeSlug = '';

  constructor(
    private _route: ActivatedRoute,
    private _http: HttpClient,
    private _productService: ProductService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      this._routeSlug = (params['slug'] || '').toLowerCase();
      this.syncSelectedTheme();
      this.filterProductsForTheme(this.selectedTheme);
      this._cdr.detectChanges();
    });

    this.loading = true;

    // 1. Lấy danh sách sản phẩm từ ProductService
    this._productService.getProducts().subscribe({
      next: (prods) => {
        if (prods && prods.length > 0) {
          this.allProducts = prods;
          this.filterProductsForTheme(this.selectedTheme);
        }
        this.loading = false;
        this._cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this._cdr.detectChanges();
      }
    });

    // 2. Đồng bộ chủ đề từ API backend trực tiếp từ MongoDB CSDL
    this._http.get<any[]>('/api/themes').subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.themes = data.map(t => {
            const slug = t.slug || '';
            return {
              name: t.name,
              slug: slug,
              tag: t.tag || this.getThemeTag(slug),
              description: t.description || t.desc || 'Chủ đề bảo vật phong thủy AMULES.',
              image: t.image || t.coverImage || t.bannerImage || 'https://i.pinimg.com/736x/47/9c/df/479cdf269b5b50948b8aef6103b475ed.jpg',
              productCodes: t.productCodes || [],
              productIds: t.productIds || []
            };
          });
        } else if (!this.themes || this.themes.length === 0) {
          this.themes = FALLBACK_THEMES;
        }

        this.syncSelectedTheme();
        this.filterProductsForTheme(this.selectedTheme);
        this.loading = false;
        this._cdr.detectChanges();
      },
      error: () => {
        if (!this.themes || this.themes.length === 0) {
          this.themes = FALLBACK_THEMES;
        }
        this.syncSelectedTheme();
        this.filterProductsForTheme(this.selectedTheme);
        this.loading = false;
        this._cdr.detectChanges();
      }
    });
  }

  private syncSelectedTheme(): void {
    if (this._routeSlug && this.themes.length > 0) {
      const found = this.themes.find(th => th.slug === this._routeSlug);
      if (found) {
        this.selectedTheme = found;
        return;
      }
    }
    if (!this.selectedTheme && this.themes.length > 0) {
      this.selectedTheme = this.themes[0];
    }
  }

  selectTheme(t: IThemeItem): void {
    this.selectedTheme = t;
    this.filterProductsForTheme(t);
    this._cdr.detectChanges();
  }

  filterProductsForTheme(theme: IThemeItem): void {
    if (!theme) return;
    const codes = theme.productCodes || [];
    const slug = theme.slug || '';

    if (!this.allProducts || this.allProducts.length === 0) {
      this.products = [];
      return;
    }

    let matched = this.allProducts.filter(p => {
      const pCode = p.productCode || p.code || '';
      if (codes.includes(pCode)) return true;

      const pId = String(p.id || p._id || '');
      if (theme.productIds && theme.productIds.some(id => String(id?.$oid || id) === pId)) {
        return true;
      }

      const pName = (p.name || '').toLowerCase();
      const pStone = (p.stone || '').toLowerCase();
      const pDesc = (p.description || '').toLowerCase();
      const full = `${pName} ${pStone} ${pDesc}`;

      if (slug === 'tinh-yeu-ket-noi') {
        return full.includes('venus') || full.includes('hồng') || full.includes('tình duyên') || full.includes('rose quartz');
      }
      if (slug === 'binh-an-can-bang') {
        return full.includes('biển xanh') || full.includes('aquamarine') || full.includes('moonstone') || full.includes('hải lam');
      }
      if (slug === 'tu-tin-toa-sang') {
        return full.includes('citrine') || full.includes('ánh dương') || full.includes('huyền ảo') || full.includes('thái dương');
      }
      if (slug === 'may-man-co-hoi') {
        return full.includes('aventurine') || full.includes('may mắn') || full.includes('cỏ bốn cánh') || full.includes('tài lộc');
      }
      if (slug === 'chua-lanh-thu-gian') {
        return full.includes('amethyst') || full.includes('tím khói') || full.includes('khói lam') || full.includes('thanh tẩy');
      }
      if (slug === 'tinh-ban-gan-ket') {
        return full.includes('ngọc bích') || full.includes('nephrite') || pCode === 'AM-JD063' || pCode === 'AM-AQ001';
      }
      if (slug === 'nang-luong-sang-tao') {
        return full.includes('fluorite') || full.includes('sáng tạo') || pCode === 'AM-FL064' || pCode === 'AM-MS010';
      }
      if (slug === 'qua-tang-y-nghia') {
        return full.includes('hộp nhung') || full.includes('quà') || pCode === 'AM-GS065' || pCode === 'AM-PR030';
      }
      return false;
    });

    if (matched.length === 0) {
      matched = this.allProducts.slice(0, 6);
    }

    this.products = matched;
  }

  private getThemeTag(slug: string): string {
    const tagMap: Record<string, string> = {
      'tinh-yeu-ket-noi': 'TÌNH DUYÊN & HÀN GẮN',
      'binh-an-can-bang': 'TĨNH TÂM & NĂNG LƯỢNG',
      'tu-tin-toa-sang': 'DŨNG KHÍ & BẢN LĨNH',
      'may-man-co-hoi': 'TÀI LỘC & VẬN KHÍ',
      'chua-lanh-thu-gian': 'THANH TẨY & AN YÊN',
      'tinh-ban-gan-ket': 'TRI KỶ & BỀN VỮNG',
      'nang-luong-sang-tao': 'TRỰC GIÁC & CẢM HỨNG',
      'qua-tang-y-nghia': 'TRAO GỬI YÊU THƯƠNG'
    };
    return tagMap[slug] || 'CHỦ ĐỀ NĂNG LƯỢNG';
  }
}

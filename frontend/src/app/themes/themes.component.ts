import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

@Component({
  selector: 'app-themes',
  standalone: false,
  templateUrl: './themes.component.html',
  styleUrl: './themes.component.css'
})
export class ThemesComponent implements OnInit {
  themes: IThemeItem[] = [];
  selectedTheme: IThemeItem | null = null;
  allProducts: IProduct[] = [];
  products: IProduct[] = [];
  loading = false;
  private _routeSlug = '';

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _http: HttpClient,
    private _productService: ProductService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      this._routeSlug = (params['slug'] || '').toLowerCase();
      this.syncSelectedTheme();
      if (this.selectedTheme) {
        this.filterProductsForTheme(this.selectedTheme);
      }
      this._cdr.detectChanges();
    });

    this.loading = true;

    // 1. Lấy danh sách sản phẩm từ ProductService
    this._productService.getProducts().subscribe({
      next: (prods) => {
        if (prods && prods.length > 0) {
          this.allProducts = prods;
          if (this.selectedTheme) {
            this.filterProductsForTheme(this.selectedTheme);
          }
        } else {
          this.allProducts = [];
        }
        this.loading = false;
        this._cdr.detectChanges();
      },
      error: () => {
        this.allProducts = [];
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
              image: t.image || t.coverImage || t.bannerImage || '',
              productCodes: t.productCodes || [],
              productIds: t.productIds || []
            };
          });
        } else {
          this.themes = [];
        }

        this.syncSelectedTheme();
        if (this.selectedTheme) {
          this.filterProductsForTheme(this.selectedTheme);
        }
        this.loading = false;
        this._cdr.detectChanges();
      },
      error: () => {
        this.themes = [];
        this.loading = false;
        this._cdr.detectChanges();
      }
    });
  }

  private syncSelectedTheme(): void {
    if (this._routeSlug && this.themes.length > 0) {
      const found = this.themes.find(th => th.slug === this._routeSlug);
      this.selectedTheme = found || null;
    } else {
      // Khi ở URL /themes (không có slug), không hiển thị chi tiết mà chỉ hiện danh sách
      this.selectedTheme = null;
    }
  }

  goToTheme(t: IThemeItem): void {
    this._router.navigate(['/themes', t.slug]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToThemes(): void {
    this._router.navigate(['/themes']);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getProductCountForTheme(theme: IThemeItem): number {
    if (!theme || !this.allProducts.length) return 0;
    const codes = theme.productCodes || [];
    const slug = theme.slug || '';

    const matched = this.allProducts.filter(p => {
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

      if (slug === 'tinh-yeu-ket-noi') return full.includes('venus') || full.includes('hồng') || full.includes('tình duyên') || full.includes('rose quartz');
      if (slug === 'binh-an-can-bang') return full.includes('biển xanh') || full.includes('aquamarine') || full.includes('moonstone') || full.includes('hải lam');
      if (slug === 'tu-tin-toa-sang') return full.includes('citrine') || full.includes('ánh dương') || full.includes('thái dương');
      if (slug === 'may-man-co-hoi') return full.includes('aventurine') || full.includes('may mắn') || full.includes('cỏ bốn cánh');
      if (slug === 'chua-lanh-thu-gian') return full.includes('amethyst') || full.includes('tím khói') || full.includes('thanh tẩy');
      if (slug === 'tinh-ban-gan-ket') return full.includes('ngọc bích') || full.includes('nephrite');
      if (slug === 'nang-luong-sang-tao') return full.includes('fluorite') || full.includes('sáng tạo');
      if (slug === 'qua-tang-y-nghia') return full.includes('hộp nhung') || full.includes('quà');
      return false;
    });

    return matched.length || 3;
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

      if (slug === 'tinh-yeu-ket-noi') return full.includes('venus') || full.includes('hồng') || full.includes('tình duyên') || full.includes('rose quartz');
      if (slug === 'binh-an-can-bang') return full.includes('biển xanh') || full.includes('aquamarine') || full.includes('moonstone') || full.includes('hải lam');
      if (slug === 'tu-tin-toa-sang') return full.includes('citrine') || full.includes('ánh dương') || full.includes('thái dương');
      if (slug === 'may-man-co-hoi') return full.includes('aventurine') || full.includes('may mắn') || full.includes('cỏ bốn cánh');
      if (slug === 'chua-lanh-thu-gian') return full.includes('amethyst') || full.includes('tím khói') || full.includes('thanh tẩy');
      if (slug === 'tinh-ban-gan-ket') return full.includes('ngọc bích') || full.includes('nephrite');
      if (slug === 'nang-luong-sang-tao') return full.includes('fluorite') || full.includes('sáng tạo');
      if (slug === 'qua-tang-y-nghia') return full.includes('hộp nhung') || full.includes('quà');
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

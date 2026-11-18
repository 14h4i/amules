import { Component, OnInit } from '@angular/core';
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

  constructor(
    private _route: ActivatedRoute,
    private _http: HttpClient,
    private _productService: ProductService
  ) {}

  ngOnInit(): void {
    let routeSlug = '';
    this._route.params.subscribe(params => {
      routeSlug = (params['slug'] || '').toLowerCase();
      if (routeSlug && this.themes.length > 0) {
        const found = this.themes.find(th => th.slug === routeSlug);
        if (found) {
          this.selectedTheme = found;
          this.filterProductsForTheme(this.selectedTheme);
        }
      }
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
        }
      },
      error: () => {}
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

          const currentSlug = routeSlug || (this.selectedTheme ? this.selectedTheme.slug : this.themes[0].slug);
          const found = this.themes.find(th => th.slug === currentSlug);
          this.selectedTheme = found || this.themes[0];
          this.filterProductsForTheme(this.selectedTheme);
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  selectTheme(t: IThemeItem): void {
    this.selectedTheme = t;
    this.filterProductsForTheme(t);
  }

  filterProductsForTheme(theme: IThemeItem): void {
    if (!theme) return;
    const codes = theme.productCodes || [];
    const slug = theme.slug || '';

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
        return full.includes('venus') || full.includes('hồng') || full.includes('tình duyên');
      }
      if (slug === 'binh-an-can-bang') {
        return full.includes('biển xanh') || full.includes('aquamarine') || full.includes('moonstone') || full.includes('hải lam');
      }
      if (slug === 'tu-tin-toa-sang') {
        return full.includes('citrine') || full.includes('ánh dương') || full.includes('huyền ảo');
      }
      if (slug === 'may-man-co-hoi') {
        return full.includes('aventurine') || full.includes('may mắn') || full.includes('cỏ bốn cánh');
      }
      if (slug === 'chua-lanh-thu-gian') {
        return full.includes('amethyst') || full.includes('tím khói') || full.includes('khói lam');
      }
      if (slug === 'tinh-ban-gan-ket') {
        return full.includes('ngọc bích') || pCode === 'AM-JD063' || pCode === 'AM-AQ001';
      }
      if (slug === 'nang-luong-sang-tao') {
        return full.includes('fluorite') || pCode === 'AM-FL064' || pCode === 'AM-MS010';
      }
      if (slug === 'qua-tang-y-nghia') {
        return full.includes('hộp nhung') || pCode === 'AM-GS065' || pCode === 'AM-PR030';
      }
      return false;
    });

    if (matched.length === 0) {
      matched = this.allProducts.slice(0, 4);
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

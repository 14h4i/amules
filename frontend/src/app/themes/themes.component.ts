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
  themes: IThemeItem[] = this.getFallbackThemes();
  selectedTheme: IThemeItem = this.getFallbackThemes()[0];
  allProducts: IProduct[] = [];
  products: IProduct[] = [];
  loading = false;

  private readonly themeImageMap: Record<string, string> = {
    'tinh-yeu-ket-noi': 'https://i.pinimg.com/736x/47/9c/df/479cdf269b5b50948b8aef6103b475ed.jpg',
    'binh-an-can-bang': 'https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg',
    'tu-tin-toa-sang': 'https://i.pinimg.com/736x/8b/56/4e/8b564e66f5a26e5a7761873879e15a44.jpg',
    'may-man-co-hoi': 'https://i.pinimg.com/1200x/d9/7e/2f/d97e2f5138a3f151bb55613e38f15350.jpg',
    'chua-lanh-thu-gian': 'https://i.pinimg.com/1200x/19/ae/48/19ae4807b1c9b47d2cf7ad70fef19fbb.jpg',
    'tinh-ban-gan-ket': 'https://i.pinimg.com/736x/b3/cf/e0/b3cfe07a389a61eaa7b0f186da90da4f.jpg',
    'nang-luong-sang-tao': 'https://i.pinimg.com/736x/f8/c8/db/f8c8dbe300b276861a7e7feb87c9e4fe.jpg',
    'qua-tang-y-nghia': 'https://i.pinimg.com/736x/9b/9f/9f/9b9f9f152363271f0c154f437b34def0.jpg'
  };

  constructor(
    private _route: ActivatedRoute,
    private _http: HttpClient,
    private _productService: ProductService
  ) {}

  ngOnInit(): void {
    let routeSlug = '';
    this._route.params.subscribe(params => {
      routeSlug = (params['slug'] || '').toLowerCase();
      if (routeSlug) {
        const found = this.themes.find(th => th.slug === routeSlug);
        if (found) {
          this.selectedTheme = found;
          this.filterProductsForTheme(this.selectedTheme);
        }
      }
    });

    // 1. Lọc sản phẩm ngay lập tức từ kho dữ liệu tĩnh (0ms latency, không giật màn hình)
    if (routeSlug) {
      const initFound = this.themes.find(th => th.slug === routeSlug);
      if (initFound) this.selectedTheme = initFound;
    }
    this.filterProductsForTheme(this.selectedTheme);

    // 2. Lấy danh sách sản phẩm từ ProductService
    this._productService.getProducts().subscribe({
      next: (prods) => {
        if (prods && prods.length > 0) {
          this.allProducts = prods;
          this.filterProductsForTheme(this.selectedTheme);
        }
      },
      error: () => {}
    });

    // 3. Đồng bộ chủ đề từ API backend (giữ nguyên ảnh chuẩn nét, không trùng lặp)
    this._http.get<any[]>('/api/themes').subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.themes = data.map(t => {
            const slug = t.slug || '';
            const correctImg = this.themeImageMap[slug] || t.image || t.coverImage || t.bannerImage || 'https://i.pinimg.com/736x/8b/56/4e/8b564e66f5a26e5a7761873879e15a44.jpg';
            return {
              name: t.name,
              slug: slug,
              tag: t.tag || this.getThemeTag(slug),
              description: t.description || t.desc || 'Chủ đề bảo vật phong thủy AMULES.',
              image: correctImg,
              productCodes: t.productCodes || [],
              productIds: t.productIds || []
            };
          });

          // Giữ nguyên chủ đề người dùng đang chọn hoặc chọn chủ đề đầu tiên
          const currentSlug = routeSlug || this.selectedTheme?.slug;
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

  private getFallbackThemes(): IThemeItem[] {
    return [
      {
        name: 'Tình yêu & Kết nối',
        slug: 'tinh-yeu-ket-noi',
        tag: 'TÌNH DUYÊN & HÀN GẮN',
        description: 'Thạch anh hồng dịu dàng, khơi mở luồng yêu thương thuần khiết và gắn kết tâm hồn tri kỷ.',
        image: 'https://i.pinimg.com/736x/47/9c/df/479cdf269b5b50948b8aef6103b475ed.jpg',
        productCodes: ['AM-RQ020', 'AM-CH002']
      },
      {
        name: 'Bình an & Cân bằng',
        slug: 'binh-an-can-bang',
        tag: 'TĨNH TÂM & NĂNG LƯỢNG',
        description: 'Aquamarine và Moonstone làm dịu tâm trí, giữ sự tĩnh tại, thông suốt trước mọi thử thách.',
        image: 'https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg',
        productCodes: ['AM-AQ001', 'AM-MS042', 'AM-CH001', 'AM-AQ003']
      },
      {
        name: 'Tự tin & Tỏa sáng',
        slug: 'tu-tin-toa-sang',
        tag: 'DŨNG KHÍ & BẢN LĨNH',
        description: 'Citrine thắp sáng nguồn năng lượng thái dương, tiếp thêm dũng khí và sức hút rực rỡ.',
        image: 'https://i.pinimg.com/736x/8b/56/4e/8b564e66f5a26e5a7761873879e15a44.jpg',
        productCodes: ['AM-CT060', 'AM-MS044']
      },
      {
        name: 'May mắn & Cơ hội',
        slug: 'may-man-co-hoi',
        tag: 'TÀI LỘC & VẬN KHÍ',
        description: 'Aventurine xanh ngọc thu hút vượng khí hưng thịnh, mở khóa nhân duyên và cơ hội hanh thông.',
        image: 'https://i.pinimg.com/1200x/d9/7e/2f/d97e2f5138a3f151bb55613e38f15350.jpg',
        productCodes: ['AM-AV061', 'AM-CH003']
      },
      {
        name: 'Chữa lành & Thư giãn',
        slug: 'chua-lanh-thu-gian',
        tag: 'THANH TẨY & AN YÊN',
        description: 'Amethyst tím khói giải tỏa áp lực tâm thức, xoa dịu cảm xúc và mang lại giấc ngủ an lành.',
        image: 'https://i.pinimg.com/1200x/19/ae/48/19ae4807b1c9b47d2cf7ad70fef19fbb.jpg',
        productCodes: ['AM-AM062', 'AM-SQ050']
      },
      {
        name: 'Tình bạn & Gắn kết',
        slug: 'tinh-ban-gan-ket',
        tag: 'TRI KỶ & BỀN VỮNG',
        description: 'Bạc Ý 925 và ngọc bích thiên nhiên, biểu tượng tình bạn son sắt, thắt chặt mối thâm giao.',
        image: 'https://i.pinimg.com/736x/b3/cf/e0/b3cfe07a389a61eaa7b0f186da90da4f.jpg',
        productCodes: ['AM-JD063', 'AM-AQ001']
      },
      {
        name: 'Năng lượng sáng tạo',
        slug: 'nang-luong-sang-tao',
        tag: 'TRỰC GIÁC & CẢM HỨNG',
        description: 'Fluorite khai thông dòng chảy trực giác, giải phóng cảm hứng nghệ thuật và tư duy sáng tạo.',
        image: 'https://i.pinimg.com/736x/f8/c8/db/f8c8dbe300b276861a7e7feb87c9e4fe.jpg',
        productCodes: ['AM-FL064', 'AM-MS010']
      },
      {
        name: 'Quà tặng ý nghĩa',
        slug: 'qua-tang-y-nghia',
        tag: 'TRAO GỬI YÊU THƯƠNG',
        description: 'Hộp quà nhung tinh tế cùng trang sức thủ công mang thông điệp chúc phúc bình an gửi trao.',
        image: 'https://i.pinimg.com/736x/9b/9f/9f/9b9f9f152363271f0c154f437b34def0.jpg',
        productCodes: ['AM-GS065', 'AM-PR030']
      }
    ];
  }
}

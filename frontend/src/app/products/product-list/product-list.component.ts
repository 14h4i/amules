import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, IProduct } from '../../services/product.service';
import { MasterDataService } from '../../services/master-data.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { WishlistService } from '../../services/wishlist.service';

export interface FilterState {
  onlyInStock: boolean;
  category: string;
  element: string;
  gemstone: string;
  priceRange: string;
  material: string;
  search: string;
  sort: string;
}

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: IProduct[] = [];
  allProducts: IProduct[] = [];

  categories = [
    { id: 'nhan', name: 'Nhẫn phong thủy', raw: 'Nhẫn' },
    { id: 'vong-tay', name: 'Vòng tay & Lắc', raw: 'Vòng tay' },
    { id: 'day-chuyen', name: 'Dây chuyền & Mặt đá', raw: 'Dây chuyền' },
    { id: 'bong-tai', name: 'Bông tai thanh tẩy', raw: 'Bông tai' },
    { id: 'charm', name: 'Charm đá năng lượng', raw: 'Charm đá' },
    { id: 'set-qua', name: 'Bộ trang sức tuyển chọn', raw: 'Set quà tặng' }
  ];

  elements = [
    { id: 'Kim', name: 'Mệnh Kim', dot: '#d4af37' },
    { id: 'Moc', name: 'Mệnh Mộc', dot: '#2e7d32' },
    { id: 'Thuy', name: 'Mệnh Thủy', dot: '#1976d2' },
    { id: 'Hoa', name: 'Mệnh Hỏa', dot: '#c2185b' },
    { id: 'Tho', name: 'Mệnh Thổ', dot: '#8d6e63' }
  ];

  gemstonePills = [
    { id: 'moonstone', label: 'Moonstone (Đá Mặt Trăng)', query: 'Moonstone' },
    { id: 'rose_quartz', label: 'Thạch Anh Hồng', query: 'Thạch anh hồng' },
    { id: 'aquamarine', label: 'Aquamarine Hải Lam', query: 'Aquamarine' },
    { id: 'amethyst', label: 'Amethyst Tím Thần', query: 'Amethyst' },
    { id: 'garnet', label: 'Garnet Ngọc Hồng Lựu', query: 'Garnet' },
    { id: 'pearl', label: 'Ngọc Trai Baroque', query: 'Ngọc trai' },
    { id: 'citrine', label: 'Citrine Vàng Thần Tài', query: 'Citrine' },
    { id: 'aventurine', label: 'Aventurine Ngọc Lam', query: 'Aventurine' },
    { id: 'fluorite', label: 'Fluorite Đa Sắc', query: 'Fluorite' }
  ];

  priceRanges = [
    { id: 'all', label: 'Tất cả mức giá' },
    { id: 'under_500', label: 'Dưới 500.000đ', min: 0, max: 499999 },
    { id: '500_1000', label: '500.000đ - 1.000.000đ', min: 500000, max: 1000000 },
    { id: '1000_2000', label: '1.000.000đ - 2.000.000đ', min: 1000000, max: 2000000 },
    { id: 'above_2000', label: 'Trên 2.000.000đ', min: 2000000, max: 99999999 }
  ];

  materialOptions = [
    { id: 'bac_925', label: 'Bạc Ý 925 xi bạch kim cao cấp', query: 'Bạc 925' },
    { id: 'vang_hong', label: 'Mạ vàng hồng Champagne 18K', query: 'Vàng hồng' },
    { id: 'bac_s999', label: 'Bạc nguyên chất kháng khuẩn S999', query: 'S999' },
    { id: 'tibetan', label: 'Dây sợi đan tay phong thủy Tibetan', query: 'Tibetan' }
  ];

  filters: FilterState = {
    onlyInStock: false,
    category: '',
    element: '',
    gemstone: '',
    priceRange: 'all',
    material: '',
    search: '',
    sort: 'newest'
  };

  loading = false;
  addedToast: string | null = null;

  selectCategory(cat: string): void {
    this.filters.category = cat;
    this.fetchProducts();
  }

  constructor(
    private _productService: ProductService,
    private _masterDataService: MasterDataService,
    private _cartService: CartService,
    private _authService: AuthService,
    private _wishlistService: WishlistService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    // Lắng nghe query parameters từ URL
    this._route.queryParams.subscribe(params => {
      const catParam = params['category'] || params['cat'];
      if (catParam) {
        if (catParam === 'rings') this.filters.category = 'Nhẫn';
        else if (catParam === 'bracelets') this.filters.category = 'Vòng tay';
        else if (catParam === 'necklaces') this.filters.category = 'Dây chuyền';
        else if (catParam === 'earrings') this.filters.category = 'Bông tai';
        else if (catParam === 'charms') this.filters.category = 'Charm đá';
        else this.filters.category = catParam;
      }
      if (params['element']) this.filters.element = params['element'];
      if (params['gemstone']) this.filters.gemstone = params['gemstone'];
      if (params['material']) this.filters.material = params['material'];
      if (params['priceRange']) this.filters.priceRange = params['priceRange'];
      if (params['inStock']) this.filters.onlyInStock = params['inStock'] === 'true';
      if (params['search']) this.filters.search = params['search'];
      if (params['sort']) this.filters.sort = params['sort'];
      this.fetchProducts();
    });
  }

  // --- Helpers for Active Filter Chips ---
  get hasActiveFilters(): boolean {
    return (
      this.filters.onlyInStock ||
      !!this.filters.category ||
      !!this.filters.element ||
      !!this.filters.gemstone ||
      !!this.filters.material ||
      (this.filters.priceRange && this.filters.priceRange !== 'all') ||
      !!this.filters.search
    );
  }

  get activeCategoryLabel(): string {
    const found = this.categories.find(c => c.raw === this.filters.category || c.id === this.filters.category);
    return found ? found.name : this.filters.category;
  }

  get activeElementLabel(): string {
    const found = this.elements.find(e => e.id === this.filters.element);
    return found ? found.name : `Mệnh ${this.filters.element}`;
  }

  get activeGemstoneLabel(): string {
    const found = this.gemstonePills.find(g => g.query === this.filters.gemstone || g.id === this.filters.gemstone);
    return found ? found.label : this.filters.gemstone;
  }

  get activePriceLabel(): string {
    const found = this.priceRanges.find(p => p.id === this.filters.priceRange);
    return found ? found.label : this.filters.priceRange;
  }

  get activeMaterialLabel(): string {
    const found = this.materialOptions.find(m => m.query === this.filters.material || m.id === this.filters.material);
    return found ? found.label : this.filters.material;
  }

  // --- Dynamic Counter Helpers ---
  getCategoryCount(catRaw: string): number {
    const norm = catRaw.toLowerCase();
    return this.allProducts.filter(p => {
      const pCat = (p.category || p.categoryName || '').toLowerCase();
      const pName = (p.name || '').toLowerCase();
      if (norm.includes('charm')) {
        return pCat.includes('charm') || pName.includes('charm');
      }
      if (norm.includes('vong') || norm.includes('vòng') || norm.includes('lắc')) {
        return pCat.includes('vòng') || pCat.includes('vong') || pName.includes('vòng') || pName.includes('lắc');
      }
      if (norm.includes('day') || norm.includes('dây')) {
        return pCat.includes('dây') || pCat.includes('day') || pName.includes('dây');
      }
      if (norm.includes('nhan') || norm.includes('nhẫn')) {
        return pCat.includes('nhẫn') || pCat.includes('nhan') || pName.includes('nhẫn');
      }
      if (norm.includes('bong') || norm.includes('bông')) {
        return pCat.includes('bông') || pCat.includes('bong') || pName.includes('bông');
      }
      if (norm.includes('qua') || norm.includes('quà') || norm.includes('set')) {
        return pCat.includes('quà') || pCat.includes('qua') || pCat.includes('set') || pName.includes('set');
      }
      return pCat.includes(norm) || pName.includes(norm);
    }).length;
  }

  getElementCount(elemKey: string): number {
    const norm = elemKey.toLowerCase();
    return this.allProducts.filter(p => {
      const elStr = (p.element || '').toLowerCase();
      const nameStr = (p.name || '').toLowerCase();
      const stoneStr = (p.stone || '').toLowerCase();
      const full = `${elStr} ${nameStr} ${stoneStr}`;
      if (norm === 'kim') return elStr.includes('kim') || full.includes('moonstone') || full.includes('bạc') || full.includes('ngọc trai');
      if (norm === 'moc') return elStr.includes('mộc') || full.includes('ngọc bích') || full.includes('fluorite') || full.includes('aventurine');
      if (norm === 'thuy') return elStr.includes('thủy') || full.includes('aquamarine') || full.includes('hải lam') || full.includes('moonstone');
      if (norm === 'hoa') return elStr.includes('hỏa') || full.includes('thạch anh hồng') || full.includes('amethyst') || full.includes('venus');
      if (norm === 'tho') return elStr.includes('thổ') || full.includes('citrine') || full.includes('thạch anh khói');
      return false;
    }).length;
  }

  // --- Selection Toggles ---
  toggleCategory(catRaw: string): void {
    this.filters.category = (this.filters.category === catRaw) ? '' : catRaw;
    this.fetchProducts();
  }

  toggleElement(elemId: string): void {
    this.filters.element = (this.filters.element === elemId) ? '' : elemId;
    this.fetchProducts();
  }

  toggleGemstone(gemQuery: string): void {
    this.filters.gemstone = (this.filters.gemstone === gemQuery) ? '' : gemQuery;
    this.fetchProducts();
  }

  toggleMaterial(matQuery: string): void {
    this.filters.material = (this.filters.material === matQuery) ? '' : matQuery;
    this.fetchProducts();
  }

  setPriceRange(rangeId: string): void {
    this.filters.priceRange = rangeId;
    this.fetchProducts();
  }

  // --- Dismiss Actions for Active Chips ---
  removeCategory(): void {
    this.filters.category = '';
    this.fetchProducts();
  }

  removeElement(): void {
    this.filters.element = '';
    this.fetchProducts();
  }

  removeGemstone(): void {
    this.filters.gemstone = '';
    this.fetchProducts();
  }

  removePrice(): void {
    this.filters.priceRange = 'all';
    this.fetchProducts();
  }

  removeMaterial(): void {
    this.filters.material = '';
    this.fetchProducts();
  }

  removeInStock(): void {
    this.filters.onlyInStock = false;
    this.fetchProducts();
  }

  removeSearch(): void {
    this.filters.search = '';
    this.fetchProducts();
  }

  resetFilters(): void {
    this.filters = {
      onlyInStock: false,
      category: '',
      element: '',
      gemstone: '',
      priceRange: 'all',
      material: '',
      search: '',
      sort: 'newest'
    };
    this.fetchProducts();
  }

  onFilterChange(): void {
    this.fetchProducts();
  }

  formatElement(el?: string): string {
    if (!el) return '';
    const parts = el.split(/&|\+|,|\bvà\b/i)
      .map(p => p.replace(/mệnh/gi, '').trim())
      .filter(Boolean);
    const unique = [...new Set(parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()))];
    if (unique.length === 0) return el;
    return unique.map(m => `Mệnh ${m}`).join(' & ');
  }

  normalizeProductImage(p: IProduct): string {
    if (p.image && p.image.startsWith('http') && p.image !== 'https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg') {
      return p.image;
    }
    const name = `${p.name || ''} ${p.slug || ''}`.toLowerCase();
    if (name.includes('nhẫn') || name.includes('nhan') || name.includes('venus') || name.includes('ring')) {
      return 'https://i.pinimg.com/736x/47/9c/df/479cdf269b5b50948b8aef6103b475ed.jpg';
    }
    if (name.includes('dây chuyền') || name.includes('day-chuyen') || name.includes('merlia')) {
      return 'https://i.pinimg.com/1200x/5e/19/ca/5e19cae249717d1321564c81f14a1732.jpg';
    }
    if (name.includes('bông tai') || name.includes('bong-tai') || name.includes('baroque')) {
      return 'https://i.pinimg.com/736x/82/af/ce/82afce704fa0702179286be2a3d293d7.jpg';
    }
    if (p.image && p.image.startsWith('http')) return p.image;
    if (p.images && p.images.length > 0 && p.images[0].startsWith('http')) return p.images[0];
    return 'https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg';
  }

  // Bộ lọc tức thời (0ms latency) - Áp dụng chính xác quy luật lọc và sắp xếp
  filterLocalProducts(pool: IProduct[], f: FilterState): IProduct[] {
    let list = [...pool];

    // 1. Chỉ hiện còn hàng
    if (f.onlyInStock) {
      list = list.filter(p => (p.stock !== undefined ? p.stock > 0 : true));
    }

    // 2. Lọc theo danh mục
    if (f.category) {
      const cNorm = f.category.toLowerCase().trim();
      list = list.filter(p => {
        const pCat = (p.category || p.categoryName || '').toLowerCase();
        const pName = (p.name || '').toLowerCase();
        if (cNorm.includes('vong') || cNorm.includes('lắc') || cNorm.includes('vòng')) {
          return pCat.includes('vòng') || pCat.includes('vong') || pName.includes('vòng') || pName.includes('lắc');
        }
        if (cNorm.includes('day') || cNorm.includes('dây')) {
          return pCat.includes('dây') || pCat.includes('day') || pName.includes('dây');
        }
        if (cNorm.includes('nhan') || cNorm.includes('nhẫn')) {
          return pCat.includes('nhẫn') || pCat.includes('nhan') || pName.includes('nhẫn');
        }
        if (cNorm.includes('bong') || cNorm.includes('bông')) {
          return pCat.includes('bông') || pCat.includes('bong') || pName.includes('bông');
        }
        if (cNorm.includes('charm')) {
          return pCat.includes('charm') || pName.includes('charm');
        }
        if (cNorm.includes('qua') || cNorm.includes('quà') || cNorm.includes('set')) {
          return pCat.includes('quà') || pCat.includes('qua') || pCat.includes('set') || pName.includes('set');
        }
        return pCat.includes(cNorm) || pName.includes(cNorm);
      });
    }

    // 3. Lọc theo Mệnh ngũ hành (Kim, Mộc, Thủy, Hỏa, Thổ)
    if (f.element) {
      const eNorm = f.element.toLowerCase().replace('mệnh', '').trim();
      list = list.filter(p => {
        const elemStr = (p.element || '').toLowerCase();
        const stoneStr = (p.stone || p.material || '').toLowerCase();
        const nameStr = (p.name || '').toLowerCase();
        const full = `${elemStr} ${stoneStr} ${nameStr}`;

        if (eNorm === 'kim') {
          return elemStr.includes('kim') || full.includes('kim') || full.includes('moonstone') || full.includes('ngọc trai') || full.includes('bạc');
        }
        if (eNorm === 'moc') {
          return elemStr.includes('mộc') || full.includes('mộc') || full.includes('ngọc bích') || full.includes('fluorite') || full.includes('aventurine');
        }
        if (eNorm === 'thuy') {
          return elemStr.includes('thủy') || full.includes('thủy') || full.includes('aquamarine') || full.includes('hải lam') || full.includes('moonstone');
        }
        if (eNorm === 'hoa') {
          return elemStr.includes('hỏa') || full.includes('hỏa') || full.includes('venus') || full.includes('thạch anh hồng') || full.includes('amethyst');
        }
        if (eNorm === 'tho') {
          return elemStr.includes('thổ') || full.includes('thổ') || full.includes('citrine') || full.includes('thạch anh khói');
        }
        return true;
      });
    }

    // 4. Lọc theo Loại đá quý
    if (f.gemstone) {
      const gNorm = f.gemstone.toLowerCase().trim();
      list = list.filter(p => {
        const stoneStr = (p.stone || '').toLowerCase();
        const nameStr = (p.name || '').toLowerCase();
        const descStr = (p.description || '').toLowerCase();
        return stoneStr.includes(gNorm) || nameStr.includes(gNorm) || descStr.includes(gNorm);
      });
    }

    // 5. Lọc theo Chất liệu kim hoàn
    if (f.material) {
      const mNorm = f.material.toLowerCase().trim();
      list = list.filter(p => (p.material || '').toLowerCase().includes(mNorm));
    }

    // 6. Lọc theo Khoảng giá
    const pr = this.priceRanges.find(p => p.id === f.priceRange);
    if (pr && pr.id !== 'all') {
      list = list.filter(p => {
        const price = Number(p.price || 0);
        return price >= (pr.min ?? 0) && price <= (pr.max ?? Infinity);
      });
    }

    // 7. Lọc theo Từ khóa tìm kiếm
    if (f.search && f.search.trim()) {
      const s = f.search.trim().toLowerCase();
      list = list.filter(p =>
        (p.name || '').toLowerCase().includes(s) ||
        (p.stone || '').toLowerCase().includes(s) ||
        (p.description || '').toLowerCase().includes(s) ||
        (p.productCode || p.code || '').toLowerCase().includes(s)
      );
    }

    // 8. Sắp xếp chặt chẽ theo lựa chọn
    if (f.sort === 'price_asc') {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (f.sort === 'price_desc') {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (f.sort === 'rating') {
      list.sort((a, b) => Number(b.ratingAverage || 0) - Number(a.ratingAverage || 0));
    } else if (f.sort === 'popular') {
      list.sort((a, b) => (parseInt(String(b.sold || '0')) || 0) - (parseInt(String(a.sold || '0')) || 0));
    } else if (f.sort === 'featured') {
      list.sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0));
    }

    return list.map(p => ({
      ...p,
      image: this.normalizeProductImage(p)
    }));
  }

  fetchProducts(): void {
    const query: any = {};
    if (this.filters.category) query.category = this.filters.category;
    if (this.filters.element) query.element = this.filters.element;
    if (this.filters.gemstone) query.gemstone = this.filters.gemstone;
    if (this.filters.material) query.material = this.filters.material;
    if (this.filters.onlyInStock) query.inStock = true;
    if (this.filters.search) query.search = this.filters.search;
    if (this.filters.sort) query.sort = this.filters.sort;

    const pr = this.priceRanges.find(p => p.id === this.filters.priceRange);
    if (pr && pr.id !== 'all') {
      if (pr.min !== undefined) query.minPrice = pr.min;
      if (pr.max !== undefined) query.maxPrice = pr.max;
    }

    // Bước 1: Lọc trên allProducts hoặc cache của ProductService
    const pool = (this.allProducts && this.allProducts.length > 0)
      ? this.allProducts
      : this._productService.products();

    if (this.allProducts.length === 0 && pool.length > 0) {
      this.allProducts = pool;
    }

    this.products = this.filterLocalProducts(pool, this.filters);
    this.loading = false;

    // Bước 2: Đồng bộ ngầm với backend API mà không làm giật lag giao diện
    this._productService.getProducts(query).subscribe({
      next: (items) => {
        if (items && Array.isArray(items) && items.length > 0) {
          if (!this.hasActiveFilters) {
            this.allProducts = items;
          }
          // Luôn áp dụng filterLocalProducts để bảo toàn triệt để sắp xếp và bộ lọc
          this.products = this.filterLocalProducts(items, this.filters);
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  addToCart(product: IProduct, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this._cartService.addToCart({
      productId: product.id || product._id || product.slug || '',
      name: product.name,
      price: product.price,
      originalPrice: product.compareAtPrice || product.price,
      image: product.image || 'https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg',
      quantity: 1,
      stone: product.stone || 'Đá tự nhiên',
      size: (product.sizes && product.sizes[0]) || '15 cm'
    }).subscribe({
      next: () => {
        this.addedToast = `Đã thêm "${product.name}" vào giỏ hàng!`;
        setTimeout(() => (this.addedToast = null), 3000);
      }
    });
  }

  toggleLike(product: IProduct, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    if (!this._authService.isLoggedIn()) {
      this._router.navigate(['/login'], { queryParams: { returnUrl: '/account/wishlist' } });
      return;
    }
    const added = this._wishlistService.toggleItem(product);
    product.liked = added;
    this.addedToast = added ? `Đã thêm "${product.name}" vào yêu thích!` : `Đã bỏ yêu thích "${product.name}"`;
    setTimeout(() => (this.addedToast = null), 2500);
  }
}

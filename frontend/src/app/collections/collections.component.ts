import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MasterDataService, ICollection } from '../services/master-data.service';
import { ProductService, IProduct } from '../services/product.service';

@Component({
  selector: 'app-collections',
  standalone: false,
  templateUrl: './collections.component.html',
  styleUrl: './collections.component.css'
})
export class CollectionsComponent implements OnInit {
  collections: ICollection[] = this.getFallbackCollections();
  featuredProducts: IProduct[] = [];
  allProducts: IProduct[] = [];
  selectedCollection: ICollection | null = this.getFallbackCollections()[0];

  constructor(
    private _route: ActivatedRoute,
    private _masterDataService: MasterDataService,
    private _productService: ProductService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    let routeSlug = '';
    this._route.params.subscribe(params => {
      routeSlug = (params['slug'] || '').toLowerCase();
      if (routeSlug && this.collections.length > 0) {
        const found = this.collections.find(c =>
          (c.slug && c.slug.toLowerCase() === routeSlug) ||
          c.name.toLowerCase().includes(routeSlug) ||
          routeSlug.includes(c.name.toLowerCase())
        );
        if (found) {
          this.selectedCollection = found;
          this.filterProductsForCollection();
        }
      }
    });

    // 1. Nạp danh sách bộ sưu tập từ MongoDB API
    this._masterDataService.getCollections().subscribe({
      next: (list) => {
        if (list && list.length > 0) {
          this.collections = list.map(c => ({
            name: c.name,
            tag: c.tag || ((c.slug || '').includes('moon') ? 'Thiên thể & Chiêm tinh' : (c.slug || '').includes('mystic') ? 'Cổ điển & Huyền bí' : 'Dịu dàng & Lãng mạn'),
            desc: c.desc || (c as any).description || 'Bộ sưu tập trang sức phong thủy độc bản chế tác thủ công từ đá quý thiên nhiên.',
            image: c.image || (c as any).coverImage || 'https://i.pinimg.com/736x/8b/56/4e/8b564e66f5a26e5a7761873879e15a44.jpg',
            slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          }));

          if (routeSlug) {
            const found = this.collections.find(c =>
              (c.slug && c.slug.toLowerCase() === routeSlug) ||
              c.name.toLowerCase().includes(routeSlug) ||
              routeSlug.includes(c.name.toLowerCase())
            );
            if (found) this.selectedCollection = found;
            else this.selectedCollection = this.collections[0];
          } else {
            this.selectedCollection = this.collections[0];
          }
          this.filterProductsForCollection();
          this._cdr.detectChanges();
        }
      },
      error: () => {
        // Fallback đã được gán sẵn lúc khởi tạo
      }
    });

    // 2. Nạp sản phẩm thật từ MongoDB API
    this._productService.getProducts().subscribe({
      next: (products) => {
        this.allProducts = products || [];
        this.filterProductsForCollection();
        this._cdr.detectChanges();
      },
      error: () => {}
    });
  }

  selectCollection(col: ICollection): void {
    this.selectedCollection = col;
    this.filterProductsForCollection();
  }

  private filterProductsForCollection(): void {
    if (!this.selectedCollection || this.allProducts.length === 0) {
      this.featuredProducts = this.allProducts.slice(0, 6);
      return;
    }
    const name = (this.selectedCollection.name || '').toLowerCase();
    let filtered = this.allProducts.filter(p => {
      const pName = (p.name || '').toLowerCase();
      const pStone = (p.stone || '').toLowerCase();
      if (name.includes('moon') || name.includes('sao') || name.includes('tinh tú')) {
        return pName.includes('moonstone') || pName.includes('tinh tú') || pStone.includes('moonstone');
      }
      if (name.includes('muse') || name.includes('nàng thơ')) {
        return pName.includes('merlia') || pName.includes('hơi thở') || pName.includes('baroque');
      }
      return true;
    });

    if (filtered.length === 0) {
      filtered = this.allProducts;
    }
    this.featuredProducts = filtered.slice(0, 6);
  }

  private getFallbackCollections(): ICollection[] {
    return [
      {
        name: 'Mystical Vintage',
        tag: 'Cổ điển & Huyền bí',
        desc: 'Dấu ấn hoàng gia phương Tây kết hợp chiều sâu chiêm nghiệm phương Đông, dành cho người yêu nét đẹp hoài niệm vĩnh cửu.',
        image: 'https://i.pinimg.com/736x/8b/56/4e/8b564e66f5a26e5a7761873879e15a44.jpg'
      },
      {
        name: 'Moon & Stars',
        tag: 'Thiên thể & Chiêm tinh',
        desc: 'Cảm hứng chu kỳ trăng tròn và 12 chòm sao dẫn lối, tượng trưng cho trực giác nhạy bén và nguồn ánh sáng soi rọi bóng đêm.',
        image: 'https://i.pinimg.com/736x/8b/56/4e/8b564e66f5a26e5a7761873879e15a44.jpg'
      },
      {
        name: 'Nàng Thơ (The Muse)',
        tag: 'Dịu dàng & Lãng mạn',
        desc: 'Vẻ đẹp tinh tế của ngọc trai tự nhiên và đá Moonstone, đánh thức trọn vẹn sự dịu dàng và lòng trắc ẩn của tâm hồn.',
        image: 'https://i.pinimg.com/736x/8b/56/4e/8b564e66f5a26e5a7761873879e15a44.jpg'
      }
    ];
  }
}

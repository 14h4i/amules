import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MasterDataService, ICollection } from '../services/master-data.service';
import { ProductService, IProduct } from '../services/product.service';

const FALLBACK_COLLECTIONS: any[] = [
  {
    _id: "6802277ac81512ae86f3cf06",
    name: "Mystical Vintage",
    slug: "mystical-vintage",
    desc: "Phong cách cổ điển huyền bí với nét chạm khắc gothic và đá thạch anh tự nhiên.",
    image: "https://i.pinimg.com/736x/d2/c1/cd/d2c1cd50bee4cf66b8a095b253a55beb.jpg",
    coverImage: "https://i.pinimg.com/736x/d2/c1/cd/d2c1cd50bee4cf66b8a095b253a55beb.jpg",
    tag: "Cổ điển & Huyền bí"
  },
  {
    _id: "0450d63abbb045d94b39c028",
    name: "Moon & Stars",
    slug: "moon-and-stars",
    desc: "Bộ sưu tập lấy cảm hứng từ vầng trăng rằm và chòm sao hộ mệnh, kết tinh từ Moonstone và ngọc trai.",
    image: "https://i.pinimg.com/736x/53/a4/0f/53a40fcf65d77d5dcc8a9efcb531ac32.jpg",
    coverImage: "https://i.pinimg.com/736x/53/a4/0f/53a40fcf65d77d5dcc8a9efcb531ac32.jpg",
    tag: "Thiên thể & Chiêm tinh"
  },
  {
    _id: "1672b26122c713603ba39420",
    name: "Nàng Thơ (The Muse)",
    slug: "nang-tho",
    desc: "Vẻ đẹp thuần khiết, dịu êm của những nàng thơ qua lăng kính đá quý tự nhiên đa sắc.",
    image: "https://i.pinimg.com/736x/88/cc/a9/88cca9873ac223970e511970e84f478d.jpg",
    coverImage: "https://i.pinimg.com/736x/88/cc/a9/88cca9873ac223970e511970e84f478d.jpg",
    tag: "Dịu dàng & Lãng mạn"
  }
];

@Component({
  selector: 'app-collections',
  standalone: false,
  templateUrl: './collections.component.html',
  styleUrl: './collections.component.css'
})
export class CollectionsComponent implements OnInit {
  collections: any[] = FALLBACK_COLLECTIONS;
  featuredProducts: IProduct[] = [];
  allProducts: IProduct[] = [];
  selectedCollection: any = FALLBACK_COLLECTIONS[0];
  private _routeSlug = '';

  constructor(
    private _route: ActivatedRoute,
    private _masterDataService: MasterDataService,
    private _productService: ProductService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      this._routeSlug = (params['slug'] || '').toLowerCase();
      this.syncSelectedCollection();
      this.filterProductsForCollection();
      this._cdr.detectChanges();
    });

    // 1. Nạp danh sách bộ sưu tập trực tiếp từ MongoDB CSDL
    this._masterDataService.getCollections().subscribe({
      next: (list) => {
        if (list && list.length > 0) {
          this.collections = list.map(c => ({
            name: c.name,
            tag: c.tag || ((c.slug || '').includes('moon') ? 'Thiên thể & Chiêm tinh' : (c.slug || '').includes('mystic') ? 'Cổ điển & Huyền bí' : 'Dịu dàng & Lãng mạn'),
            desc: c.desc || (c as any).description || 'Bộ sưu tập trang sức phong thủy AMULES.',
            image: c.image || (c as any).coverImage || 'https://i.pinimg.com/736x/d2/c1/cd/d2c1cd50bee4cf66b8a095b253a55beb.jpg',
            slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          }));
        } else if (!this.collections || this.collections.length === 0) {
          this.collections = FALLBACK_COLLECTIONS;
        }
        this.syncSelectedCollection();
        this.filterProductsForCollection();
        this._cdr.detectChanges();
      },
      error: () => {
        if (!this.collections || this.collections.length === 0) {
          this.collections = FALLBACK_COLLECTIONS;
        }
        this.syncSelectedCollection();
        this.filterProductsForCollection();
        this._cdr.detectChanges();
      }
    });

    // 2. Nạp sản phẩm thật từ MongoDB API
    this._productService.getProducts().subscribe({
      next: (products) => {
        if (products && products.length > 0) {
          this.allProducts = products;
        }
        this.filterProductsForCollection();
        this._cdr.detectChanges();
      },
      error: () => {
        this._cdr.detectChanges();
      }
    });
  }

  private syncSelectedCollection(): void {
    if (this._routeSlug && this.collections.length > 0) {
      const found = this.collections.find(c =>
        (c.slug && c.slug.toLowerCase() === this._routeSlug) ||
        c.name.toLowerCase().includes(this._routeSlug) ||
        this._routeSlug.includes(c.name.toLowerCase())
      );
      if (found) {
        this.selectedCollection = found;
        return;
      }
    }
    if (!this.selectedCollection && this.collections.length > 0) {
      this.selectedCollection = this.collections[0];
    }
  }

  selectCollection(col: any): void {
    this.selectedCollection = col;
    this.filterProductsForCollection();
    this._cdr.detectChanges();
  }

  private filterProductsForCollection(): void {
    if (!this.selectedCollection || this.allProducts.length === 0) {
      this.featuredProducts = this.allProducts.slice(0, 6);
      return;
    }

    const name = (this.selectedCollection.name || '').toLowerCase();
    const slug = (this.selectedCollection.slug || '').toLowerCase();

    let filtered = this.allProducts.filter(p => {
      const pName = (p.name || '').toLowerCase();
      const pStone = (p.stone || '').toLowerCase();
      const pCol = ((p as any).collection || '').toLowerCase();

      if (slug.includes('moon') || name.includes('moon') || name.includes('sao') || name.includes('tinh tú')) {
        return pName.includes('moonstone') || pName.includes('tinh tú') || pStone.includes('moonstone') || pCol.includes('moon') || pName.includes('celestial');
      }
      if (slug.includes('muse') || name.includes('muse') || name.includes('nàng thơ')) {
        return pName.includes('merlia') || pName.includes('hơi thở') || pName.includes('baroque') || pName.includes('venus') || pCol.includes('muse');
      }
      if (slug.includes('mystic') || name.includes('mystic') || name.includes('vintage') || name.includes('cổ điển')) {
        return pName.includes('amethyst') || pName.includes('khói') || pName.includes('bảo tháp') || pName.includes('kim tự tháp') || pCol.includes('mystic');
      }
      return true;
    });

    if (filtered.length === 0) {
      filtered = this.allProducts;
    }
    this.featuredProducts = filtered.slice(0, 8);
  }
}

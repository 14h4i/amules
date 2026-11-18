import { Component, OnInit } from '@angular/core';
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
  collections: ICollection[] = [];
  featuredProducts: IProduct[] = [];
  allProducts: IProduct[] = [];
  selectedCollection: ICollection | null = null;

  constructor(
    private _route: ActivatedRoute,
    private _masterDataService: MasterDataService,
    private _productService: ProductService
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

    // 1. Nạp danh sách bộ sưu tập trực tiếp từ MongoDB CSDL
    this._masterDataService.getCollections().subscribe({
      next: (list) => {
        if (list && list.length > 0) {
          this.collections = list.map(c => ({
            name: c.name,
            tag: c.tag || '',
            desc: c.desc || (c as any).description || '',
            image: c.image || (c as any).coverImage || '',
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
        }
      }
    });

    // 2. Nạp sản phẩm thật từ MongoDB API
    this._productService.getProducts().subscribe({
      next: (products) => {
        this.allProducts = products || [];
        this.filterProductsForCollection();
      }
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
}

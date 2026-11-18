import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProductService, IProduct } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  product: IProduct | null = null;
  relatedProducts: IProduct[] = [];
  selectedImageIndex = 0;
  selectedSize = '15 cm';
  quantity = 1;
  loading = true;
  addedToast: string | null = null;
  activeTab: 'desc' | 'energy' | 'reviews' = 'desc';

  reviews = [
    {
      author: 'Lan Anh (Song Ngư)',
      date: '10/11/2026',
      rating: 5,
      content: 'Bảo vật đẹp hơn mong đợi rất nhiều! Viên đá tỏa ra năng lượng rất bình yên, mình đeo khi thiền định cảm thấy tâm trí nhẹ nhõm hẳn. Đóng gói hộp nhung tím cực kỳ trang trọng.',
      verified: true
    },
    {
      author: 'Minh Thảo (Bảo Bình)',
      date: '28/10/2026',
      rating: 5,
      content: 'Giao hàng rất nhanh, có kèm giấy kiểm định đá quý tự nhiên 100%. Rất an tâm và chắc chắn sẽ ủng hộ thêm các tạo tác khác của AMULES.',
      verified: true
    }
  ];

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _productService: ProductService,
    private _cartService: CartService,
    private _http: HttpClient
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadProduct(slug);
      }
    });
  }

  loadProduct(slugOrId: string): void {
    const cleanSlug = (slugOrId === 'san-pham' || !slugOrId) ? 'lac-tay-hoi-tho-bien-xanh' : slugOrId;
    this.loading = true;

    // 1. Kiểm tra cache trong ProductService
    const cached = this._productService.products().find(p => p.slug === cleanSlug || p.id === cleanSlug || p._id === cleanSlug);
    if (cached) {
      this.product = { ...cached, images: this.filterProductImages(cached) };
      if (cached.sizes && cached.sizes.length > 0) {
        this.selectedSize = cached.sizes[0];
      }
      this.selectedImageIndex = 0;
      this.loading = false;
      this.loadRelatedProducts(cached);
      this.loadReviews(cached);
      return;
    }

    // 2. Nạp dữ liệu sản phẩm trực tiếp từ MongoDB CSDL
    this._productService.getProductBySlug(cleanSlug).subscribe({
      next: (item) => {
        if (item) {
          this.product = { ...item, images: this.filterProductImages(item) };
          if (item.sizes && item.sizes.length > 0 && !this.selectedSize) {
            this.selectedSize = item.sizes[0];
          }
          this.selectedImageIndex = 0;
          this.loadRelatedProducts(item);
          this.loadReviews(item);
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadReviews(product: IProduct): void {
    const pId = String(product._id || product.id || '');
    const pName = String(product.name || '').toLowerCase();
    this._http.get<any[]>('/api/reviews').subscribe({
      next: (list) => {
        if (list && Array.isArray(list)) {
          const matched = list.filter(r => {
            const rPid = String(r.productId?.$oid || r.productId || '');
            const rPname = String(r.productName || '').toLowerCase();
            return (pId && rPid === pId) || (rPname && pName && (rPname.includes(pName) || pName.includes(rPname)));
          });
          if (matched.length > 0) {
            this.reviews = matched.map(m => ({
              author: m.author || m.userName || 'Khách hàng AMULES',
              date: m.date || (m.createdAt ? new Date(m.createdAt).toLocaleDateString('vi-VN') : '10/11/2026'),
              rating: Number(m.rating || m.stars || 5),
              content: m.content || m.comment || m.quote || '',
              verified: true
            }));
            if (this.product) {
              this.product.reviewCount = this.reviews.length;
              const totalRating = this.reviews.reduce((acc, r) => acc + r.rating, 0);
              this.product.ratingAverage = Number((totalRating / this.reviews.length).toFixed(1));
            }
          }
        }
      },
      error: () => {}
    });
  }

  filterProductImages(product: IProduct): string[] {
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    return product.image ? [product.image] : [];
  }

  loadRelatedProducts(current: IProduct): void {
    this._productService.getProducts().subscribe({
      next: (list) => {
        this.relatedProducts = (list || [])
          .filter(p => (p.slug !== current.slug && p.id !== current.id))
          .slice(0, 4);
      },
      error: () => {}
    });
  }

  selectImage(idx: number): void {
    this.selectedImageIndex = idx;
  }

  onImageError(event: any): void {
    if (event && event.target && this.product?.image) {
      event.target.src = this.product.image;
    }
  }

  changeQuantity(delta: number): void {
    const next = this.quantity + delta;
    if (next >= 1 && next <= (this.product?.stock || 99)) {
      this.quantity = next;
    }
  }

  addToCart(): void {
    if (!this.product) return;
    this._cartService.addToCart({
      productId: this.product.id || this.product._id || this.product.slug || '',
      name: this.product.name,
      price: this.product.price,
      originalPrice: this.product.compareAtPrice || this.product.price,
      image: (this.product.images && this.product.images[0]) || this.product.image || '',
      quantity: this.quantity,
      stone: this.product.stone || 'Đá tự nhiên',
      size: this.selectedSize,
      element: this.product.element
    }).subscribe({
      next: () => {
        this.addedToast = `Đã thêm ${this.quantity} bảo vật vào giỏ hàng!`;
        setTimeout(() => (this.addedToast = null), 3500);
      }
    });
  }

  buyNow(): void {
    this.addToCart();
    this._router.navigate(['/cart']);
  }
}

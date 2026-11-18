import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProductService, IProduct } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { INITIAL_PRODUCTS } from '../../data/initial-products';

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

    // 1. Kiểm tra cache trong ProductService để render ngay lập tức (0ms latency)
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

    // 2. Hiển thị tức thì từ dữ liệu nền để không bao giờ bị treo màn hình chờ
    const prefill = this.getFallbackProduct(cleanSlug);
    if (prefill) {
      this.product = { ...prefill, images: this.filterProductImages(prefill) };
      if (prefill.sizes && prefill.sizes.length > 0 && !this.selectedSize) {
        this.selectedSize = prefill.sizes[0];
      }
      this.loading = false;
      this.loadReviews(prefill);
    }

    this._productService.getProductBySlug(cleanSlug).subscribe({
      next: (item) => {
        this.product = { ...item, images: this.filterProductImages(item) };
        if (item.sizes && item.sizes.length > 0 && !this.selectedSize) {
          this.selectedSize = item.sizes[0];
        }
        this.selectedImageIndex = 0;
        this.loading = false;
        this.loadRelatedProducts(item);
        this.loadReviews(item);
      },
      error: () => {
        if (!this.product) {
          const fb = this.getFallbackProduct(cleanSlug);
          this.product = { ...fb, images: this.filterProductImages(fb) };
          this.loadReviews(fb);
        }
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
    const mainImg = product.image || 'images/lac_tay_bien.png';
    const name = `${product.name || ''} ${product.slug || ''}`.toLowerCase();

    // Lắc tay / Vòng tay: TUYỆT ĐỐI không chứa dây chuyền (dch), nhẫn (nhan), bông tai (bong_tai)
    if (name.includes('lắc tay') || name.includes('lac-tay') || name.includes('vòng tay') || name.includes('vong-tay') || name.includes('hơi thở biển')) {
      const allowed = (product.images || []).filter(img =>
        !img.includes('dch') && !img.includes('nhan') && !img.includes('bong_tai') &&
        !img.includes('merlia') && !img.includes('venus') && !img.includes('baroque')
      );
      const unique = [mainImg, ...allowed.filter(img => img !== mainImg)];
      return unique.filter(img => !img.includes('dch') && !img.includes('nhan'));
    }

    // Dây chuyền: Không chứa lắc tay, nhẫn, bông tai
    if (name.includes('dây chuyền') || name.includes('day-chuyen') || name.includes('merlia')) {
      const allowed = (product.images || []).filter(img =>
        !img.includes('lac_tay') && !img.includes('vong_tay') && !img.includes('nhan') && !img.includes('bong_tai')
      );
      return [mainImg, ...allowed.filter(img => img !== mainImg)];
    }

    // Nhẫn: Không chứa lắc tay, dây chuyền, bông tai
    if (name.includes('nhẫn') || name.includes('nhan') || name.includes('venus')) {
      const allowed = (product.images || []).filter(img =>
        !img.includes('lac_tay') && !img.includes('vong_tay') && !img.includes('dch') && !img.includes('bong_tai')
      );
      return [mainImg, ...allowed.filter(img => img !== mainImg)];
    }

    // Bông tai: Không chứa lắc tay, dây chuyền, nhẫn
    if (name.includes('bông tai') || name.includes('bong-tai') || name.includes('baroque')) {
      const allowed = (product.images || []).filter(img =>
        !img.includes('lac_tay') && !img.includes('vong_tay') && !img.includes('dch') && !img.includes('nhan')
      );
      return [mainImg, ...allowed.filter(img => img !== mainImg)];
    }

    // Charm đá: Chỉ dùng hình ảnh Charm đá, không chứa lắc tay, dây chuyền, nhẫn, bông tai
    if (name.includes('charm')) {
      const allowed = (product.images || []).filter(img =>
        !img.includes('lac_tay') && !img.includes('vong_tay') && !img.includes('dch') && !img.includes('nhan') && !img.includes('bong_tai')
      );
      return [mainImg, ...allowed.filter(img => img !== mainImg)];
    }

    return (product.images && product.images.length > 0) ? product.images : [mainImg];
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
    if (event && event.target) {
      event.target.src = this.product?.image || 'images/lac_tay_bien.png';
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
      image: (this.product.images && this.product.images[0]) || this.product.image || 'images/lac_tay_bien.png',
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

  private getFallbackProduct(slug: string): IProduct {
    const fromInitial = INITIAL_PRODUCTS.find(p => p.slug === slug || p.id === slug || p._id === slug || p.productCode === slug);
    if (fromInitial) {
      return fromInitial;
    }

    const fallbackCatalog: Record<string, Partial<IProduct>> = {
      'lac-tay-hoi-tho-bien-xanh': {
        name: 'Lắc tay Hơi Thở Biển Xanh',
        productCode: 'AM-AQ001',
        price: 590000,
        compareAtPrice: 650000,
        stone: 'Aquamarine Tự Nhiên & Bạc 925',
        element: 'Mệnh Thủy & Mộc',
        image: 'images/lac_tay_bien.png',
        images: ['images/lac_tay_bien.png'],
        description: 'Chuỗi hạt Aquamarine giác cắt kết hợp bạc 925, mang cảm giác bình an, nuôi dưỡng trực giác và tĩnh tâm thiền định.',
        ratingAverage: 5.0,
        reviewCount: 2
      },
      'day-chuyen-bac-nu-mix-da-merlia': {
        name: 'Dây chuyền Bạc Nữ Mix Đá Merlia',
        productCode: 'AM-NL002',
        price: 650000,
        compareAtPrice: 720000,
        stone: 'Moonstone Nữ Thần & Bạc 925',
        element: 'Mệnh Kim & Thủy',
        image: 'images/dch_mix_da.png',
        images: ['images/dch_mix_da.png', 'images/bst_dch.png'],
        description: 'Thiết kế dây chuyền dáng thanh mảnh đính kết Moonstone tự nhiên, phản quang ánh xanh lam huyền bí dưới ánh trăng.'
      },
      'nhan-tinh-tu-venus': {
        name: 'Nhẫn Tinh Tú Venus',
        productCode: 'AM-RG003',
        price: 450000,
        compareAtPrice: 500000,
        stone: 'Thạch anh hồng tự nhiên & Bạc 925',
        element: 'Mệnh Hỏa & Thổ',
        image: 'images/nhan_tinh_tu.png',
        images: ['images/nhan_tinh_tu.png', 'images/bst_nhan_lg.png'],
        description: 'Nhẫn biểu tượng vì sao Kim tinh, thu hút năng lượng tình duyên, sự ấm áp và kết nối thiện lành cho chủ nhân.'
      },
      'bong-tai-sao-bac-baroque': {
        name: 'Bông tai Sao Bạc & Baroque',
        productCode: 'AM-ER004',
        price: 520000,
        compareAtPrice: 580000,
        stone: 'Ngọc trai Baroque & Bạc 925',
        element: 'Mệnh Kim & Thủy',
        image: 'images/bong_tai.png',
        images: ['images/bong_tai.png'],
        description: 'Bông tai ngọc trai Baroque tự nhiên độc bản kết hợp charm sao bạc, mang nét đẹp cổ điển kiêu sa.'
      },
      'charm-bac-dinh-da-moonstone-anh-trang-khuyet': {
        name: 'Charm Bạc Đính Đá Moonstone Ánh Trăng Khuyết',
        productCode: 'AM-CH001',
        price: 280000,
        compareAtPrice: 350000,
        stone: 'Moonstone Tự Nhiên & Bạc Ý S925',
        element: 'Mệnh Kim & Thủy',
        image: 'images/bst_da.webp',
        images: ['images/bst_da.webp'],
        description: 'Charm bạc chế tác tinh xảo hình trăng khuyết ôm trọn viên đá Moonstone tự nhiên phát quang ánh xanh dịu dàng. Giúp thanh lọc tâm trí, cân bằng cảm xúc và thu hút may mắn.'
      },
      'charm-trai-tim-thach-anh-hong-venus': {
        name: 'Charm Trái Tim Thạch Anh Hồng Venus',
        productCode: 'AM-CH002',
        price: 250000,
        compareAtPrice: 320000,
        stone: 'Thạch anh hồng Rose Quartz & Bạc Ý S925',
        element: 'Mệnh Hỏa & Thổ',
        image: 'images/bst_da.webp',
        images: ['images/bst_da.webp'],
        description: 'Viên charm trái tim thạch anh hồng tượng trưng cho tình yêu thuần khiết, năng lượng chữa lành và sự dịu dàng của nữ thần Venus.'
      },
      'charm-co-bon-canh-da-aquamarine-may-man': {
        name: 'Charm Cỏ Bốn Cánh Đá Aquamarine May Mắn',
        productCode: 'AM-CH003',
        price: 290000,
        compareAtPrice: 360000,
        stone: 'Ngọc Hải Lam Aquamarine & Bạc Ý S925',
        element: 'Mệnh Thủy & Mộc',
        image: 'images/bst_da.webp',
        images: ['images/bst_da.webp'],
        description: 'Thiết kế biểu tượng cỏ bốn cánh đính đá Aquamarine xanh ngọc biển khơi, mang lại bình an, thuận buồm xuôi gió và vận khí hanh thông.'
      }
    };

    const specific = fallbackCatalog[slug] || {};
    return {
      id: 'prod_' + (slug || 'default'),
      name: specific.name || 'Lắc tay Hơi Thở Biển Xanh',
      slug: slug || 'lac-tay-hoi-tho-bien-xanh',
      productCode: specific.productCode || 'AM-AQ001',
      price: specific.price || 590000,
      compareAtPrice: specific.compareAtPrice || 650000,
      stone: specific.stone || 'Aquamarine Tự Nhiên & Bạc 925',
      element: specific.element || 'Mệnh Thủy & Mộc',
      badge: 'Bán chạy',
      stock: 35,
      sizes: ['14 cm', '15 cm', '16 cm'],
      image: specific.image || 'images/lac_tay_bien.png',
      images: specific.images || ['images/lac_tay_bien.png'],
      description: specific.description || 'Được chế tác từ những viên đá Aquamarine thiên nhiên mang sắc xanh thanh khiết của đại dương sâu thẳm, kết hợp cùng chi tiết bạc Ý 925 cao cấp. Tạo tác là biểu tượng của sự bình an, tĩnh tâm và soi sáng trực giác cho người đeo.',
      ratingAverage: specific.ratingAverage !== undefined ? specific.ratingAverage : 5.0,
      reviewCount: specific.reviewCount !== undefined ? specific.reviewCount : this.reviews.length
    };
  }
}

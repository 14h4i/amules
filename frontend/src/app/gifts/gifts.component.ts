import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProductService, IProduct } from '../services/product.service';
import { CartService } from '../services/cart.service';

const FALLBACK_GIFT_PACKAGES = [
  {
    _id: "19253ba3a00f40f0588eb5da",
    name: "Set Quà Tặng Hộp Nhung Amethyst",
    slug: "set-qua-tang-hop-nhung-amethyst",
    desc: "Set trang sức Amethyst tự nhiên đặt trong hộp nhung quý tộc, kèm chứng thư ngọc học và nến thơm.",
    price: 890000,
    image: "https://i.pinimg.com/736x/9b/9f/9f/9b9f9f152363271f0c154f437b34def0.jpg",
    tag: "QUÀ TẶNG CAO CẤP"
  },
  {
    _id: "c326bff57cfa65f545d70517_1",
    name: "Hộp Quà Tri Ân Nữ Thần",
    slug: "hop-qua-tri-an-nu-than",
    desc: "Hộp quà nhung đỏ hoàng gia đập nổi ánh vàng, thắt nơ lụa satin kèm thiệp thông điệp viết tay.",
    price: 99000,
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop",
    tag: "ĐÓNG GÓI HOÀNG GIA"
  },
  {
    _id: "c326bff57cfa65f545d70517_2",
    name: "Combo Thanh Tẩy Năng Lượng",
    slug: "combo-thanh-tay-nang-luong",
    desc: "Bộ trầm hương tự nhiên, xô thơm trắng California và chuông đồng thanh tẩy rung động bảo vật.",
    price: 150000,
    image: "https://images.unsplash.com/photo-1602928321679-560bb453f190?q=80&w=600&auto=format&fit=crop",
    tag: "THANH TẨY BẢO VẬT"
  },
  {
    _id: "c326bff57cfa65f545d70517_3",
    name: "Gói Quà Sinh Nhật Chiêm Tinh",
    slug: "goi-qua-sinh-nhat-chiem-tinh",
    desc: "Bản đồ sao cá nhân in dập nổi kim tuyến, phong ấn sáp niêm hoàng gia và túi vải gấm hộ mệnh.",
    price: 120000,
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop",
    tag: "CHIÊM TINH HỌC"
  }
];

@Component({
  selector: 'app-gifts',
  standalone: false,
  templateUrl: './gifts.component.html',
  styleUrl: './gifts.component.css'
})
export class GiftsComponent implements OnInit {
  giftProducts: IProduct[] = [];
  packages: any[] = FALLBACK_GIFT_PACKAGES;
  loading = false;
  addedToast: string | null = null;

  constructor(
    private _http: HttpClient,
    private _productService: ProductService,
    private _cartService: CartService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loading = true;

    // 1. Tải danh sách gói quà trực tiếp từ CSDL MongoDB
    this._http.get<any[]>('/api/gift-packages').subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.packages = data.map(p => ({
            ...p,
            name: p.name,
            desc: p.desc || p.description || p.shortDescription || 'Gói quà tặng ý nghĩa trang sức AMULES.',
            price: p.price || 99000,
            image: p.image || p.thumbnail || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop',
            tag: p.tag || 'DỊCH VỤ QUÀ TẶNG'
          }));
        } else if (!this.packages || this.packages.length === 0) {
          this.packages = FALLBACK_GIFT_PACKAGES;
        }
        this._cdr.detectChanges();
      },
      error: () => {
        if (!this.packages || this.packages.length === 0) {
          this.packages = FALLBACK_GIFT_PACKAGES;
        }
        this._cdr.detectChanges();
      }
    });

    // 2. Tải danh sách bảo vật gợi ý quà tặng từ MongoDB
    this._productService.getProducts().subscribe({
      next: (prods) => {
        if (prods && prods.length > 0) {
          // Lọc những sản phẩm phù hợp làm quà tặng
          const giftSuitable = prods.filter(p => !(p as any).isGiftPackage && p.category !== 'Set quà tặng');
          this.giftProducts = (giftSuitable.length > 0 ? giftSuitable : prods).slice(0, 8);
        }
        this.loading = false;
        this._cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this._cdr.detectChanges();
      }
    });
  }

  addPackageToCart(pkg: any): void {
    this._cartService.addToCart({
      productId: pkg._id || pkg.id || pkg.slug,
      name: pkg.name,
      price: pkg.price,
      image: pkg.image,
      quantity: 1,
      stone: 'Gói quà tặng'
    }).subscribe({
      next: () => {
        this.showToast(`Đã thêm "${pkg.name}" vào giỏ hàng`);
      },
      error: () => {
        this.showToast(`Đã thêm "${pkg.name}" vào giỏ hàng`);
      }
    });
  }

  private showToast(msg: string): void {
    this.addedToast = msg;
    this._cdr.detectChanges();
    setTimeout(() => {
      this.addedToast = null;
      this._cdr.detectChanges();
    }, 3000);
  }
}

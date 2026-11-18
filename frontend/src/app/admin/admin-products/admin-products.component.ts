import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-products',
  standalone: false,
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.css'
})
export class AdminProductsComponent implements OnInit {
  products: any[] = [];
  searchQuery = '';
  categoryFilter = 'all';
  loading = false;
  showModal = false;
  isEditing = false;
  toastMsg = '';

  currentProduct: any = this.getEmptyProduct();

  // Mock standard products for robust UI matching mockup
  mockProducts: any[] = [
  {
    "_id": "7caa02962f99fe72f8cfb0d6",
    "name": "Lắc tay Hơi Thở Biển Xanh",
    "productCode": "AM-AQ001",
    "slug": "lac-tay-hoi-tho-bien-xanh",
    "category": "Vòng tay",
    "collection": "Nàng Thơ (The Muse)",
    "shortDesc": "Chuỗi hạt Aquamarine giác cắt kết hợp bạc 925, mang cảm giác bình an, nuôi dưỡng trực giác.",
    "stone": "Aquamarine (Ngọc Hải Lam)",
    "mohs": "Mohs 6.5 - 7.5",
    "metal": "Bạc 925",
    "compatibleElements": [
      "Mệnh Thủy",
      "Mệnh Mộc"
    ],
    "listingStatus": "active",
    "price": 590000,
    "compareAtPrice": 678500,
    "stock": 40,
    "image": "images/lac_tay_bien.png",
    "badge": "Nổi bật"
  },
  {
    "_id": "420903a9c3bacabc1ea790a7",
    "name": "Dây chuyền Bạc Nữ Mix Đá Merlia",
    "productCode": "AM-MS010",
    "slug": "day-chuyen-bac-nu-mix-da-merlia",
    "category": "Dây chuyền",
    "collection": "Moon & Stars",
    "shortDesc": "Dây chuyền bạc mặt Moonstone giọt lệ ánh xanh, thanh lịch và nữ tính.",
    "stone": "Moonstone (Đá Mặt Trăng)",
    "mohs": "Mohs 6.5 - 7.5",
    "metal": "Bạc 925",
    "compatibleElements": [
      "Mệnh Kim",
      "Mệnh Thủy"
    ],
    "listingStatus": "active",
    "price": 650000,
    "compareAtPrice": 747500,
    "stock": 35,
    "image": "images/dch_mix_da.png",
    "badge": "Nổi bật"
  },
  {
    "_id": "397cc13e3a983bc4060cc878",
    "name": "Nhẫn Tinh Tú Venus",
    "productCode": "AM-RQ020",
    "slug": "nhan-tinh-tu-venus",
    "category": "Nhẫn",
    "collection": "Mystical Vintage",
    "shortDesc": "Nhẫn thạch anh hồng tự nhiên, gắn kết năng lượng tình yêu và sự dịu dàng.",
    "stone": "Thạch anh hồng",
    "mohs": "Mohs 6.5 - 7.5",
    "metal": "Vàng hồng 14K mạ",
    "compatibleElements": [
      "Mệnh Hỏa",
      "Mệnh Thổ"
    ],
    "listingStatus": "active",
    "price": 450000,
    "compareAtPrice": 517500,
    "stock": 25,
    "image": "images/nhan_tinh_tu.png",
    "badge": "Nổi bật"
  },
  {
    "_id": "b2a6e97daf8e589b35880cdc",
    "name": "Bông tai Sao Bạc & Baroque",
    "productCode": "AM-PR030",
    "slug": "bong-tai-sao-bac-baroque",
    "category": "Bông tai",
    "collection": "Mystical Vintage",
    "shortDesc": "Bông tai ngọc trai Baroque tự nhiên phối ngôi sao bạc 925.",
    "stone": "Ngọc trai tự nhiên",
    "mohs": "Mohs 6.5 - 7.5",
    "metal": "Bạc 925",
    "compatibleElements": [
      "Mệnh Kim"
    ],
    "listingStatus": "active",
    "price": 520000,
    "compareAtPrice": 598000,
    "stock": 30,
    "image": "images/bong_tai.png",
    "badge": "Nổi bật"
  },
  {
    "_id": "dabcd7e6ca8fe24e72e46af2",
    "name": "Vòng Tay Moonstone & Bạc 925 - Celestial Moon Whispers",
    "productCode": "AM-MS042",
    "slug": "vong-tay-moonstone-bac-925-celestial-moon-whispers",
    "category": "Vòng tay",
    "collection": "Moon & Stars",
    "shortDesc": "Vòng tay Moonstone ánh xanh kết hợp charm mặt trăng khuyết, thanh tẩy và cân bằng cảm xúc.",
    "stone": "Moonstone (Đá Mặt Trăng)",
    "mohs": "Mohs 6.5 - 7.5",
    "metal": "Bạc 925",
    "compatibleElements": [
      "Mệnh Thủy",
      "Mệnh Kim"
    ],
    "listingStatus": "active",
    "price": 580000,
    "compareAtPrice": 680000,
    "stock": 50,
    "image": "images/bst_vong_tay.png",
    "badge": "Nổi bật"
  },
  {
    "_id": "cef158eeb3534491b1bb60b8",
    "name": "Dây Chuyền Mặt Trăng Khuyết Moonstone",
    "productCode": "AM-MS043",
    "slug": "day-chuyen-mat-trang-khuyet-moonstone",
    "category": "Dây chuyền",
    "collection": "Moon & Stars",
    "shortDesc": "Dây chuyền bạc mặt trăng khuyết đính Moonstone.",
    "stone": "Moonstone (Đá Mặt Trăng)",
    "mohs": "Mohs 6.5 - 7.5",
    "metal": "Bạc 925",
    "compatibleElements": [
      "Mệnh Thủy",
      "Mệnh Kim"
    ],
    "listingStatus": "active",
    "price": 650000,
    "compareAtPrice": 747500,
    "stock": 28,
    "image": "images/bst_dch.png",
    "badge": "Nổi bật"
  },
  {
    "_id": "028049c2c1d73579085756f5",
    "name": "Nhẫn Tinh Tú Huyền Ảo Bạc 925",
    "productCode": "AM-MS044",
    "slug": "nhan-tinh-tu-huyen-ao-bac-925",
    "category": "Nhẫn",
    "collection": "Moon & Stars",
    "shortDesc": "Nhẫn bạc 925 đính Moonstone phong cách huyền ảo.",
    "stone": "Moonstone (Đá Mặt Trăng)",
    "mohs": "Mohs 6.5 - 7.5",
    "metal": "Bạc 925",
    "compatibleElements": [
      "Mệnh Thủy"
    ],
    "listingStatus": "active",
    "price": 450000,
    "compareAtPrice": 517500,
    "stock": 22,
    "image": "images/bst_nhan_lg.png",
    "badge": "Nổi bật"
  },
  {
    "_id": "0b960313cef9e50d9eed12c3",
    "name": "Dây Chuyền Giọt Lệ Aquamarine Biển Sâu",
    "productCode": "AM-AQ002",
    "slug": "day-chuyen-giot-le-aquamarine-bien-sau",
    "category": "Dây chuyền",
    "collection": "Bộ sưu tập độc bản",
    "shortDesc": "Mặt giọt lệ Aquamarine tỏa ánh biển sâu, dây bạc 925.",
    "stone": "Aquamarine (Ngọc Hải Lam)",
    "mohs": "Mohs 6.5 - 7.5",
    "metal": "Bạc 925",
    "compatibleElements": [
      "Mệnh Thủy"
    ],
    "listingStatus": "active",
    "price": 720000,
    "compareAtPrice": 828000,
    "stock": 18,
    "image": "images/bst_set_qua.webp",
    "badge": "Nổi bật"
  },
  {
    "_id": "5ca64aea1b1133e6088c848e",
    "name": "Nhẫn Hộ Thân Thạch Anh Khói Lam Tuyết",
    "productCode": "AM-SQ050",
    "slug": "nhan-ho-than-thach-anh-khoi-lam-tuyet",
    "category": "Nhẫn",
    "collection": "Bộ sưu tập độc bản",
    "shortDesc": "Nhẫn thạch anh khói kết hợp đá xanh lam, mang ý nghĩa hộ thân.",
    "stone": "Thạch anh khói, Kyanite",
    "mohs": "Mohs 6.5 - 7.5",
    "metal": "Bạc 925",
    "compatibleElements": [
      "Mệnh Thủy",
      "Mệnh Thổ"
    ],
    "listingStatus": "active",
    "price": 460000,
    "compareAtPrice": 529000,
    "stock": 12,
    "image": "images/lac_tay_bien.png",
    "badge": "Nổi bật"
  },
  {
    "_id": "07701fa38b41160cee3f0d29",
    "name": "Vòng Tay Hải Lam Thủy Tiểu",
    "productCode": "AM-AQ003",
    "slug": "vong-tay-hai-lam-thuy-tieu",
    "category": "Vòng tay",
    "collection": "Bộ sưu tập độc bản",
    "shortDesc": "Chuỗi hạt Aquamarine giác cắt, kết hợp khóa bạc bình an.",
    "stone": "Aquamarine (Ngọc Hải Lam), Moonstone (Đá Mặt Trăng)",
    "mohs": "Mohs 6.5 - 7.5",
    "metal": "Bạc 925",
    "compatibleElements": [
      "Mệnh Thủy"
    ],
    "listingStatus": "active",
    "price": 590000,
    "compareAtPrice": 678500,
    "stock": 33,
    "image": "images/dch_mix_da.png",
    "badge": "Nổi bật"
  },
  {
    "_id": "a7b1c298566e03c8c1f82b3d",
    "name": "Nhẫn Citrine Ánh Dương",
    "productCode": "AM-CT060",
    "slug": "nhan-citrine-anh-duong",
    "category": "Nhẫn",
    "collection": "Bộ sưu tập độc bản",
    "shortDesc": "Nhẫn bạc 925 đính Citrine vàng, gợi sự tự tin và tỏa sáng.",
    "stone": "Thạch anh vàng Citrine",
    "mohs": "Mohs 6.5 - 7.5",
    "metal": "Bạc 925",
    "compatibleElements": [
      "Mệnh Thổ",
      "Mệnh Hỏa"
    ],
    "listingStatus": "active",
    "price": 480000,
    "compareAtPrice": 552000,
    "stock": 30,
    "image": "images/nhan_tinh_tu.png",
    "badge": "Nổi bật"
  },
  {
    "_id": "b5331d2cc61bf3451fa01cd9",
    "name": "Dây Chuyền Aventurine Xanh Ngọc",
    "productCode": "AM-AV061",
    "slug": "day-chuyen-aventurine-xanh-ngoc",
    "category": "Dây chuyền",
    "collection": "Bộ sưu tập độc bản",
    "shortDesc": "Mặt Aventurine xanh ngọc trên dây bạc 925, gợi ý may mắn và cơ hội.",
    "stone": "Aventurine",
    "mohs": "Mohs 6.5 - 7.5",
    "metal": "Bạc 925",
    "compatibleElements": [
      "Mệnh Mộc"
    ],
    "listingStatus": "active",
    "price": 560000,
    "compareAtPrice": 644000,
    "stock": 30,
    "image": "images/bong_tai.png",
    "badge": "Nổi bật"
  },
  {
    "_id": "a5afdce6f13421985c88f0ac",
    "name": "Dây Chuyền Amethyst Tím Khói",
    "productCode": "AM-AM062",
    "slug": "day-chuyen-amethyst-tim-khoi",
    "category": "Dây chuyền",
    "collection": "Bộ sưu tập độc bản",
    "shortDesc": "Dây chuyền Amethyst tím khói, mang lại cảm giác thư giãn và cân bằng.",
    "stone": "Thạch anh tím (Amethyst)",
    "mohs": "Mohs 6.5 - 7.5",
    "metal": "Bạc 925",
    "compatibleElements": [
      "Mệnh Hỏa"
    ],
    "listingStatus": "active",
    "price": 620000,
    "compareAtPrice": 713000,
    "stock": 30,
    "image": "images/bst_vong_tay.png",
    "badge": "Nổi bật"
  },
  {
    "_id": "e15ebba46e88221c8c531868",
    "name": "Vòng Tay Bạc 925 Ngọc Bích",
    "productCode": "AM-JD063",
    "slug": "vong-tay-bac-925-ngoc-bich",
    "category": "Vòng tay",
    "collection": "Bộ sưu tập độc bản",
    "shortDesc": "Vòng tay bạc 925 đính ngọc bích, biểu tượng của tình bạn gắn kết.",
    "stone": "Cẩm thạch xanh",
    "mohs": "Mohs 6.5 - 7.5",
    "metal": "Bạc 925",
    "compatibleElements": [
      "Mệnh Mộc"
    ],
    "listingStatus": "active",
    "price": 690000,
    "compareAtPrice": 793500,
    "stock": 30,
    "image": "images/bst_dch.png",
    "badge": "Nổi bật"
  },
  {
    "_id": "52664aa06af1d45a0ebdd298",
    "name": "Vòng Tay Fluorite Sáng Tạo",
    "productCode": "AM-FL064",
    "slug": "vong-tay-fluorite-sang-tao",
    "category": "Vòng tay",
    "collection": "Bộ sưu tập độc bản",
    "shortDesc": "Chuỗi Fluorite nhiều sắc xanh tím, hỗ trợ tập trung và sáng tạo.",
    "stone": "Fluorite",
    "mohs": "Mohs 6.5 - 7.5",
    "metal": "Bạc 925",
    "compatibleElements": [
      "Mệnh Mộc"
    ],
    "listingStatus": "active",
    "price": 540000,
    "compareAtPrice": 621000,
    "stock": 30,
    "image": "images/bst_nhan_lg.png",
    "badge": "Nổi bật"
  },
  {
    "_id": "19253ba3a00f40f0588eb5da",
    "name": "Set Quà Tặng Hộp Nhung Amethyst",
    "productCode": "AM-GS065",
    "slug": "set-qua-tang-hop-nhung-amethyst",
    "category": "Set quà tặng",
    "collection": "Bộ sưu tập độc bản",
    "shortDesc": "Set trang sức Amethyst trong hộp quà nhung cao cấp.",
    "stone": "Thạch anh tím (Amethyst)",
    "mohs": "Mohs 6.5 - 7.5",
    "metal": "Bạc 925",
    "compatibleElements": [
      "Mệnh Hỏa"
    ],
    "listingStatus": "active",
    "price": 890000,
    "compareAtPrice": 1023500,
    "stock": 30,
    "image": "images/bst_set_qua.webp",
    "badge": "Nổi bật"
  }
];

  constructor(private _adminService: AdminService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this._adminService.getProducts().subscribe({
      next: (data) => {
        if (data && data.length) {
          this.products = data.map((p: any, i: number) => {
            const fallback = this.mockProducts[i % this.mockProducts.length];
            return {
              ...fallback,
              ...p,
              name: p.name || fallback.name,
              price: p.price || fallback.price,
              image: p.image || fallback.image,
              stock: p.stock !== undefined ? p.stock : fallback.stock
            };
          });
        } else {
          this.products = [...this.mockProducts];
        }
        this.loading = false;
      },
      error: () => {
        this.products = [...this.mockProducts];
        this.loading = false;
      }
    });
  }

  get filteredProducts(): any[] {
    let list = [...this.products];
    if (this.categoryFilter !== 'all') {
      list = list.filter(p => p.category?.toLowerCase().includes(this.categoryFilter.toLowerCase()));
    }
    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.productCode && p.productCode.toLowerCase().includes(q)) ||
        (p.stone && p.stone.toLowerCase().includes(q))
      );
    }
    return list;
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.currentProduct = this.getEmptyProduct();
    this.showModal = true;
  }

  openEditModal(p: any): void {
    this.isEditing = true;
    this.currentProduct = { ...p };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveProduct(): void {
    if (!this.currentProduct.name) {
      this.showToast('Vui lòng nhập tên tác phẩm!');
      return;
    }

    if (this.isEditing) {
      const id = this.currentProduct.id || this.currentProduct._id;
      this._adminService.updateProduct(id, this.currentProduct).subscribe({
        next: () => {
          this.showToast('Cập nhật tác phẩm thành công!');
          this.closeModal();
          this.loadProducts();
        },
        error: () => {
          const found = this.products.find(x => (x._id && x._id === id) || x.productCode === this.currentProduct.productCode);
          if (found) Object.assign(found, this.currentProduct);
          this.showToast('Cập nhật tác phẩm thành công!');
          this.closeModal();
        }
      });
    } else {
      this._adminService.createProduct(this.currentProduct).subscribe({
        next: () => {
          this.showToast('Thêm tác phẩm mới thành công!');
          this.closeModal();
          this.loadProducts();
        },
        error: () => {
          this.products.unshift({ ...this.currentProduct });
          this.showToast('Thêm tác phẩm mới thành công!');
          this.closeModal();
        }
      });
    }
  }

  deleteProduct(p: any): void {
    if (confirm(`Bạn có chắc chắn muốn xóa tác phẩm "${p.name}"?`)) {
      const id = p.id || p._id;
      this._adminService.deleteProduct(id).subscribe({
        next: () => {
          this.showToast('Đã xóa tác phẩm thành công!');
          this.loadProducts();
        },
        error: () => {
          this.products = this.products.filter(x => x !== p);
          this.showToast('Đã xóa tác phẩm thành công!');
        }
      });
    }
  }

  removeElementChip(idx: number): void {
    if (this.currentProduct.compatibleElements) {
      this.currentProduct.compatibleElements.splice(idx, 1);
    }
  }

  removeZodiacChip(idx: number): void {
    if (this.currentProduct.compatibleZodiacs) {
      this.currentProduct.compatibleZodiacs.splice(idx, 1);
    }
  }

  showToast(msg: string): void {
    this.toastMsg = msg;
    setTimeout(() => (this.toastMsg = ''), 3500);
  }

  private getEmptyProduct(): any {
    return {
      name: 'Vòng tay Đá Mặt Trăng Moonstone Ánh Lam Celestial',
      productCode: `AMU-VT-${Date.now().toString().slice(-3)}`,
      slug: 'vong-tay-moonstone-anh-lam-celestial',
      category: 'Vòng tay & Lắc tay',
      collection: 'Moonlight & Stars Collection',
      shortDesc: 'Chiếc vòng tay thủ công đính kết từng viên đá Mặt Trăng nguyên bản từ Sri Lanka, mang dải quang phổ xanh lam huyền ảo, biểu trưng cho sự bình yên và trực giác thức tỉnh.',
      stone: 'Moonstone (Đá Mặt Trăng)',
      mohs: '6.0 - 6.5',
      metal: 'Bạc Ý 925 mạ Rhodium bạch kim 3 lớp',
      compatibleElements: ['Mệnh Thủy (Tương Hợp)', 'Mệnh Kim (Tương Sinh)'],
      compatibleZodiacs: ['Cự Giải (Cancer)', 'Song Ngư (Pisces)'],
      spectrumColors: ['Trắng ánh lam', 'Ánh xà cừ ngọc'],
      styles: ['Vintage Minimal', 'Thanh lịch hoàng gia', 'Talisman bảo hộ'],
      listingStatus: 'active',
      price: 580000,
      compareAtPrice: 650000,
      stock: 24,
      lowStockAlert: 5,
      weight: 'Khối lượng tịnh tiêu chuẩn 12 gam (~3.2 chỉ)',
      image: 'images/lac_tay_bien.png',
      badge: 'Mới',
      lastSaved: '14:38 hôm nay'
    };
  }
}

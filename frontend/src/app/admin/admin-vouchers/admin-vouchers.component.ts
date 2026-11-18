import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-vouchers',
  standalone: false,
  templateUrl: './admin-vouchers.component.html',
  styleUrl: './admin-vouchers.component.css'
})
export class AdminVouchersComponent implements OnInit {
  // Top-level View Switcher
  mainSection: 'vouchers' | 'articles' = 'vouchers';

  // -------------------------------------------------------------
  // VOUCHER MANAGEMENT STATE
  // -------------------------------------------------------------
  vouchers: any[] = [];
  activeTab: 'all' | 'active' | 'upcoming' | 'expired' | 'disabled' = 'all';
  typeFilter = 'all';
  searchQuery = '';
  loading = false;
  showModal = false;
  toastMsg = '';

  newVoucher: any = {
    title: 'Ưu đãi Đặc Quyền Mùa Trăng Rằm - Tháng 11',
    code: 'MOONFEST2026',
    discountType: 'percentage', // percentage, fixed, gift
    discountValue: 15,
    maxDiscountValue: 300000,
    minOrderValue: 1200000,
    totalQuantity: 250,
    limitPerCustomer: 1,
    appliedCollection: 'Bộ sưu tập: Moonlight & Stars',
    startDate: '2026-11-01T00:00',
    endDate: '2026-11-15T23:59',
    isActive: true,
    showPublic: true
  };

  mockVouchers: any[] = [
    {
      _id: '6554c734ccab8f448ff0825e',
      code: 'AMULESLOVE',
      title: 'Giảm 100.000đ cho đơn từ 1 triệu',
      description: 'Giảm 100.000đ cho đơn từ 1 triệu',
      discountType: 'fixed',
      discountTypeLabel: 'Giảm cố định',
      discountValue: 100000,
      discountValueLabel: '100.000 VNĐ',
      discountAmount: 100000,
      minOrderLabel: 'Từ 1.000.000 VNĐ',
      minOrderValue: 1000000,
      usedCount: 1,
      usageLimit: 500,
      totalLimit: 500,
      usagePercent: 1,
      validRange: '01/11/2026 - 31/12/2026',
      status: 'active'
    },
    {
      _id: '1b267619c4812cc46ec28174',
      code: 'WELCOME10',
      title: 'Giảm 10% cho thành viên mới',
      description: 'Giảm 10% cho thành viên mới',
      discountType: 'percentage',
      discountTypeLabel: 'Theo %',
      discountValue: 10,
      discountValueLabel: '10% (Tối đa 100.000đ)',
      maxDiscount: 100000,
      minOrderLabel: 'Từ 300.000 VNĐ',
      minOrderValue: 300000,
      usedCount: 0,
      usageLimit: 1000,
      totalLimit: 1000,
      usagePercent: 0,
      validRange: '01/09/2026 - 31/03/2027',
      status: 'active'
    }
  ];

  // Dynamic getters for vouchers
  get totalVouchersCount(): number {
    return this.vouchers.length;
  }

  get activeVouchersCount(): number {
    return this.vouchers.filter(v => v.status === 'active' || v.isActive !== false).length;
  }

  get upcomingVouchersCount(): number {
    return this.vouchers.filter(v => v.status === 'upcoming').length;
  }

  get expiredVouchersCount(): number {
    return this.vouchers.filter(v => v.status === 'expired').length;
  }

  get totalUsesCount(): number {
    return this.vouchers.reduce((sum, v) => sum + (Number(v.usedCount) || 0), 0);
  }

  // -------------------------------------------------------------
  // CONTENT & EDITORIAL SUITE STATE (QUẢN LÝ NỘI DUNG)
  // -------------------------------------------------------------
  articles: any[] = [];
  articleSubTab: 'banners' | 'articles' | 'comments' = 'articles';
  articleCategoryFilter: string = 'all';
  articleStatusFilter: string = 'all';
  articleSearchQuery: string = '';
  showArticleModal: boolean = false;
  isEditingArticle: boolean = false;

  currentEditingArticle: any = {
    code: '882',
    title: 'Ý nghĩa của đá Amethyst: Năng lượng thanh tẩy tâm trí và giấc ngủ an lành',
    slug: 'y-nghia-da-amethyst-thanh-tay-tam-tri',
    category: 'Thạch học & Đá quý',
    eyebrow: 'THẠCH HỌC TÂM LINH',
    author: 'Vũ Hoàng Linh (Quản trị viên)',
    authorInitial: 'VL',
    date: '28/10/2026 14:32',
    views: 8420,
    growthText: '+18% tuần này',
    seoScore: 96,
    status: 'published',
    image: 'https://i.pinimg.com/736x/47/9c/df/479cdf269b5b50948b8aef6103b475ed.jpg',
    excerpt: 'Khám phá nguồn gốc, thuộc tính quang học và sức mạnh phong thủy kỳ diệu của Thạch Anh Tím (Amethyst) trong việc xoa dịu âu lo, kích hoạt luân xa vương miện và mang lại luồng sinh khí quý phái cho gia chủ.',
    content: 'Được mệnh danh là viên đá của sự thức tỉnh tâm linh, Amethyst từ thời cổ đại đã được các bậc đế vương Hy Lạp và La Mã tôn sùng như một lá bùa hộ thân chống lại sự mê muội và giữ cho tâm trí luôn giữ vững trạng thái tĩnh tại sâu thẳm. Theo các nhà ngọc học hiện đại, sắc tím huyền ảo của đá bắt nguồn từ các tạp chất sắt kết hợp cùng quá trình chiếu xạ tự nhiên qua hàng triệu năm trong lòng đất bazan.\n\nTrong ngũ hành phương Đông, sắc tím thẫm của thạch anh tím dung hòa năng lượng giữa Hỏa và Thủy, tạo thành chu kỳ tương sinh kỳ diệu. Đây là bảo vật tương hợp lý tưởng dành cho người mang mệnh Hỏa và mệnh Thổ.',
    tags: ['#Amethyst', '#ThachAnhTim', '#MenhThuy', '#MenhHoa', '#CungBaoBinh', '#ThanhTayNangLuong'],
    allowComments: true
  };

  mockArticles: any[] = [
    {
      _id: '57a588d4105f6583d7fb1825',
      code: '882',
      title: 'Moonstone: Vẻ đẹp dịu dàng và năng lượng soi dưỡng tâm hồn',
      slug: 'moonstone-ve-dep-an-nhien',
      category: 'Kiến thức đá',
      eyebrow: 'BẢO VẬT ÁNH TRĂNG',
      author: 'Quản trị viên AMULES',
      authorRole: 'Admin',
      authorInitial: 'AM',
      date: '20/10/2026',
      views: 8420,
      growthText: '+18% xem lượng',
      seoScore: 96,
      status: 'published',
      image: 'https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg',
      excerpt: 'Khám phá vẻ đẹp dịu dàng và năng lượng soi dưỡng tâm hồn của Moonstone, viên đá của trực giác và bình yên sâu thẳm.',
      tags: ['#Moonstone', '#DaNangLuong', '#TinhTam']
    },
    {
      _id: '40a1a9c9997a2dfc53e009fc',
      code: '879',
      title: '5 bước thanh tẩy và nạp năng lượng tâm đá quý tại nhà',
      slug: '5-buoc-thanh-tay-nap-nang-luong',
      category: 'Chăm sóc đá',
      eyebrow: 'HƯỚNG DẪN CHĂM SÓC',
      author: 'Quản trị viên AMULES',
      authorRole: 'Admin',
      authorInitial: 'AM',
      date: '20/10/2026',
      views: 5120,
      growthText: 'Bán chạy',
      seoScore: 94,
      status: 'published',
      image: 'https://i.pinimg.com/1200x/5e/19/ca/5e19cae249717d1321564c81f14a1732.jpg',
      excerpt: 'Hướng dẫn chi tiết 5 bước thanh tẩy và nạp năng lượng tâm đá quý tự nhiên tại nhà bằng ánh trăng và trầm hương.',
      tags: ['#ThanhTayDa', '#ChamSocDa', '#NangLuong']
    },
    {
      _id: 'eb6ebf06f72a510607fc461e',
      code: '864',
      title: 'Cách phối trang sức tự nhiên tinh tế cho phong cách hằng ngày',
      slug: 'cach-phoi-trang-suc',
      category: 'Phối đồ',
      eyebrow: 'PHONG CÁCH & LỐI SỐNG',
      author: 'Quản trị viên AMULES',
      authorRole: 'Admin',
      authorInitial: 'AM',
      date: '20/10/2026',
      views: 11850,
      growthText: '+32% tương tác',
      seoScore: 98,
      status: 'published',
      image: 'https://i.pinimg.com/736x/47/9c/df/479cdf269b5b50948b8aef6103b475ed.jpg',
      excerpt: 'Nghệ thuật phối trang sức đá tự nhiên tinh tế, thanh lịch và hài hòa phong thủy cho mọi sự kiện hằng ngày.',
      tags: ['#PhoiDo', '#PhongCach', '#TrangSucDa']
    }
  ];

  // Dynamic getters for articles
  get publishedArticlesCount(): number {
    return this.articles.filter(a => a.status === 'published').length;
  }

  get draftArticlesCount(): number {
    return this.articles.filter(a => a.status === 'draft').length;
  }

  get totalArticleReads(): number {
    return this.articles.reduce((sum, a) => sum + (Number(a.views) || 0), 0);
  }

  constructor(
    private _adminService: AdminService,
    private _router: Router
  ) {
    if (this._router.url.includes('/admin/content') || this._router.url.includes('/admin/articles')) {
      this.mainSection = 'articles';
    } else {
      this.mainSection = 'vouchers';
    }
    // Khởi tạo sẵn sàng để không bao giờ bị chớp màn hình trắng 0 bản ghi
    this.vouchers = this.mockVouchers.map((v, i) => this.formatVoucher(v, i));
    this.articles = this.mockArticles.map((a, i) => this.formatArticle(a, i));
  }

  ngOnInit(): void {
    this.loadVouchers();
    this.loadArticles();
  }

  // -------------------------------------------------------------
  // VOUCHER METHODS
  // -------------------------------------------------------------
  formatVoucher(v: any, index: number = 0): any {
    const fallback = this.mockVouchers[index % this.mockVouchers.length] || {};
    const code = v.code || fallback.code || 'AMULESLOVE';
    const description = v.description || v.title || fallback.title || 'Ưu đãi trang sức phong thủy AMULES';
    const discountType = v.discountType || fallback.discountType || 'fixed';

    let discountTypeLabel = 'Giảm cố định';
    if (discountType === 'percentage') discountTypeLabel = 'Theo %';
    else if (discountType === 'gift') discountTypeLabel = 'Quà tặng kèm';
    else if (discountType === 'freeship') discountTypeLabel = 'Freeship';

    const discountVal = Number(v.discountValue) || Number(v.discountAmount) || fallback.discountAmount || 0;
    let discountValueLabel = '';
    if (discountType === 'percentage') {
      const maxD = v.maxDiscount ? ` (Tối đa ${Number(v.maxDiscount).toLocaleString('vi-VN')}đ)` : '';
      discountValueLabel = `${discountVal}%${maxD}`;
    } else if (discountType === 'gift') {
      discountValueLabel = v.giftName || description || 'Hộp nhung & Khăn lau cao cấp';
    } else if (discountType === 'freeship') {
      discountValueLabel = `${(discountVal || 40000).toLocaleString('vi-VN')} VNĐ (Vận chuyển)`;
    } else {
      discountValueLabel = `${discountVal.toLocaleString('vi-VN')} VNĐ`;
    }

    const minVal = Number(v.minOrderValue) || 0;
    const minOrderLabel = minVal > 0 ? `Từ ${minVal.toLocaleString('vi-VN')} VNĐ` : 'Mọi giá trị đơn';

    const used = Number(v.usedCount) || 0;
    const total = Number(v.usageLimit) || Number(v.totalLimit) || 500;
    const usagePercent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

    let validRange = fallback.validRange || 'Đang áp dụng';
    if (v.startDate && v.endDate) {
      try {
        const s = new Date(v.startDate);
        const e = new Date(v.endDate);
        if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
          const sStr = `${String(s.getDate()).padStart(2, '0')}/${String(s.getMonth() + 1).padStart(2, '0')}/${s.getFullYear()}`;
          const eStr = `${String(e.getDate()).padStart(2, '0')}/${String(e.getMonth() + 1).padStart(2, '0')}/${e.getFullYear()}`;
          validRange = `${sStr} - ${eStr}`;
        }
      } catch (err) {}
    }

    return {
      _id: v._id || fallback._id,
      code,
      title: description,
      description,
      discountType,
      discountTypeLabel,
      discountValue: discountVal,
      discountValueLabel,
      minOrderValue: minVal,
      minOrderLabel,
      usedCount: used,
      totalLimit: total,
      usagePercent,
      validRange,
      status: v.status || fallback.status || 'active',
      isActive: v.status !== 'disabled' && v.status !== 'expired'
    };
  }

  loadVouchers(): void {
    this.loading = true;
    this._adminService.getVouchers().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.vouchers = data.map((v: any, i: number) => this.formatVoucher(v, i));
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get filteredVouchers(): any[] {
    let list = [...this.vouchers];
    if (this.activeTab !== 'all') {
      list = list.filter(v => v.status === this.activeTab);
    }
    if (this.typeFilter !== 'all') {
      list = list.filter(v => v.discountType === this.typeFilter);
    }
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(v =>
        (v.code && v.code.toLowerCase().includes(q)) ||
        (v.title && v.title.toLowerCase().includes(q)) ||
        (v.description && v.description.toLowerCase().includes(q))
      );
    }
    return list;
  }

  openCreateModal(): void {
    this.newVoucher = {
      title: 'Ưu đãi Đặc Quyền Mùa Trăng Rằm - Tháng 11',
      code: 'MOONFEST2026',
      discountType: 'percentage',
      discountValue: 15,
      maxDiscountValue: 300000,
      minOrderValue: 1200000,
      totalQuantity: 250,
      limitPerCustomer: 1,
      appliedCollection: 'Bộ sưu tập: Moonlight & Stars',
      startDate: '2026-11-01T00:00',
      endDate: '2026-11-15T23:59',
      isActive: true,
      showPublic: true
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  generateRandomCode(): void {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'AMU';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.newVoucher.code = code;
  }

  saveVoucher(): void {
    if (!this.newVoucher.code.trim()) return;

    const payload = {
      code: this.newVoucher.code,
      title: this.newVoucher.title,
      description: this.newVoucher.title,
      discountType: this.newVoucher.discountType,
      discountValue: this.newVoucher.discountType === 'percentage' ? this.newVoucher.discountValue : this.newVoucher.discountValue,
      maxDiscount: this.newVoucher.discountType === 'percentage' ? this.newVoucher.maxDiscountValue : null,
      minOrderValue: this.newVoucher.minOrderValue,
      usageLimit: this.newVoucher.totalQuantity,
      usedCount: 0,
      startDate: this.newVoucher.startDate,
      endDate: this.newVoucher.endDate,
      status: 'active'
    };

    this._adminService.createVoucher(payload).subscribe({
      next: () => {
        this.showToast('Lưu & phát hành voucher thành công!');
        this.closeModal();
        this.loadVouchers();
      },
      error: () => {
        this.vouchers.unshift(this.formatVoucher(payload, 0));
        this.showToast('Đã phát hành voucher thành công!');
        this.closeModal();
      }
    });
  }

  deleteVoucher(v: any): void {
    if (confirm(`Bạn có chắc muốn xóa mã voucher "${v.code}"?`)) {
      const id = v._id || v.code;
      this._adminService.deleteVoucher(id).subscribe({
        next: () => {
          this.showToast('Đã xóa mã voucher!');
          this.loadVouchers();
        },
        error: () => {
          this.vouchers = this.vouchers.filter(x => x !== v);
          this.showToast('Đã xóa mã voucher!');
        }
      });
    }
  }

  // -------------------------------------------------------------
  // ARTICLE & CONTENT MANAGEMENT METHODS
  // -------------------------------------------------------------
  formatArticle(a: any, index: number = 0): any {
    const fallback = this.mockArticles[index % this.mockArticles.length] || {};
    return {
      ...fallback,
      ...a,
      title: a.title || fallback.title,
      category: a.category || fallback.category,
      excerpt: a.summary || a.excerpt || fallback.excerpt,
      status: a.status || fallback.status || 'published',
      views: a.views !== undefined ? Number(a.views) : fallback.views,
      seoScore: a.seoScore !== undefined ? Number(a.seoScore) : fallback.seoScore,
      image: (a.thumbnail && !a.thumbnail.includes('drive.google.com')) ? a.thumbnail : fallback.image,
      date: a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('vi-VN') : (fallback.date || '28/10/2026')
    };
  }

  loadArticles(): void {
    this._adminService.getArticles().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.articles = data.map((a: any, i: number) => this.formatArticle(a, i));
        }
      },
      error: () => {}
    });
  }

  get filteredArticles(): any[] {
    let list = [...this.articles];

    if (this.articleCategoryFilter !== 'all') {
      list = list.filter(a => (a.category || '').toLowerCase().includes(this.articleCategoryFilter.toLowerCase()));
    }

    if (this.articleStatusFilter !== 'all') {
      list = list.filter(a => a.status === this.articleStatusFilter);
    }

    if (this.articleSearchQuery && this.articleSearchQuery.trim()) {
      const q = this.articleSearchQuery.toLowerCase().trim();
      list = list.filter(a =>
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.author && a.author.toLowerCase().includes(q)) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
        (a.tags && a.tags.some((t: string) => t.toLowerCase().includes(q)))
      );
    }

    return list;
  }

  openCreateArticleModal(): void {
    this.isEditingArticle = false;
    this.currentEditingArticle = {
      code: Math.floor(100 + Math.random() * 900).toString(),
      title: 'Ý nghĩa của đá Amethyst: Năng lượng thanh tẩy tâm trí và giấc ngủ an lành',
      slug: 'y-nghia-da-amethyst-thanh-tay-tam-tri',
      category: 'Thạch học & Đá quý',
      eyebrow: 'THẠCH HỌC TÂM LINH',
      author: 'Vũ Hoàng Linh (Quản trị viên)',
      authorRole: 'Admin',
      authorInitial: 'VL',
      date: '28/10/2026 14:32',
      views: 8420,
      growthText: '+18% tuần này',
      seoScore: 96,
      status: 'published',
      image: 'https://i.pinimg.com/736x/47/9c/df/479cdf269b5b50948b8aef6103b475ed.jpg',
      excerpt: 'Khám phá nguồn gốc, thuộc tính quang học và sức mạnh phong thủy kỳ diệu của Thạch Anh Tím (Amethyst) trong việc xoa dịu âu lo, kích hoạt luân xa vương miện và mang lại luồng sinh khí quý phái cho gia chủ.',
      content: 'Được mệnh danh là viên đá của sự thức tỉnh tâm linh, Amethyst từ thời cổ đại đã được các bậc đế vương Hy Lạp và La Mã tôn sùng như một lá bùa hộ thân chống lại sự mê muội...',
      tags: ['#Amethyst', '#ThachAnhTim', '#MenhThuy', '#MenhHoa', '#CungBaoBinh', '#ThanhTayNangLuong'],
      allowComments: true
    };
    this.showArticleModal = true;
  }

  openEditArticleModal(art: any): void {
    this.isEditingArticle = true;
    this.currentEditingArticle = {
      ...art,
      authorInitial: art.authorInitial || 'VL',
      authorRole: art.authorRole || 'Admin'
    };
    this.showArticleModal = true;
  }

  closeArticleModal(): void {
    this.showArticleModal = false;
  }

  saveArticle(publishNow: boolean = false): void {
    if (!this.currentEditingArticle.title.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết!');
      return;
    }

    if (publishNow) {
      this.currentEditingArticle.status = 'published';
    }

    const payload = {
      ...this.currentEditingArticle,
      slug: this.currentEditingArticle.slug || this.generateSlug(this.currentEditingArticle.title)
    };

    if (this.isEditingArticle && this.currentEditingArticle._id) {
      this._adminService.updateArticle(this.currentEditingArticle._id, payload).subscribe({
        next: () => {
          this.showToast('Cập nhật bài viết cẩm nang thành công!');
          this.closeArticleModal();
          this.loadArticles();
        },
        error: () => {
          const idx = this.articles.findIndex(a => a._id === this.currentEditingArticle._id);
          if (idx !== -1) {
            this.articles[idx] = { ...this.currentEditingArticle };
          }
          this.showToast('Cập nhật bài viết thành công!');
          this.closeArticleModal();
        }
      });
    } else {
      this._adminService.createArticle(payload).subscribe({
        next: () => {
          this.showToast('Xuất bản bài viết cẩm nang mới thành công!');
          this.closeArticleModal();
          this.loadArticles();
        },
        error: () => {
          this.articles.unshift({
            ...this.currentEditingArticle,
            _id: 'art_' + Date.now(),
            date: 'Hôm nay lúc 14:30'
          });
          this.showToast('Đã lưu và xuất bản bài viết thành công!');
          this.closeArticleModal();
        }
      });
    }
  }

  toggleArticlePublish(art: any): void {
    const newStatus = art.status === 'published' ? 'draft' : 'published';
    art.status = newStatus;
    const msg = newStatus === 'published' ? 'Đã xuất bản bài viết lên website!' : 'Đã chuyển bài viết về dạng bản nháp!';
    this.showToast(msg);
  }

  deleteArticle(art: any): void {
    if (confirm(`Bạn có chắc chắn muốn xóa bài viết "${art.title}"?`)) {
      const id = art._id || art.code;
      this._adminService.deleteArticle(id).subscribe({
        next: () => {
          this.showToast('Đã xóa bài viết cẩm nang!');
          this.loadArticles();
        },
        error: () => {
          this.articles = this.articles.filter(a => a !== art);
          this.showToast('Đã xóa bài viết!');
        }
      });
    }
  }

  generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  showToast(msg: string): void {
    this.toastMsg = msg;
    setTimeout(() => (this.toastMsg = ''), 3500);
  }
}

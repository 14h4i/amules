import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductService, IProduct } from '../services/product.service';
import { MasterDataService, ICategory, ICollection, IArticle } from '../services/master-data.service';

interface ProductItem {
  id?: string;
  slug?: string;
  name: string;
  stone: string;
  price: number;
  sold: string;
  badge: string;
  element: string;
  image: string;
  liked: boolean;
}

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>();
  // 5 the cam ket duoi banner
  perks = [
    { icon: 'check-circle', title: '100% Tự nhiên', sub: 'Đá quý tuyển chọn' },
    { icon: 'gift', title: 'Hộp nhung may mắn', sub: 'Trọn vẹn tâm tình' },
    { icon: 'infinity', title: 'Bảo hành trọn đời', sub: 'Yên tâm sử dụng' },
    { icon: 'exchange', title: 'Đổi trả 7 ngày', sub: 'Minh bạch & an tâm' },
    { icon: 'lotus', title: 'Tư vấn bản mệnh', sub: 'Năng lượng hộ thân' }
  ];

  categories: ICategory[] = [
    { name: 'Vòng tay', image: 'https://i.pinimg.com/736x/b3/cf/e0/b3cfe07a389a61eaa7b0f186da90da4f.jpg' },
    { name: 'Dây chuyền', image: 'https://i.pinimg.com/1200x/5e/19/ca/5e19cae249717d1321564c81f14a1732.jpg' },
    { name: 'Nhẫn', image: 'https://i.pinimg.com/736x/47/9c/df/479cdf269b5b50948b8aef6103b475ed.jpg' },
    { name: 'Bông tai', image: 'https://i.pinimg.com/736x/82/af/ce/82afce704fa0702179286be2a3d293d7.jpg' },
    { name: 'Charm đá', image: 'https://i.pinimg.com/1200x/33/52/d2/3352d2c48c5755e6f8110e386d63898e.jpg' },
    { name: 'Set quà tặng', image: 'https://i.pinimg.com/736x/9b/9f/9f/9b9f9f152363271f0c154f437b34def0.jpg' }
  ];

  elements = [
    { tag: 'Ngũ hành Kim', icon: 'sun', title: 'Sáng suốt & Khởi đầu', desc: 'Tập trung tinh thần, khơi mở trí tuệ minh triết và thu hút luồng khí hanh thông.', stones: 'Thạch anh trắng, Moonstone', dot: '#c9a24b' },
    { tag: 'Ngũ hành Mộc', icon: 'sprout', title: 'Tái sinh & An yên', desc: 'Hòa gần những vết nứt cảm xúc, vỗ về tâm hồn và ươm mầm sinh khí tươi mới.', stones: 'Aventurine, Cẩm thạch xanh', dot: '#7a5a1a' },
    { tag: 'Ngũ hành Thủy', icon: 'drop', title: 'Trực giác & Dòng chảy', desc: 'Khai mở linh cảm nhạy bén, giúp tâm trí mềm mại thích ứng trước mọi biến thiên.', stones: 'Aquamarine, Thạch anh đen', dot: '#8a2c6b' },
    { tag: 'Ngũ hành Hỏa', icon: 'flame', title: 'Nhiệt huyết & Tỏa sáng', desc: 'Thắp sáng niềm đam mê bất tận, sức quyến rũ tự nhiên và can đảm theo đuổi ước vọng.', stones: 'Thạch anh hồng, Garnet hồng', dot: '#d16a95' },
    { tag: 'Ngũ hành Thổ', icon: 'hexagon', title: 'Vững vàng & Thịnh vượng', desc: 'Điểm tựa của sự ổn định, tích lũy may mắn, vượng tài lộc và nuôi dưỡng hộ thân.', stones: 'Thạch anh vàng Citrine, Mắt hổ', dot: '#e0b048' }
  ];

  products: ProductItem[] = [
    { id: 'lac-tay-hoi-tho-bien-xanh', slug: 'lac-tay-hoi-tho-bien-xanh', name: 'Lắc tay Hơi Thở Biển Xanh', stone: 'Aquamarine & Bạc 925', price: 590000, sold: '320+', badge: 'Bán chạy', element: 'Mệnh Thủy & Mộc', image: 'https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg', liked: false },
    { id: 'day-chuyen-bac-nu-mix-da-merlia', slug: 'day-chuyen-bac-nu-mix-da-merlia', name: 'Dây chuyền Bạc Nữ Mix Đá Merlia', stone: 'Moonstone', price: 650000, sold: '540+', badge: 'Hot', element: 'Mệnh Kim & Thủy', image: 'https://i.pinimg.com/1200x/5e/19/ca/5e19cae249717d1321564c81f14a1732.jpg', liked: false },
    { id: 'nhan-tinh-tu-venus', slug: 'nhan-tinh-tu-venus', name: 'Nhẫn Tinh Tú Venus', stone: 'Thạch anh hồng tự nhiên', price: 450000, sold: '180+', badge: 'Mới ra mắt', element: 'Mệnh Hỏa & Thổ', image: 'https://i.pinimg.com/736x/47/9c/df/479cdf269b5b50948b8aef6103b475ed.jpg', liked: false },
    { id: 'bong-tai-sao-bac-baroque', slug: 'bong-tai-sao-bac-baroque', name: 'Bông tai Sao Bạc & Baroque', stone: 'Ngọc trai tự nhiên & Bạc', price: 320000, sold: '210+', badge: 'Ngọc trai Baroque', element: '', image: 'https://i.pinimg.com/736x/82/af/ce/82afce704fa0702179286be2a3d293d7.jpg', liked: false }
  ];

  collections: ICollection[] = [
    { tag: 'Cổ điển & Huyền bí', name: 'Mystical Vintage', desc: 'Dấu ấn hoàng gia Tây phương kết hợp chiều sâu chiêm nghiệm phương Đông, dành cho người yêu nét đẹp hoài niệm.', image: 'https://i.pinimg.com/736x/d2/c1/cd/d2c1cd50bee4cf66b8a095b253a55beb.jpg' },
    { tag: 'Thiên thể & Chiêm tinh', name: 'Moon & Stars', desc: 'Cảm hứng chu kỳ trăng tròn và 12 chòm sao thắp sáng, tượng trưng cho trực giác và sự soi đường dẫn lối.', image: 'https://i.pinimg.com/736x/53/a4/0f/53a40fcf65d77d5dcc8a9efcb531ac32.jpg' },
    { tag: 'Dịu dàng & Lãng mạn', name: 'Nàng Thơ (The Muse)', desc: 'Thức khởi, dịu êm với ngọc trai mạnh ngọt, dành thức trắc ẩn của yêu thương.', image: 'https://i.pinimg.com/736x/88/cc/a9/88cca9873ac223970e511970e84f478d.jpg' }
  ];

  posts: IArticle[] = [
    { tag: 'Ý nghĩa loại đá', read: '4 phút đọc', date: '12 Tháng 10, 2025', title: 'Moonstone: Vẻ đẹp dịu dàng và năng lượng soi dưỡng tâm hồn', excerpt: 'Được mệnh danh là viên đá của phụ nữ, Moonstone khơi mở dòng chảy nội tâm mềm dịu, làm dịu bớt căng thẳng và cân bằng nội tiết tố tự nhiên.', image: 'https://i.pinimg.com/736x/8c/01/6d/8c016d17da264368845d7d7ae0ad195a.jpg' },
    { tag: 'Thực hành thanh tẩy', read: '6 phút đọc', date: '08 Tháng 10, 2025', title: '5 bước thanh tẩy và nạp năng lượng tâm đá quý tại nhà', excerpt: 'Hướng dẫn chi tiết cách thanh tẩy đá phong thủy bằng ánh trăng rằm, khói xô thơm và nước muối biển để giữ cho tinh thể luôn sáng trong.', image: 'https://i.pinimg.com/736x/65/12/56/6512568af032cfb982e96c42c6218599.jpg' },
    { tag: 'Cảm hứng phối đồ', read: '5 phút đọc', date: '02 Tháng 10, 2025', title: 'Cách phối trang sức tự nhiên tinh tế cho phong cách hằng ngày', excerpt: 'Nghệ thuật xếp lớp (layering) vòng tay và dây chuyền phong thủy một cách sang trọng, không phô trương mà vẫn giữ trọn linh hồn bình yên.', image: 'https://i.pinimg.com/736x/b5/03/40/b50340697147b14ca4fd8f6b815bf8aa.jpg' }
  ];

  email = '';
  subscribed = false;

  constructor(
    private _productService: ProductService,
    private _masterDataService: MasterDataService
  ) { }

  ngOnInit(): void {
    // 1. Tải danh mục từ MongoDB API
    this._masterDataService.getCategories().pipe(takeUntil(this._destroy$)).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.categories = data;
        }
      },
      error: () => { }
    });

    // 2. Tải sản phẩm thật từ MongoDB API
    this._productService.getProducts().pipe(takeUntil(this._destroy$)).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          // Ánh xạ sang cấu trúc giao diện
          this.products = data.slice(0, 8).map(p => ({
            id: p.id || (p._id ? p._id.toString() : ''),
            slug: p.slug || p.id || 'lac-tay-hoi-tho-bien-xanh',
            name: p.name,
            stone: p.stone || 'Đá tự nhiên',
            price: p.price,
            sold: p.sold ? `${p.sold}+` : '100+',
            badge: p.badge || 'Nổi bật',
            element: p.element || '',
            image: p.image || (p.images && p.images[0]) || 'https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg',
            liked: false
          }));
        }
      },
      error: () => { }
    });

    // 3. Tải bộ sưu tập từ MongoDB API
    this._masterDataService.getCollections().pipe(takeUntil(this._destroy$)).subscribe({
      next: (cols) => {
        if (cols && cols.length > 0) {
          this.collections = cols.map(c => ({
            name: c.name,
            tag: c.tag || ((c.slug || '').includes('moon') ? 'Thiên thể & Chiêm tinh' : (c.slug || '').includes('mystic') ? 'Cổ điển & Huyền bí' : 'Dịu dàng & Lãng mạn'),
            desc: c.desc || (c as any).description || 'Bộ sưu tập trang sức phong thủy độc bản.',
            image: c.coverImage || c.image || ((c.slug || '').includes('moon') ? 'https://i.pinimg.com/736x/53/a4/0f/53a40fcf65d77d5dcc8a9efcb531ac32.jpg' : ((c.slug || '').includes('muse') || (c.name || '').includes('Nàng Thơ')) ? 'https://i.pinimg.com/736x/88/cc/a9/88cca9873ac223970e511970e84f478d.jpg' : 'https://i.pinimg.com/736x/d2/c1/cd/d2c1cd50bee4cf66b8a095b253a55beb.jpg')
          }));
        }
      },
      error: () => { }
    });

    // 4. Tải bài viết từ MongoDB API với ảnh bìa hợp lệ
    this._masterDataService.getArticles().pipe(takeUntil(this._destroy$)).subscribe({
      next: (articles) => {
        if (articles && articles.length > 0) {
          const fallbackImgs = ['https://i.pinimg.com/736x/8c/01/6d/8c016d17da264368845d7d7ae0ad195a.jpg', 'https://i.pinimg.com/736x/65/12/56/6512568af032cfb982e96c42c6218599.jpg', 'https://i.pinimg.com/736x/b5/03/40/b50340697147b14ca4fd8f6b815bf8aa.jpg'];
          this.posts = articles.slice(0, 3).map((a, idx) => {
            let img = a.image || a.thumbnail;
            if (!img || img.includes('drive.google.com') || img.startsWith('images/')) {
              const titleLower = (a.title || '').toLowerCase();
              if (titleLower.includes('moonstone')) img = 'https://i.pinimg.com/736x/8c/01/6d/8c016d17da264368845d7d7ae0ad195a.jpg';
              else if (titleLower.includes('thanh tẩy') || titleLower.includes('nạp năng lượng')) img = 'https://i.pinimg.com/736x/65/12/56/6512568af032cfb982e96c42c6218599.jpg';
              else if (titleLower.includes('phối') || titleLower.includes('phong cách')) img = 'https://i.pinimg.com/736x/b5/03/40/b50340697147b14ca4fd8f6b815bf8aa.jpg';
              else img = fallbackImgs[idx % fallbackImgs.length];
            }
            return {
              ...a,
              image: img,
              tag: a.tag || a.category || 'Cẩm nang năng lượng',
              read: a.read || '5 phút đọc',
              date: a.date || '12 Tháng 10, 2025'
            };
          });
        }
      },
      error: () => { }
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  onPostImageError(event: Event, post: any): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      const titleLower = (post?.title || '').toLowerCase();
      if (titleLower.includes('moonstone')) target.src = 'https://i.pinimg.com/736x/8c/01/6d/8c016d17da264368845d7d7ae0ad195a.jpg';
      else if (titleLower.includes('thanh tẩy') || titleLower.includes('nạp năng lượng')) target.src = 'https://i.pinimg.com/736x/65/12/56/6512568af032cfb982e96c42c6218599.jpg';
      else target.src = 'https://i.pinimg.com/736x/b5/03/40/b50340697147b14ca4fd8f6b815bf8aa.jpg';
    }
  }

  toggleLike(p: ProductItem) { p.liked = !p.liked; }
  subscribe() { if (this.email.includes('@')) { this.subscribed = true; } }
}

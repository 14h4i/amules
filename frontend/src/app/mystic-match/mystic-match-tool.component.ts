import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProductService, IProduct } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';

interface ZodiacInfo {
  name: string;
  latin: string;
  icon: string;
  element: string;
  dateRange: string;
}

interface ElementInfo {
  name: string;
  title: string;
  desc: string;
  colors: string[];
  contrastColors: string[];
  luckyStones: string[];
  affirmation: string;
}

@Component({
  selector: 'app-mystic-match-tool',
  standalone: false,
  templateUrl: './mystic-match-tool.component.html',
  styleUrl: './mystic-match-tool.component.css'
})
export class MysticMatchToolComponent implements OnInit {
  step: 'form' | 'result' = 'form';

  // Input form
  birthDay = 15;
  birthMonth = 7;
  birthYear = 2003;
  gender: 'female' | 'male' | 'other' = 'female';
  wish: 'love' | 'peace' | 'wealth' | 'clarity' = 'peace';

  months: number[] = Array.from({ length: 12 }, (_, i) => i + 1);
  years: number[] = Array.from({ length: 60 }, (_, i) => 2026 - i);

  get maxDaysInMonth(): number {
    return new Date(Number(this.birthYear), Number(this.birthMonth), 0).getDate();
  }

  get days(): number[] {
    const max = this.maxDaysInMonth;
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  onMonthOrYearChange(): void {
    this.birthDay = Number(this.birthDay);
    this.birthMonth = Number(this.birthMonth);
    this.birthYear = Number(this.birthYear);
    const max = this.maxDaysInMonth;
    if (this.birthDay > max) {
      this.birthDay = max;
    }
  }

  // Result data
  calculatedZodiac: ZodiacInfo | null = null;
  calculatedElement: ElementInfo | null = null;
  recommendedProducts: IProduct[] = [];
  savedToast = false;
  savedNotice = '';
  showAuthPromptModal = false;
  addedToast: string | null = null;

  constructor(
    private _productService: ProductService,
    private _cartService: CartService,
    public _authService: AuthService,
    private _http: HttpClient
  ) { }

  ngOnInit(): void {
    // Initial run with default date
    this.calculateMatch();
  }

  normalizeProductImage(p: IProduct): string {
    if (p.image && p.image !== 'images/lac_tay_bien.png' && !p.image.includes('lac_tay_bien')) {
      return p.image;
    }
    const name = `${p.name || ''} ${p.slug || ''}`.toLowerCase();
    if (name.includes('hơi thở biển') || (name.includes('lắc tay') && !name.includes('dây chuyền'))) {
      return 'images/lac_tay_bien.png';
    }
    if (name.includes('dây chuyền') || name.includes('day-chuyen') || name.includes('merlia') || name.includes('mặt trăng khuyết') || name.includes('giọt lệ') || name.includes('aventurine') || name.includes('amethyst tím')) {
      return (name.includes('merlia') || name.includes('giọt lệ')) ? 'images/dch_mix_da.png' : 'images/bst_dch.png';
    }
    if (name.includes('nhẫn') || name.includes('nhan') || name.includes('venus') || name.includes('citrine') || name.includes('khói lam tuyết')) {
      return name.includes('venus') ? 'images/nhan_tinh_tu.png' : 'images/bst_nhan_lg.png';
    }
    if (name.includes('bông tai') || name.includes('bong-tai') || name.includes('baroque') || name.includes('sao bạc')) {
      return 'images/bong_tai.png';
    }
    if (name.includes('quà') || name.includes('hộp nhung') || name.includes('set')) {
      return 'images/bst_set_qua.webp';
    }
    if (name.includes('vòng tay') || name.includes('vong-tay') || name.includes('fluorite') || name.includes('ngọc bích') || name.includes('hải lam')) {
      return 'images/bst_vong_tay.png';
    }
    return p.image || 'images/lac_tay_bien.png';
  }

  getFallbackRecommended(): IProduct[] {
    return [
      {
        id: '1',
        name: 'Lắc tay Hơi Thở Biển Xanh',
        slug: 'lac-tay-hoi-tho-bien-xanh',
        stone: 'Aquamarine Thiên Nhiên',
        price: 590000,
        element: this.calculatedElement?.name,
        image: 'images/lac_tay_bien.png'
      },
      {
        id: '2',
        name: 'Dây chuyền Bạc Nữ Mix Đá Merlia',
        slug: 'day-chuyen-bac-nu-mix-da-merlia',
        stone: 'Moonstone Nữ Thần',
        price: 650000,
        element: this.calculatedElement?.name,
        image: 'images/dch_mix_da.png'
      },
      {
        id: '3',
        name: 'Nhẫn Tinh Tú Venus',
        slug: 'nhan-tinh-tu-venus',
        stone: 'Thạch Anh Tự Nhiên',
        price: 450000,
        element: this.calculatedElement?.name,
        image: 'images/nhan_tinh_tu.png'
      },
      {
        id: '4',
        name: 'Bông tai Sao Bạc & Baroque',
        slug: 'bong-tai-sao-bac-baroque',
        stone: 'Ngọc Trai & Bạc',
        price: 520000,
        element: this.calculatedElement?.name,
        image: 'images/bong_tai.png'
      }
    ];
  }

  calculateMatch(): void {
    this.birthDay = Number(this.birthDay);
    this.birthMonth = Number(this.birthMonth);
    this.birthYear = Number(this.birthYear);

    const max = this.maxDaysInMonth;
    if (this.birthDay > max) {
      this.birthDay = max;
    }

    // 1. Tính Cung hoàng đạo
    this.calculatedZodiac = this.getZodiac(this.birthDay, this.birthMonth);

    // 2. Tính Ngũ hành bản mệnh theo năm sinh (Can Chi Nạp Âm)
    this.calculatedElement = this.getElement(this.birthYear);

    // 3. Tải danh sách bảo vật gợi ý tương hợp
    this._productService.getProducts().subscribe({
      next: (products) => {
        if (products && products.length > 0) {
          this.recommendedProducts = products.slice(0, 4).map(p => ({
            ...p,
            image: this.normalizeProductImage(p)
          }));
        } else {
          this.recommendedProducts = this.getFallbackRecommended();
        }
      },
      error: () => {
        this.recommendedProducts = this.getFallbackRecommended();
      }
    });

    this.step = 'result';
  }

  saveToProfile(): void {
    const zodiacStr = this.calculatedZodiac ? `${this.calculatedZodiac.name} (${this.calculatedZodiac.latin})` : '';
    const elementStr = this.calculatedElement ? this.calculatedElement.name : '';
    const dobStr = `${this.birthDay}/${this.birthMonth}/${this.birthYear}`;

    // Tạm lưu kết quả vào localStorage để đồng bộ ngay khi đăng nhập
    const resultData = {
      zodiac: zodiacStr,
      element: elementStr,
      dob: dobStr,
      wish: this.wish,
      savedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem('amules_pending_mystic_result', JSON.stringify(resultData));
    } catch (e) { }

    if (!this._authService.isLoggedIn()) {
      // Khách vãng lai chưa đăng nhập -> Hiển thị hộp thoại nhắc nhở
      this.showAuthPromptModal = true;
      return;
    }

    // Đã đăng nhập -> Cập nhật trực tiếp vào cơ sở dữ liệu
    this._http.put('/api/auth/profile', {
      zodiac: zodiacStr,
      element: elementStr,
      dob: dobStr
    }, { withCredentials: true }).subscribe({
      next: () => {
        this.savedNotice = `Đã lưu bản mệnh ${this.calculatedZodiac?.name} • ${this.calculatedElement?.name} vào hồ sơ cá nhân!`;
        this.savedToast = true;
        this._authService.checkProfile();
        setTimeout(() => (this.savedToast = false), 3500);
      },
      error: () => {
        this.savedNotice = `Đã lưu bản mệnh ${this.calculatedZodiac?.name} vào bộ nhớ thiết bị!`;
        this.savedToast = true;
        setTimeout(() => (this.savedToast = false), 3500);
      }
    });
  }

  closeAuthModal(): void {
    this.showAuthPromptModal = false;
  }

  addToCart(product: IProduct): void {
    this._cartService.addToCart({
      productId: product.id || product._id || product.slug || '',
      name: product.name,
      price: product.price,
      image: product.image || 'images/lac_tay_bien.png',
      quantity: 1,
      stone: product.stone || 'Đá tự nhiên',
      element: this.calculatedElement?.name
    }).subscribe({
      next: () => {
        this.addedToast = `Đã thêm "${product.name}" vào giỏ hàng!`;
        setTimeout(() => (this.addedToast = null), 3000);
      }
    });
  }

  resetQuiz(): void {
    this.step = 'form';
  }

  private getZodiac(day: number, month: number): ZodiacInfo {
    const d = Number(day);
    const m = Number(month);

    if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) {
      return { name: 'Bạch Dương', latin: 'Aries', icon: 'flame', element: 'Hỏa', dateRange: '21/03 - 19/04' };
    } else if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) {
      return { name: 'Kim Ngưu', latin: 'Taurus', icon: 'hexagon', element: 'Thổ', dateRange: '20/04 - 20/05' };
    } else if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) {
      return { name: 'Song Tử', latin: 'Gemini', icon: 'sun', element: 'Khí', dateRange: '21/05 - 20/06' };
    } else if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) {
      return { name: 'Cự Giải', latin: 'Cancer', icon: 'drop', element: 'Thủy', dateRange: '21/06 - 22/07' };
    } else if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) {
      return { name: 'Sư Tử', latin: 'Leo', icon: 'flame', element: 'Hỏa', dateRange: '23/07 - 22/08' };
    } else if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) {
      return { name: 'Xử Nữ', latin: 'Virgo', icon: 'sprout', element: 'Thổ', dateRange: '23/08 - 22/09' };
    } else if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) {
      return { name: 'Thiên Bình', latin: 'Libra', icon: 'sun', element: 'Khí', dateRange: '23/09 - 22/10' };
    } else if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) {
      return { name: 'Bọ Cạp', latin: 'Scorpio', icon: 'drop', element: 'Thủy', dateRange: '23/10 - 21/11' };
    } else if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) {
      return { name: 'Nhân Mã', latin: 'Sagittarius', icon: 'flame', element: 'Hỏa', dateRange: '22/11 - 21/12' };
    } else if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) {
      return { name: 'Ma Kết', latin: 'Capricorn', icon: 'hexagon', element: 'Thổ', dateRange: '22/12 - 19/01' };
    } else if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) {
      return { name: 'Bảo Bình', latin: 'Aquarius', icon: 'sun', element: 'Khí', dateRange: '20/01 - 18/02' };
    } else {
      return { name: 'Song Ngư', latin: 'Pisces', icon: 'moon', element: 'Thủy', dateRange: '19/02 - 20/03' };
    }
  }

  private getElement(year: number): ElementInfo {
    const y = Number(year);
    const cans = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'];
    const chis = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'];
    const can = cans[y % 10] || 'Giáp';
    const chi = chis[y % 12] || 'Tý';
    const canChi = `${can} ${chi}`;

    const NAP_AM: Record<string, string> = {
      'Giáp Tý': 'Hải Trung Kim', 'Ất Sửu': 'Hải Trung Kim',
      'Bính Dần': 'Lư Trung Hỏa', 'Đinh Mão': 'Lư Trung Hỏa',
      'Mậu Thìn': 'Đại Lâm Mộc', 'Kỷ Tỵ': 'Đại Lâm Mộc',
      'Canh Ngọ': 'Lộ Bàng Thổ', 'Tân Mùi': 'Lộ Bàng Thổ',
      'Nhâm Thân': 'Kiếm Phong Kim', 'Quý Dậu': 'Kiếm Phong Kim',
      'Giáp Tuất': 'Sơn Đầu Hỏa', 'Ất Hợi': 'Sơn Đầu Hỏa',
      'Bính Tý': 'Giản Hạ Thủy', 'Đinh Sửu': 'Giản Hạ Thủy',
      'Mậu Dần': 'Thành Đầu Thổ', 'Kỷ Mão': 'Thành Đầu Thổ',
      'Canh Thìn': 'Bạch Lạp Kim', 'Tân Tỵ': 'Bạch Lạp Kim',
      'Nhâm Ngọ': 'Dương Liễu Mộc', 'Quý Mùi': 'Dương Liễu Mộc',
      'Giáp Thân': 'Tuyền Trung Thủy', 'Ất Dậu': 'Tuyền Trung Thủy',
      'Bính Tuất': 'Ốc Thượng Thổ', 'Đinh Hợi': 'Ốc Thượng Thổ',
      'Mậu Tý': 'Tích Lịch Hỏa', 'Kỷ Sửu': 'Tích Lịch Hỏa',
      'Canh Dần': 'Tùng Bách Mộc', 'Tân Mão': 'Tùng Bách Mộc',
      'Nhâm Thìn': 'Trường Lưu Thủy', 'Quý Tỵ': 'Trường Lưu Thủy',
      'Giáp Ngọ': 'Sa Trung Kim', 'Ất Mùi': 'Sa Trung Kim',
      'Bính Thân': 'Sơn Hạ Hỏa', 'Đinh Dậu': 'Sơn Hạ Hỏa',
      'Mậu Tuất': 'Bình Địa Mộc', 'Kỷ Hợi': 'Bình Địa Mộc',
      'Canh Tý': 'Bích Thượng Thổ', 'Tân Sửu': 'Bích Thượng Thổ',
      'Nhâm Dần': 'Kim Bạch Kim', 'Quý Mão': 'Kim Bạch Kim',
      'Giáp Thìn': 'Phúc Đăng Hỏa', 'Ất Tỵ': 'Phúc Đăng Hỏa',
      'Bính Ngọ': 'Thiên Hà Thủy', 'Đinh Mùi': 'Thiên Hà Thủy',
      'Mậu Thân': 'Đại Trạch Thổ', 'Kỷ Dậu': 'Đại Trạch Thổ',
      'Canh Tuất': 'Thoa Xuyến Kim', 'Tân Hợi': 'Thoa Xuyến Kim',
      'Nhâm Tý': 'Tang Đố Mộc', 'Quý Sửu': 'Tang Đố Mộc',
      'Giáp Dần': 'Đại Khê Thủy', 'Ất Mão': 'Đại Khê Thủy',
      'Bính Thìn': 'Sa Trung Thổ', 'Đinh Tỵ': 'Sa Trung Thổ',
      'Mậu Ngọ': 'Thiên Thượng Hỏa', 'Kỷ Mùi': 'Thiên Thượng Hỏa',
      'Canh Thân': 'Thạch Lựu Mộc', 'Tân Dậu': 'Thạch Lựu Mộc',
      'Nhâm Tuất': 'Đại Hải Thủy', 'Quý Hợi': 'Đại Hải Thủy'
    };
    const napAm = NAP_AM[canChi] || '';

    // Can: Giap/At=1, Binh/Dinh=2, Mau/Ky=3, Canh/Tan=4, Nham/Quy=5
    const canVal: { [key: number]: number } = {
      4: 1, 5: 1, // Giap, At
      6: 2, 7: 2, // Binh, Dinh
      8: 3, 9: 3, // Mau, Ky
      0: 4, 1: 4, // Canh, Tan
      2: 5, 3: 5  // Nham, Quy
    };
    const lastDigit = y % 10;
    const canScore = canVal[lastDigit] || 1;

    // Chi: Ty/Suu/Ngo/Mui=0, Dan/Mao/Than/Dau=1, Thin/Ty/Tuat/Hoi=2
    const chiRem = y % 12;
    let chiScore = 0;
    if ([4, 5, 10, 11].includes(chiRem)) chiScore = 0;
    else if ([6, 7, 0, 1].includes(chiRem)) chiScore = 1;
    else chiScore = 2;

    let sum = canScore + chiScore;
    if (sum > 5) sum -= 5;

    // 1: Kim, 2: Thuy, 3: Hoa, 4: Tho, 5: Moc
    switch (sum) {
      case 1:
        return {
          name: `Mệnh Kim (${napAm ? napAm + ' - ' : ''}Năm ${canChi})`,
          title: 'Sáng Suốt, Minh Triết & Khởi Đầu Mới',
          desc: 'Người mệnh Kim mang bản tính cương trực, sắc sảo và ý chí kiên định. Bạn cần năng lượng nuôi dưỡng sự mềm mại và thu hút tài khí.',
          colors: ['Trắng', 'Xám bạc', 'Vàng ánh kim', 'Nâu đất (Tương sinh)'],
          contrastColors: ['Đỏ', 'Hồng', 'Tím đậm'],
          luckyStones: ['Thạch Anh Trắng', 'Moonstone Ánh Trăng', 'Mắt Hổ Vàng'],
          affirmation: '“Tâm trí tôi sáng trong, định tĩnh và thu hút mọi điều thanh khiết.”'
        };
      case 2:
        return {
          name: `Mệnh Thủy (${napAm ? napAm + ' - ' : ''}Năm ${canChi})`,
          title: 'Trực Giác Sâu Sắc, Linh Hoạt & Dòng Chảy An Nhiên',
          desc: 'Người mệnh Thủy uyển chuyển, thấu hiểu và nhạy cảm trước vạn vật. Bạn tương hợp với những viên đá xoa dịu tâm trí và chữa lành xúc cảm.',
          colors: ['Xanh dương', 'Đen huyền', 'Trắng bạc (Tương sinh)'],
          contrastColors: ['Vàng đậm', 'Nâu đất'],
          luckyStones: ['Aquamarine', 'Moonstone Giọt Nước', 'Thạch Anh Đen'],
          affirmation: '“Tôi hòa hợp cùng dòng chảy tự nhiên, bình an và luôn được che chở.”'
        };
      case 3:
        return {
          name: `Mệnh Hỏa (${napAm ? napAm + ' - ' : ''}Năm ${canChi})`,
          title: 'Nhiệt Huyết, Tỏa Sáng & Sức Hút Bản Lĩnh',
          desc: 'Người mệnh Hỏa ấm áp, tràn đầy đam mê và năng lượng tích cực. Bạn cần tinh thể làm dịu nhiệt lượng thừa và giữ tâm thế thăng bằng.',
          colors: ['Hồng pastel', 'Đỏ ruby', 'Tím thạch anh', 'Xanh lá (Tương sinh)'],
          contrastColors: ['Đen', 'Xanh biển sẫm'],
          luckyStones: ['Thạch Anh Hồng', 'Garnet Ngọc Hồng Lựu', 'Ruby Thiên Nhiên'],
          affirmation: '“Ngọn lửa trong tôi ấm áp, nuôi dưỡng tình yêu thương và sự thấu suốt.”'
        };
      case 4:
        return {
          name: `Mệnh Thổ (${napAm ? napAm + ' - ' : ''}Năm ${canChi})`,
          title: 'Vững Chãi, Bao Dung & Thịnh Vượng Trường Tồn',
          desc: 'Người mệnh Thổ chân thành, đáng tin cậy và là điểm tựa vững chãi. Bạn hòa hợp nhất với tinh thể vượng tài, tích lũy may mắn và bảo bọc.',
          colors: ['Vàng hổ phách', 'Nâu đất', 'Hồng ruby (Tương sinh)'],
          contrastColors: ['Xanh lá chuối'],
          luckyStones: ['Citrine Thạch Anh Vàng', 'Mắt Hổ Hoàng Gia', 'Hổ Phách'],
          affirmation: '“Tôi đứng vững giữa đất trời, nuôi dưỡng phúc lành và bình an viên mãn.”'
        };
      default:
        return {
          name: `Mệnh Mộc (${napAm ? napAm + ' - ' : ''}Năm ${canChi})`,
          title: 'Tái Sinh, Trưởng Thành & Sinh Khí Dồi Dào',
          desc: 'Người mệnh Mộc giàu lòng trắc ẩn, hào phóng và luôn hướng về sự phát triển. Năng lượng đá quý giúp bạn hồi sinh sinh khí và kết nối thiện lành.',
          colors: ['Xanh lục ngọc', 'Xanh lam biển (Tương sinh)', 'Đen'],
          contrastColors: ['Trắng tinh khiết', 'Bạc sáng'],
          luckyStones: ['Cẩm Thạch Tự Nhiên', 'Aventurine Thạch Anh Xanh', 'Peridot'],
          affirmation: '“Tâm hồn tôi xanh tươi, lớn mạnh và tỏa bóng mát dịu lành cho cuộc đời.”'
        };
    }
  }
}

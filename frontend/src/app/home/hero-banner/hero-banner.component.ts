import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

interface HeroSlide {
  id: number;
  chip: string;
  titleLine1: string;
  titleLine2: string;   // dòng in nghiêng
  desc: string;
  cta1: string;
  cta1Link: string;
  cta2: string;
  cta2Link: string;
  image: string;
  featured: { label: string; name: string; price: number; oldPrice: number; slug: string };
}

@Component({
  selector: 'app-hero-banner',
  standalone: false,
  templateUrl: './hero-banner.component.html',
  styleUrl: './hero-banner.component.css'
})
export class HeroBannerComponent implements OnInit, OnDestroy {
  slides: HeroSlide[] = [
    {
      id: 1, chip: 'AMULES – Beauty in every stone',
      titleLine1: 'Một nét chạm,', titleLine2: 'một câu chuyện riêng',
      desc: 'Khám phá trang sức đá tinh tế, mang dấu ấn cá nhân và nguồn cảm hứng dịu dàng cho tâm hồn bạn. Mỗi thiết kế là một lá bùa nâng niu vẻ đẹp nội tại thuần khiết.',
      cta1: 'Khám phá bộ sưu tập', cta1Link: '/collections',
      cta2: 'Tìm viên đá dành cho bạn', cta2Link: '/mystic-match',
      image: 'images/dch_mix_da.png',
      featured: {
        label: 'Tác phẩm biểu tượng',
        name: 'Dây chuyền Bạc Nữ Mix Đá Merlia',
        price: 650000,
        oldPrice: 780000,
        slug: 'day-chuyen-bac-nu-mix-da-merlia'
      }
    },
    {
      id: 2, chip: 'Mystic Match – Đá hợp mệnh',
      titleLine1: 'Đá hợp mệnh,', titleLine2: 'năng lượng riêng bạn',
      desc: 'Làm bài trắc nghiệm 60 giây để tìm viên đá đồng điệu với ngũ hành, cung hoàng đạo và điều bạn đang mong cầu trong cuộc sống.',
      cta1: 'Làm bài trắc nghiệm', cta1Link: '/mystic-match',
      cta2: 'Xem đá theo mệnh', cta2Link: '/themes',
      image: 'images/nhan_tinh_tu.png',
      featured: {
        label: 'Được yêu thích nhất',
        name: 'Nhẫn Tinh Tú Venus Thạch Anh Hồng',
        price: 450000,
        oldPrice: 520000,
        slug: 'nhan-tinh-tu-venus'
      }
    },
    {
      id: 3, chip: 'Bộ sưu tập Moon & Stars',
      titleLine1: 'Ánh trăng thì thầm,', titleLine2: 'bên cổ tay bạn',
      desc: 'Cảm hứng từ chu kỳ trăng tròn và 12 chòm sao, bộ sưu tập giới hạn dành cho những tâm hồn mơ mộng và trực giác nhạy bén.',
      cta1: 'Khám phá Moon & Stars', cta1Link: '/collections',
      cta2: 'Xem tất cả bộ sưu tập', cta2Link: '/collections',
      image: 'images/lac_tay_bien.png',
      featured: {
        label: 'Bộ sưu tập mới',
        name: 'Lắc tay Hơi Thở Biển Xanh',
        price: 590000,
        oldPrice: 690000,
        slug: 'lac-tay-hoi-tho-bien-xanh'
      }
    }
  ];

  current = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly INTERVAL = 5000;

  constructor(private _cdr: ChangeDetectorRef) { }

  // Lifecycle hook: bắt đầu tự chạy khi component được tạo, dừng khi bị hủy
  ngOnInit(): void { this.start(); }
  ngOnDestroy(): void { this.stop(); }

  start(): void {
    this.stop();
    this.timer = setInterval(() => this.next(), this.INTERVAL);
  }
  stop(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  next(): void {
    this.current = (this.current + 1) % this.slides.length;
    this._cdr.detectChanges();
  }
  prev(): void {
    this.current = (this.current - 1 + this.slides.length) % this.slides.length;
    this._cdr.detectChanges();
  }
  goTo(i: number): void { this.current = i; }
}

import { Component, OnInit } from '@angular/core';
import { MasterDataService } from '../../services/master-data.service';

interface VoucherItem {
  id: string;
  statusKey: 'available' | 'used' | 'locked';
  topBadge: string;
  expiry: string;
  boxTitle: string;
  boxSub: string;
  title: string;
  desc: string;
  code: string;
  ctaLabel: string;
  isGold?: boolean;
}

@Component({
  selector: 'app-rewards',
  standalone: false,
  templateUrl: './rewards.component.html',
  styleUrl: './rewards.component.css'
})
export class RewardsComponent implements OnInit {
  voucherTab = 'all';
  copiedCode = '';

  vouchers: VoucherItem[] = [
    {
      id: 'v1',
      statusKey: 'available',
      topBadge: 'CÓ THỂ SỬ DỤNG',
      expiry: 'Hạn dùng: 15/11/2025',
      boxTitle: '100k',
      boxSub: 'GIẢM TRỰC TIẾP',
      title: 'Giảm 100.000đ cho đơn từ 1.000.000đ',
      desc: 'Áp dụng cho tất cả tuyệt tác trang sức chế tác từ đá Sapphire, Thạch Anh Hồng và Bạc 925 nguyên bản.',
      code: 'AMULESLOVE',
      ctaLabel: 'Mua sắm ngay'
    },
    {
      id: 'v2',
      statusKey: 'available',
      topBadge: 'ĐẶC QUYỀN SINH NHẬT',
      expiry: 'Hạn dùng: 30/11/2025',
      boxTitle: 'QUÀ TẶNG',
      boxSub: 'VIP GIFT',
      title: 'Tặng Hộp quà nhung cao cấp & Khăn lau bạc',
      desc: 'Bộ phụ kiện bảo quản đá quý chuyên dụng trị giá 150.000đ. Áp dụng cho bất kỳ đơn đặt hàng trong tháng sinh nhật.',
      code: 'VIPBIRTHDAY',
      ctaLabel: 'Đổi quà ngay',
      isGold: true
    },
    {
      id: 'v3',
      statusKey: 'used',
      topBadge: 'ĐÃ SỬ DỤNG',
      expiry: 'Áp dụng ngày: 02/08/2025',
      boxTitle: '50k',
      boxSub: 'ĐÃ DÙNG',
      title: 'Giảm 50.000đ cho đơn hàng đầu tiên',
      desc: 'Ưu đãi chào thành viên mới đã được khấu trừ tại đơn hàng #AMU-2025-6204.',
      code: 'WELCOME50',
      ctaLabel: 'Đã hoàn thành lượt dùng'
    },
    {
      id: 'v4',
      statusKey: 'locked',
      topBadge: 'SẮP MỞ KHÓA',
      expiry: 'Chỉ còn 250 LT',
      boxTitle: 'VIP',
      boxSub: 'CELESTIAL',
      title: 'Miễn phí thanh tẩy & nạp năng lượng trọn đời',
      desc: 'Đặc quyền tham gia trà đàm phong thủy ngũ hành trực tiếp cùng chuyên gia đá quý AMULES mỗi quý.',
      code: 'Tự động kích hoạt khi đạt hạng Kim Cương',
      ctaLabel: 'Tìm hiểu quyền lợi'
    }
  ];

  history = [
    {
      date: '28/10/2025',
      time: '14:32:10',
      title: 'Tích điểm từ đơn hàng giao hỏa tốc',
      sub: 'Vòng Tay Thạch Anh Dâu Tây & Charm Vàng 18K',
      orderCode: '#AMU-2025-8942',
      delta: '+120 LT',
      balance: '1.250 LT'
    },
    {
      date: '15/09/2025',
      time: '10:18:45',
      title: 'Tích điểm từ đơn hàng thành công',
      sub: 'Dây Chuyền Mặt Trăng Ngọc Lam (Turquoise Charm)',
      orderCode: '#AMU-2025-7810',
      delta: '+49 LT',
      balance: '1.130 LT'
    },
    {
      date: '02/08/2025',
      time: '16:04:12',
      title: 'Tích điểm từ đơn hàng chào mừng',
      sub: 'Nhẫn Đá Mắt Hổ Khắc Biểu Tượng Thái Cực',
      orderCode: '#AMU-2025-6204',
      delta: '+48 LT',
      balance: '1.081 LT'
    },
    {
      date: '01/08/2025',
      time: '09:00:00',
      title: 'Tặng thưởng đăng ký tài khoản mới',
      sub: 'Quà tặng hội viên khởi đầu hành trình AMULES',
      orderCode: '—',
      delta: '+1.033 LT',
      balance: '1.033 LT'
    }
  ];

  constructor(private _masterData: MasterDataService) {}

  ngOnInit(): void {
    this._masterData.getVouchers().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          // Merge API vouchers with local schema
          const apiVouchers: VoucherItem[] = data.map((v: any, index: number) => ({
            id: v._id || `v_api_${index}`,
            statusKey: (v.status || v.statusKey || 'available') as any,
            topBadge: v.topBadge || (v.discountPercent ? `GIẢM ${v.discountPercent}%` : 'ƯU ĐÃI'),
            expiry: v.expiry || 'Hạn dùng: 31/12/2026',
            boxTitle: v.boxTitle || (v.discountPercent ? `${v.discountPercent}%` : `${(v.discountAmount || 50000)/1000}k`),
            boxSub: v.boxSub || 'GIẢM GIÁ',
            title: v.title || v.name || 'Mã ưu đãi phong thủy AMULES',
            desc: v.desc || v.description || 'Áp dụng cho mọi đơn hàng đá quý phong thủy.',
            code: v.code || 'AMULES',
            ctaLabel: v.ctaLabel || 'Sử dụng ngay',
            isGold: index % 2 === 1
          }));
          this.vouchers = apiVouchers;
        }
      },
      error: () => {}
    });
  }

  get filteredVouchers(): VoucherItem[] {
    if (this.voucherTab === 'all') return this.vouchers;
    if (this.voucherTab === 'available') {
      return this.vouchers.filter(v => v.statusKey === 'available');
    }
    return this.vouchers.filter(v => v.statusKey !== 'available');
  }

  copyCode(code: string) {
    navigator.clipboard?.writeText(code);
    this.copiedCode = code;
    setTimeout(() => (this.copiedCode = ''), 2000);
  }
}

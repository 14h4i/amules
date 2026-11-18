import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  year = new Date().getFullYear();
  email = '';
  joined = false;

  columns = [
    {
      title: 'Cửa hàng',
      links: [
        { label: 'Nhẫn đá quý', route: '/products', query: { cat: 'rings' } },
        { label: 'Vòng tay phong thủy', route: '/products', query: { cat: 'bracelets' } },
        { label: 'Dây chuyền bùa hộ mệnh', route: '/products', query: { cat: 'necklaces' } },
        { label: 'Bông tai ngọc bích & thạch anh', route: '/products', query: { cat: 'earrings' } },
        { label: 'Charm năng lượng', route: '/products', query: { cat: 'charms' } },
        { label: 'Bộ sưu tập độc bản', route: '/collections' }
      ]
    },
    {
      title: 'Khám phá & Trải nghiệm',
      links: [
        { label: 'Mystic Match Ngũ Hành', route: '/mystic-match' },
        { label: 'Cung hoàng đạo & Hành tinh', route: '/mystic-match' },
        { label: 'Cẩm nang thanh tẩy & nạp đá', route: '/articles' },
        { label: 'Bộ sưu tập Moon & Stars', route: '/collections' },
        { label: 'Kiến thức phân loại đá tự nhiên', route: '/articles' }
      ]
    },
    {
      title: 'Hỗ trợ khách hàng',
      links: [
        { label: 'Tra cứu đơn hàng vãng lai', route: '/order-lookup' },
        { label: 'Chính sách đổi trả 7 ngày', route: '/about' },
        { label: 'Bảo hành trọn đời & xỏ lại dây', route: '/about' },
        { label: 'Hướng dẫn đo kích cỡ vòng & nhẫn', route: '/about' },
        { label: 'Chính sách vận chuyển & kiểm hàng', route: '/about' },
        { label: 'Câu hỏi thường gặp (FAQ)', route: '/about' }
      ]
    }
  ];

  socials = [
    { icon: 'globe', url: 'https://amules.vn' },
    { icon: 'camera', url: 'https://instagram.com' },
    { icon: 'play', url: 'https://youtube.com' },
    { icon: 'pin', url: 'https://pinterest.com' }
  ];

  payments = ['VISA', 'MASTERCARD', 'MOMO', 'VNPAY', 'COD'];

  join() {
    if (this.email.includes('@')) { this.joined = true; }
  }
}

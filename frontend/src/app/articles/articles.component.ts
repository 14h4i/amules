import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

const FALLBACK_ARTICLES = [
  {
    _id: "57a588d4105f6583d7fb1825",
    title: "Moonstone: Vẻ đẹp dịu dàng và năng lượng soi dưỡng tâm hồn",
    slug: "moonstone-ve-dep-an-nhien",
    content: `Đá Mặt Trăng (Moonstone) từ lâu đã được coi là viên ngọc bảo hộ của trực giác, sự dịu êm và tính nữ thiêng liêng. Ánh xà cừ huyền ảo như ánh trăng rằm phản chiếu trên mặt nước đem lại cảm giác bình yên sâu thẳm trong tâm hồn.

Khi đeo trang sức Moonstone, viên đá giúp cân bằng cảm xúc, xua tan căng thẳng và khơi gợi năng lượng thấu cảm. Đặc biệt trong những chu kỳ trăng tròn, Moonstone giúp thanh lọc hào quang và nạp lại tần số rung động tích cực cho chủ nhân.

Hãy đeo một chiếc nhẫn hoặc lắc tay Moonstone bên tay trái để đón nhận năng lượng tĩnh lặng, hoặc bên tay phải khi bạn mong muốn lan tỏa sự ấm áp và sự thấu suốt đến mọi người xung quanh.`,
    excerpt: "Khám phá huyền thoại về đá Mặt Trăng cùng tần số năng lượng xoa dịu tâm trí và đánh thức trực giác nội tại.",
    thumbnail: "https://i.pinimg.com/736x/8c/01/6d/8c016d17da264368845d7d7ae0ad195a.jpg",
    image: "https://i.pinimg.com/736x/8c/01/6d/8c016d17da264368845d7d7ae0ad195a.jpg",
    category: "Kiến thức đá",
    readTime: "5 phút đọc",
    author: "Chuyên gia Ngọc học AMULES",
    date: "20 Tháng 10, 2026"
  },
  {
    _id: "40a1a9c9997a2dfc53e009fc",
    title: "5 bước thanh tẩy và nạp năng lượng tâm đá quý tại nhà",
    slug: "5-buoc-thanh-tay-nap-nang-luong",
    content: `Mỗi tinh thể đá tự nhiên đều là một bộ lưu trữ và khuếch đại năng lượng. Trong quá trình tương tác với môi trường bên ngoài, đá sẽ hấp thụ một phần từ trường xung quanh. Vì vậy, việc thanh tẩy định kỳ là nghi thức quan trọng để phục hồi độ tinh khiết nguyên bản cho bảo vật của bạn.

1. Thanh tẩy bằng khói trầm hương hoặc thảo mộc xô thơm: Hơ nhẹ trang sức qua làn khói trong 2-3 phút, tập trung vào ý niệm thanh sạch.
2. Tắm ánh trăng rằm: Đặt bảo vật dưới ánh sáng trăng rằm qua đêm để hấp thụ tần số tái sinh dịu êm của thiên thể.
3. Rung chuông xoay Tây Tạng: Sử dụng âm thoa hoặc chuông xoay Tây Tạng để sóng âm thuần khiết làm rung chuyển và gột rửa tạp khí.
4. Đặt trên cụm Thạch Anh Trắng: Cụm tinh thể thạch anh trắng tự nhiên đóng vai trò như một trạm sạc năng lượng mạnh mẽ.
5. Thiết lập chủ đích tâm thức: Giữ đá trong lòng bàn tay và gửi gắm lời nguyện ước về bình an và thịnh vượng.`,
    excerpt: "Hướng dẫn chi tiết quy trình thanh tẩy và đánh thức tần số rung động thuần khiết cho trang sức đá phong thủy.",
    thumbnail: "https://i.pinimg.com/736x/65/12/56/6512568af032cfb982e96c42c6218599.jpg",
    image: "https://i.pinimg.com/736x/65/12/56/6512568af032cfb982e96c42c6218599.jpg",
    category: "Chăm sóc đá",
    readTime: "4 phút đọc",
    author: "Nghệ nhân Phong thủy AMULES",
    date: "18 Tháng 10, 2026"
  },
  {
    _id: "eb6ebf06f72a510607fc461e",
    title: "Cách phối trang sức tự nhiên tinh tế cho phong cách hằng ngày",
    slug: "cach-phoi-trang-suc",
    content: `Trang sức đá quý tự nhiên không chỉ mang ý nghĩa bảo bọc tâm linh mà còn là tuyên ngôn phong cách cá nhân tinh tế. Nghệ thuật phối trang sức đá quý hiện đại hướng tới sự tối giản, thanh lịch nhưng vẫn toát lên khí chất quý phái độc bản.

Nguyên tắc vàng khi phối đồ:
- Chọn một món trang sức làm tiêu điểm: Nếu bạn đeo một chiếc vòng cổ đính đá bản lớn, hãy tiết chế ở khuyên tai và nhẫn nhỏ thanh mảnh.
- Đồng điệu về sắc độ năng lượng: Kết hợp đá theo ngũ hành tương sinh (như Aquamarine Thủy cùng Moonstone Kim) giúp tổng thể hài hòa về cả thẩm mỹ lẫn trường khí.
- Layering nhẫn hoặc dây chuyền mỏng: Tạo điểm nhấn tinh tế bằng cách xếp tầng 2-3 sợi dây chuyền có độ dài khác nhau.`,
    excerpt: "Bí quyết kết hợp hài hòa giữa năng lượng phong thủy và tính thẩm mỹ thời thượng trong trang phục thường nhật.",
    thumbnail: "https://i.pinimg.com/736x/b5/03/40/b50340697147b14ca4fd8f6b815bf8aa.jpg",
    image: "https://i.pinimg.com/736x/b5/03/40/b50340697147b14ca4fd8f6b815bf8aa.jpg",
    category: "Phối đồ phong cách",
    readTime: "6 phút đọc",
    author: "Stylist AMULES Atelier",
    date: "15 Tháng 10, 2026"
  }
];

@Component({
  selector: 'app-articles',
  standalone: false,
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.css'
})
export class ArticlesComponent implements OnInit {
  articles: any[] = FALLBACK_ARTICLES;
  selectedArticle: any = null;
  loading = false;
  private _routeSlug = '';

  constructor(
    private _route: ActivatedRoute,
    private _http: HttpClient,
    private _cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      this._routeSlug = (params['slug'] || '').toLowerCase();
      this.checkSelectedArticle();
      this._cdr.detectChanges();
    });

    this.fetchArticles();
  }

  fetchArticles(): void {
    this.loading = true;
    this._http.get<any[]>('/api/articles').subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.articles = data.map(a => ({
            ...a,
            image: a.image || a.thumbnail || 'https://i.pinimg.com/736x/8c/01/6d/8c016d17da264368845d7d7ae0ad195a.jpg',
            thumbnail: a.thumbnail || a.image || 'https://i.pinimg.com/736x/8c/01/6d/8c016d17da264368845d7d7ae0ad195a.jpg',
            category: a.category || a.tag || 'CẨM NANG NĂNG LƯỢNG',
            readTime: a.readTime || a.read || '5 phút đọc',
            excerpt: a.excerpt || a.summary || a.description || 'Khám phá ý nghĩa tâm linh và năng lượng thiên thể cùng AMULES.',
            content: a.content || a.excerpt || a.summary || ''
          }));
        } else if (!this.articles || this.articles.length === 0) {
          this.articles = FALLBACK_ARTICLES;
        }
        this.checkSelectedArticle();
        this.loading = false;
        this._cdr.detectChanges();
      },
      error: () => {
        if (!this.articles || this.articles.length === 0) {
          this.articles = FALLBACK_ARTICLES;
        }
        this.checkSelectedArticle();
        this.loading = false;
        this._cdr.detectChanges();
      }
    });
  }

  private checkSelectedArticle(): void {
    if (!this._routeSlug) return;
    const found = this.articles.find(a =>
      (a.slug || '').toLowerCase() === this._routeSlug ||
      (a._id && a._id.toString() === this._routeSlug)
    );
    if (found) {
      this.selectedArticle = found;
    }
  }

  readArticle(a: any): void {
    this.selectedArticle = a;
    this._cdr.detectChanges();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToList(): void {
    this.selectedArticle = null;
    this._cdr.detectChanges();
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-articles',
  standalone: false,
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.css'
})
export class ArticlesComponent implements OnInit {
  articles: any[] = [];
  selectedArticle: any = null;
  loading = true;

  constructor(
    private _route: ActivatedRoute,
    private _http: HttpClient
  ) { }

  ngOnInit(): void {
    let routeSlug = '';
    this._route.params.subscribe(params => {
      routeSlug = (params['slug'] || '').toLowerCase();
      if (routeSlug && this.articles.length > 0) {
        const found = this.articles.find(a => (a.slug || '').toLowerCase() === routeSlug || (a._id && a._id === routeSlug));
        if (found) this.selectedArticle = found;
      }
    });

    this._http.get<any[]>('/api/articles').subscribe({
      next: (data) => {
        this.articles = (data && data.length > 0) ? data : this.getFallbackArticles();
        if (routeSlug) {
          const found = this.articles.find(a => (a.slug || '').toLowerCase() === routeSlug || (a._id && a._id === routeSlug));
          if (found) this.selectedArticle = found;
        }
        this.loading = false;
      },
      error: () => {
        this.articles = this.getFallbackArticles();
        if (routeSlug) {
          const found = this.articles.find(a => (a.slug || '').toLowerCase() === routeSlug);
          if (found) this.selectedArticle = found;
        }
        this.loading = false;
      }
    });
  }

  readArticle(a: any): void {
    this.selectedArticle = a;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToList(): void {
    this.selectedArticle = null;
  }

  private getFallbackArticles(): any[] {
    return [
      {
        title: 'Moonstone: Vẻ đẹp dịu dàng và năng lượng soi dưỡng tâm hồn',
        slug: 'moonstone-ve-dep-an-nhien',
        excerpt: 'Được mệnh danh là viên ngọc ánh trăng, Moonstone mang tần số an dịu giúp nuôi dưỡng trực giác và xua tan căng thẳng mệt mỏi.',
        category: 'KIẾN THỨC ĐÁ QUÝ',
        readTime: '5 phút đọc',
        image: 'https://i.pinimg.com/736x/8b/56/4e/8b564e66f5a26e5a7761873879e15a44.jpg',
        content: `Moonstone (Đá Mặt Trăng) là một trong những loại đá quý tự nhiên sở hữu hiện tượng quang học adularescence kỳ diệu — ánh sáng lung linh gợn sóng như ánh trăng dưới mặt nước hồ thu.\n\nTheo chiêm tinh học phương Tây và phong thủy phương Đông, Moonstone liên kết mật thiết với năng lượng Mặt Trăng (Thái Âm) và luân xa vương miện. Viên đá có khả năng làm dịu cảm xúc dâng trào, tăng cường trực giác tâm linh và mang lại giấc ngủ an lành cho chủ nhân.`
      },
      {
        title: '5 bước thanh tẩy và nạp năng lượng tâm đá quý tại nhà',
        slug: '5-buoc-thanh-tay-nap-nang-luong',
        excerpt: 'Hướng dẫn chi tiết quy trình xông trầm, ngâm muối biển và phơi trăng rằm để phục hồi tần số nguyên bản cho bùa hộ mệnh.',
        category: 'HƯỚNG DẪN BẢO QUẢN',
        readTime: '7 phút đọc',
        image: 'https://i.pinimg.com/736x/8b/56/4e/8b564e66f5a26e5a7761873879e15a44.jpg',
        content: `Mỗi ngày, đá quý tự nhiên hấp thu các trường năng lượng từ môi trường xung quanh bạn. Việc thanh tẩy định kỳ giúp loại bỏ năng lượng trì trệ và tái kích hoạt luồng sinh khí tích cực.\n\n1. Xông khói bằng trầm hương tự nhiên hoặc xô thơm trắng (White Sage).\n2. Đặt đá dưới ánh trăng rằm (Full Moon Bathing) từ 8 giờ tối đến sáng hôm sau.\n3. Dùng âm thanh chuông xoay Tây Tạng (Singing Bowl) với tần số 432Hz hoặc 528Hz.\n4. Đặt cạnh cụm tinh thể thạch anh trắng tự nhiên.\n5. Đặt ý niệm và thông điệp may mắn mới vào viên đá.`
      },
      {
        title: 'Cách phối trang sức tự nhiên tinh tế cho phong cách hằng ngày',
        slug: 'cach-phoi-trang-suc',
        excerpt: 'Bí quyết kết hợp vòng tay phong thủy cùng dây chuyền bạc 925 tạo điểm nhấn thanh lịch mà vẫn đảm bảo nguyên lý ngũ hành.',
        category: 'PHONG CÁCH SỐNG',
        readTime: '4 phút đọc',
        image: 'https://i.pinimg.com/736x/8b/56/4e/8b564e66f5a26e5a7761873879e15a44.jpg',
        content: `Trang sức phong thủy ngày nay không chỉ là vật phẩm hộ mệnh thiêng liêng mà còn là tuyên ngôn phong cách cá nhân tinh tế.\n\nBằng cách kết hợp giữa chất liệu bạc cao cấp S925 và đá quý thiên nhiên có sắc độ tương đồng, bạn vừa tạo nên một tổng thể trang phục hài hòa, vừa kích hoạt trường năng lượng tương sinh theo cung mệnh của mình.`
      }
    ];
  }
}

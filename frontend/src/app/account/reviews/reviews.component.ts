import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reviews',
  standalone: false,
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.css'
})
export class ReviewsComponent implements OnInit {
  activeTab: 'pending' | 'submitted' = 'pending';
  rating = 5;
  reviewTitle = 'Bảo vật dịu êm, đóng gói rất tinh tế';
  reviewContent =
    'Đá thạch anh hồng rất bóng mịn, charm trái tim nhỏ xinh xắn. Mùi thơm thảo mộc thanh tẩy thơm dễ chịu, mình đeo đi làm cả ngày thấy tâm trạng rất an yên.';
  submittedSuccess = false;
  submitting = false;

  ratingLabels: Record<number, string> = {
    1: '1 sao - Cần cải thiện',
    2: '2 sao - Tạm ổn',
    3: '3 sao - Hài lòng',
    4: '4 sao - Rất tốt',
    5: '5 sao - Tuyệt vời'
  };

  submittedReviews = [
    {
      productName: 'Vòng Tay Nguyệt Quang Moonstone Ánh Lam S925',
      image: 'images/lac_tay_bien.png',
      date: '29/10/2025',
      stars: 5,
      quote:
        '“Đá ánh lam siêu thực dưới ánh trăng, size 14.5cm vừa khít cổ tay. Rất hài lòng với dịch vụ tư vấn mệnh Thủy của AMULES!”',
      helpfulCount: 14
    },
    {
      productName: 'Dây Chuyền Trầm Thủy Aquamarine Biển Sâu',
      image: 'images/dch_mix_da.png',
      date: '18/09/2025',
      stars: 5,
      quote: '“Mặt đá cắt facet giọt lệ tinh xảo, xích bạc Ý sáng bóng không gây ngứa cổ.”',
      helpfulCount: 8
    }
  ];

  constructor(private _http: HttpClient) {}

  ngOnInit(): void {
    this._http.get<any[]>('/api/reviews', { withCredentials: true }).subscribe({
      next: (list) => {
        if (list && list.length > 0) {
          const mapped = list.map(r => ({
            productName: r.productName || 'Bảo vật phong thủy AMULES',
            image: r.image || 'images/lac_tay_bien.png',
            date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '29/10/2025',
            stars: r.stars || r.rating || 5,
            quote: `“${r.content || r.quote || r.title || 'Sản phẩm tuyệt vời!'}”`,
            helpfulCount: r.helpfulCount || 0
          }));
          this.submittedReviews = [...mapped, ...this.submittedReviews];
        }
      },
      error: () => {}
    });
  }

  setRating(star: number) {
    this.rating = star;
  }

  submitReview() {
    if (!this.reviewContent.trim()) return;
    this.submitting = true;

    const payload = {
      productName: 'Lắc Tay Nàng Thơ Thạch Anh Hồng Madagascar',
      rating: this.rating,
      title: this.reviewTitle,
      content: this.reviewContent,
      image: 'images/bong_tai.png'
    };

    this._http.post<any>('/api/reviews', payload, { withCredentials: true }).subscribe({
      next: () => {
        this.submitting = false;
        this.submittedReviews.unshift({
          productName: payload.productName,
          image: payload.image,
          date: 'Hôm nay',
          stars: this.rating,
          quote: `“${this.reviewContent}”`,
          helpfulCount: 1
        });
        this.submittedSuccess = true;
      },
      error: () => {
        this.submitting = false;
        this.submittedReviews.unshift({
          productName: payload.productName,
          image: payload.image,
          date: 'Hôm nay',
          stars: this.rating,
          quote: `“${this.reviewContent}”`,
          helpfulCount: 1
        });
        this.submittedSuccess = true;
      }
    });
  }
}